export function computeWeeksLived(dob: string | null): number {
  if (!dob) return 0;
  const ms = Date.now() - new Date(dob).getTime();
  if (isNaN(ms)) return 0;
  return Math.max(0, Math.floor(ms / (7 * 24 * 60 * 60 * 1000)));
}

export function isDobValid(dob: string): boolean {
  const testDate = new Date(dob);
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  return !isNaN(testDate.getTime()) && testDate < oneYearAgo;
}

// day 0 rolls back to last day of preceding month
export function clampDobDay(month: number, day: number, year: number): number {
  const maxDay = new Date(year, month, 0).getDate();
  return Math.min(day, maxDay);
}
