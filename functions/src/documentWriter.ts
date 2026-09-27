import { createHash } from 'crypto';
import { Firestore, Timestamp } from 'firebase-admin/firestore';

// Date values are stored as Firestore timestamps. Compare at stored precision,
// with stable map keys; array order is meaningful and must be preserved.
function canonical(value: any): any {
  if (value instanceof Date) value = Timestamp.fromDate(value);
  if (value instanceof Timestamp) return ['timestamp', value.seconds, Math.floor(value.nanoseconds / 1000)];
  if (Array.isArray(value)) return ['array', value.map(canonical)];
  if (value !== null && typeof value === 'object') {
    return ['map', Object.keys(value).sort().map(key => [key, canonical(value[key])])];
  }
  if (value === undefined) throw new Error('Undefined value in import document');
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Non-finite number in import document');
  return [typeof value, value];
}

export function documentHash(data: any): string {
  return createHash('sha256').update(JSON.stringify(canonical(data))).digest('hex');
}

/** The completion fingerprint is published only after all writes succeed. */
export async function writeDocuments(
  db: Firestore, seasonPath: string, documents: Map<string, any>,
  options: { verifyDocuments?: boolean; now?: Date } = {},
) {
  const entries = [...documents].sort(([a], [b]) => a.localeCompare(b));
  if (entries.some(([path]) => !path.startsWith(`${seasonPath}/`))) throw new Error('Document outside target season');
  // Validate every document before making any writes.
  const hashes = entries.map(([path, data]) => [path, documentHash(data)]);
  const fingerprint = documentHash(hashes);
  const root = db.doc(seasonPath);
  const previous = await root.get();
  let reads = 1, writes = 0;
  if (!options.verifyDocuments && !previous.data()?.importPending && previous.data()?.importFingerprint === fingerprint && previous.data()?.lastUpdate) {
    return { reads, writes, unchanged: true };
  }
  let pending = false;
  for (let i = 0; i < entries.length; i++) {
    const [path, data] = entries[i];
    const ref = db.doc(path);
    const existing = await ref.get();
    reads++;
    if (!existing.exists || documentHash(existing.data()) !== hashes[i][1]) {
      if (!pending) {
        // Invalidate the fast path before changing any data. A failed import
        // must also recover when the next source reverts to the old content.
        await root.set({ importPending: true }, { merge: true });
        writes++;
        pending = true;
      }
      await ref.set(data);
      writes++;
    }
  }
  if (writes || previous.data()?.importPending || previous.data()?.importFingerprint !== fingerprint || !previous.data()?.lastUpdate) {
    const lastUpdate = writes || previous.data()?.importPending
      ? options.now ?? new Date() : previous.data()?.lastUpdate ?? options.now ?? new Date();
    await root.set({ importFingerprint: fingerprint, importPending: false, lastUpdate }, { merge: true });
    writes++;
  }
  return { reads, writes, unchanged: writes === 0 };
}
