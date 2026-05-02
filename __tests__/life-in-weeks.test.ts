import { computeWeeksLived, isDobValid, clampDobDay } from '../src/lib/life-in-weeks';

describe('computeWeeksLived', () => {
  it('returns 0 for null DOB', () => {
    expect(computeWeeksLived(null)).toBe(0);
  });

  it('returns 0 for a future DOB', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    expect(computeWeeksLived(tomorrow)).toBe(0);
  });

  it('returns correct weeks for a known DOB', () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-01-01').getTime());
    expect(computeWeeksLived('2006-01-01')).toBe(1043);
    jest.restoreAllMocks();
  });

  it('returns 0 for a malformed date string', () => {
    expect(computeWeeksLived('not-a-date')).toBe(0);
  });
});

describe('isDobValid', () => {
  it('returns false for a date less than 1 year ago', () => {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    expect(isDobValid(sixMonthsAgo)).toBe(false);
  });

  it('returns true for a date more than 1 year ago', () => {
    expect(isDobValid('1990-01-01')).toBe(true);
  });

  it('returns false for an invalid date string', () => {
    expect(isDobValid('not-a-date')).toBe(false);
  });
});

describe('clampDobDay', () => {
  it('clamps Feb 30 to Feb 28 in a non-leap year', () => {
    expect(clampDobDay(2, 30, 2023)).toBe(28);
  });

  it('allows Feb 29 in a leap year', () => {
    expect(clampDobDay(2, 29, 2024)).toBe(29);
  });

  it('does not clamp a valid day', () => {
    expect(clampDobDay(3, 15, 2023)).toBe(15);
  });

  it('clamps to 31 for months with 31 days', () => {
    expect(clampDobDay(1, 31, 2023)).toBe(31);
  });
});
