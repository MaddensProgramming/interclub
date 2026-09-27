import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Cloud Functions supplies its service account. Local imports require ADC.
const app = getApps()[0] ?? initializeApp();
export const store = getFirestore(app);
