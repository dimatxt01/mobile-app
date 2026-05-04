import { computeCurrentWeek } from '../src/lib/week-utils';

describe('computeCurrentWeek', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns Sunday as weekStart when today is Sunday', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-03T10:00:00Z'));
    const { weekStart, weekEnd } = computeCurrentWeek();
    expect(weekStart).toBe('2026-05-03');
    expect(weekEnd).toBe('2026-05-09');
  });

  it('returns previous Sunday as weekStart when today is mid-week', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-06T10:00:00Z'));
    const { weekStart, weekEnd } = computeCurrentWeek();
    expect(weekStart).toBe('2026-05-03');
    expect(weekEnd).toBe('2026-05-09');
  });

  it('weekEnd is always 6 days after weekStart', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-09T23:00:00Z'));
    const { weekStart, weekEnd } = computeCurrentWeek();
    const start = new Date(weekStart + 'T00:00:00');
    const end = new Date(weekEnd + 'T00:00:00');
    expect((end.getTime() - start.getTime()) / 86400000).toBe(6);
  });

  it('returns Saturday as weekEnd when today is Saturday', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-09T15:00:00Z'));
    const { weekStart, weekEnd } = computeCurrentWeek();
    expect(weekStart).toBe('2026-05-03');
    expect(weekEnd).toBe('2026-05-09');
  });
});
