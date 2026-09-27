import { of } from 'rxjs';
import { NumberOfPlayersPipe } from './pipes/number-of-players.pipe';
import { RoundViewComponent } from './components/clubs/team/round-view/round-view.component';
import { DivisionStandingsComponent } from './components/division/division-standings/division-standings.component';
import { ResultPipe, OwnResultPipe } from './pipes/result.pipe';
import { ResultEnum } from 'functions/src/models/ResultEnum';
import { ColorEnum } from 'functions/src/models/ColorEnum';

describe('new-season display', () => {
  it('displays all exceptional FRBE scores without labelling them double forfeits', () => {
    const result = new ResultPipe();
    const own = new OwnResultPipe();
    expect(result.transform(ResultEnum.WhiteHalf)).toBe('½-0');
    expect(result.transform(ResultEnum.BlackHalf)).toBe('0-½');
    expect(result.transform(ResultEnum.TeamFF)).toBe('Team FF');
    expect(own.transform(ResultEnum.WhiteHalf, ColorEnum.Wit)).toBe('½');
    expect(own.transform(ResultEnum.WhiteHalf, ColorEnum.Zwart)).toBe('0');
  });
  it('offers four boards in division six', () => {
    const pipe = new NumberOfPlayersPipe();
    expect([1, 2, 3, 4, 5, 6].map(n => pipe.transform(n))).toEqual([8, 8, 6, 4, 4, 4]);
  });

  it('uses the division-specific calendar while preserving archived dates', () => {
    const ts = (date: string) => ({ toDate: () => new Date(date) });
    const dates = { dates: [ts('2025-09-28')], datesByDivision: { '6': [ts('2026-09-27')] } };
    const component = new RoundViewComponent({ getDates: () => of(dates) } as any);
    component.team = { class: 6 } as any;
    component.round = { id: 1 } as any;
    component.ngOnInit();
    component.date$.subscribe(date => expect(date.toISOString().slice(0, 10)).toBe('2026-09-27'));
    component.team = { class: 1 } as any;
    component.ngOnInit();
    component.date$.subscribe(date => expect(date.toISOString().slice(0, 10)).toBe('2025-09-28'));
  });

  it('shows both 6J results and links sparse rounds to the correct tabs', () => {
    const component = new DivisionStandingsComponent({} as any);
    const a: any = { clubId: 811, id: 2, rounds: [] };
    const b: any = { clubId: 811, id: 3, rounds: [] };
    const first: any = { id: 1, teamHome: a, teamAway: b, scoreHome: 3, scoreAway: 1, played: true };
    const second: any = { id: 3, teamHome: b, teamAway: a, scoreHome: 2.5, scoreAway: 1.5, played: true };
    a.rounds = [first, second];
    expect(component.matches(a, b)).toEqual([first, second]);
    expect(component.score(first, a)).toBe(3);
    expect(component.score(second, a)).toBe(1.5);
    expect(component.roundTab(a, second)).toBe(2);
    expect(component.colorResult(first, a)).toBe('green');
    expect(component.colorResult(second, a)).toBe('red');
    expect(component.score({ ...first, played: false }, a)).toBe('-');
  });
});
