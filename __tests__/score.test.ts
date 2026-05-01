import { computeScore } from '../src/lib/score';

const idHabits = [
  { id: 'a', points: 10, enabled: true },
  { id: 'b', points: 5, enabled: true },
];
const exHabits = [{ id: 'c', points: 15, enabled: true }];
const outcomes = [{ id: 'o1' }, { id: 'o2' }];
const penalties = [{ id: 'p1' }];

describe('computeScore', () => {
  it('sums identity + execution + outcome - penalty', () => {
    const r = computeScore(idHabits, exHabits, outcomes, penalties, {
      identityChecks: { a: true },
      executionChecks: { c: true },
      perf9to5: 5,
      outcomeScores: { o1: 3, o2: 2 },
      penaltyScores: { p1: 1 },
      whoopScoreAdj: 0,
      isLate: false,
    });
    expect(r.identity).toBe(10);
    expect(r.execution).toBe(20);
    expect(r.outcome).toBe(5);
    expect(r.penalty).toBe(1);
    expect(r.total).toBe(34);
  });

  it('subtracts 10 for late checkin', () => {
    const r = computeScore(idHabits, [], outcomes, penalties, {
      identityChecks: { a: true },
      executionChecks: {},
      perf9to5: 0,
      outcomeScores: {},
      penaltyScores: {},
      whoopScoreAdj: 0,
      isLate: true,
    });
    expect(r.total).toBe(0);
  });

  it('floors total at 0', () => {
    const r = computeScore([], [], outcomes, penalties, {
      identityChecks: {},
      executionChecks: {},
      perf9to5: 0,
      outcomeScores: {},
      penaltyScores: { p1: 5 },
      whoopScoreAdj: 0,
      isLate: true,
    });
    expect(r.total).toBe(0);
  });

  it('excludes disabled habits from identity score', () => {
    const mixed = [
      { id: 'a', points: 10, enabled: true },
      { id: 'b', points: 5, enabled: false },
    ];
    const r = computeScore(mixed, [], [], [], {
      identityChecks: { a: true, b: true },
      executionChecks: {},
      perf9to5: 0,
      outcomeScores: {},
      penaltyScores: {},
      whoopScoreAdj: 0,
      isLate: false,
    });
    expect(r.identity).toBe(10);
    expect(r.total).toBe(10);
  });

  it('returns identity 0 when all habits have enabled:false', () => {
    const allDisabled = [
      { id: 'a', points: 10, enabled: false },
      { id: 'b', points: 5, enabled: false },
    ];
    const r = computeScore(allDisabled, [], [], [], {
      identityChecks: { a: true, b: true },
      executionChecks: {},
      perf9to5: 0,
      outcomeScores: {},
      penaltyScores: {},
      whoopScoreAdj: 0,
      isLate: false,
    });
    expect(r.identity).toBe(0);
    expect(r.total).toBe(0);
  });

  it('adds whoopScoreAdj to total', () => {
    const r = computeScore([], [], outcomes, penalties, {
      identityChecks: {},
      executionChecks: {},
      perf9to5: 0,
      outcomeScores: {},
      penaltyScores: {},
      whoopScoreAdj: 8,
      isLate: false,
    });
    expect(r.total).toBe(8);
  });
});
