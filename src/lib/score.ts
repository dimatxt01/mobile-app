type Habit = { id: string; points: number; enabled: boolean };
type Metric = { id: string };
type PenaltyItem = { id: string };

type CheckinState = {
  identityChecks: Record<string, boolean>;
  executionChecks: Record<string, boolean>;
  perf9to5: number;
  outcomeScores: Record<string, number>;
  penaltyScores: Record<string, number>;
  whoopScoreAdj: number;
  isLate: boolean;
};

export type ScoreResult = {
  identity: number;
  execution: number;
  outcome: number;
  penalty: number;
  whoopAdj: number;
  total: number;
};

export function computeScore(
  identityHabits: Habit[],
  executionHabits: Habit[],
  outcomes: Metric[],
  penalties: PenaltyItem[],
  state: CheckinState,
): ScoreResult {
  const identity = identityHabits
    .filter((h) => h.enabled && state.identityChecks[h.id])
    .reduce((sum, h) => sum + h.points, 0);

  const executionBase = executionHabits
    .filter((h) => h.enabled && state.executionChecks[h.id])
    .reduce((sum, h) => sum + h.points, 0);

  const execution = executionBase + state.perf9to5;

  const outcome = outcomes.reduce((sum, m) => sum + (state.outcomeScores[m.id] ?? 0), 0);

  const penalty = penalties.reduce((sum, p) => sum + (state.penaltyScores[p.id] ?? 0), 0);

  const lateAdj = state.isLate ? -10 : 0;
  const raw = identity + execution + outcome - penalty + state.whoopScoreAdj + lateAdj;
  const total = Math.max(0, raw);

  return { identity, execution, outcome, penalty, whoopAdj: state.whoopScoreAdj, total };
}
