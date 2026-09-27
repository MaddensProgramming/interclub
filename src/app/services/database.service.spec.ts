import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { DataBaseService } from './database.service';

describe('season-scoped reads', () => {
  let service: DataBaseService;
  beforeEach(() => { service = new DataBaseService({ navigate: () => Promise.resolve(true) } as any); });

  it('starts in the 2026–2027 season', () => {
    expect(service.year).toBe('2026');
    expect(service.year$.value).toBe('2026');
  });

  it('reloads round overviews when switching to an archived season', fakeAsync(() => {
    const read = spyOn<any>(service, 'getSeasonDocument').and.callFake((year: string) =>
      Promise.resolve({ data: (): any => ({ divisions: [], season: year }) }));
    const seasons: string[] = [];
    const sub = service.getFullRoundOverview('7').subscribe((data: any) => seasons.push(data.season));
    flushMicrotasks();
    service.changeYear('2024');
    flushMicrotasks();
    expect(seasons).toEqual(['2026', '2024']);
    expect(read).toHaveBeenCalledWith('2024', 'roundOverview', '7');
    sub.unsubscribe();
  }));

  it('ignores an old in-flight response after a season switch', fakeAsync(() => {
    let finishOld: (value: any) => void;
    spyOn<any>(service, 'getSeasonDocument').and.callFake((year: string) => year === '2026'
      ? new Promise(resolve => { finishOld = resolve; })
      : Promise.resolve({ data: () => ({ season: year }) }));
    const seasons: string[] = [];
    const sub = service.getFullRoundOverview('1').subscribe((data: any) => seasons.push(data.season));
    service.changeYear('2025');
    flushMicrotasks();
    finishOld({ data: () => ({ season: '2026' }) });
    flushMicrotasks();
    expect(seasons).toEqual(['2025']);
    sub.unsubscribe();
  }));

  it('reads the update timestamp from the selected season and tolerates an unpublished season', fakeAsync(() => {
    spyOn<any>(service, 'getSeasonDocument').and.callFake((year: string) => Promise.resolve({
      data: () => year === '2026' ? undefined : { lastUpdate: { toDate: () => new Date('2025-10-01T12:00:00Z') } },
    }));
    const dates: Date[] = [];
    const sub = service.getLastUpdate().subscribe(date => dates.push(date));
    flushMicrotasks();
    service.changeYear('2025');
    flushMicrotasks();
    expect(dates[0]).toBeUndefined();
    expect(dates[1].toISOString()).toBe('2025-10-01T12:00:00.000Z');
    sub.unsubscribe();
  }));
});
