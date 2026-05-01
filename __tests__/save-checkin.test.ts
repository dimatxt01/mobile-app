/* eslint-disable import/first */
// jest.mock must appear before imports so Jest can hoist it correctly.
const mockMutate = jest.fn();

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })),
    })),
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(() => ({ mutate: mockMutate, isPending: false })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock('../src/features/auth/hooks/use-auth', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

import { renderHook, act } from '@testing-library/react-native';
import { useSaveCheckin } from '../src/features/checkin/save-checkin';
/* eslint-enable import/first */

describe('useSaveCheckin debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockMutate.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('coalesces rapid calls into a single mutation', () => {
    const { result } = renderHook(() => useSaveCheckin());
    act(() => {
      result.current.save({ perf_9to5: 3 });
      result.current.save({ perf_9to5: 7 });
    });
    expect(mockMutate).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(800));
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({ perf_9to5: 7 });
  });

  it('does not fire before the debounce window elapses', () => {
    const { result } = renderHook(() => useSaveCheckin());
    act(() => {
      result.current.save({ perf_9to5: 5 });
    });
    act(() => jest.advanceTimersByTime(799));
    expect(mockMutate).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('cancel prevents pending save from firing', () => {
    const { result } = renderHook(() => useSaveCheckin());
    act(() => {
      result.current.save({ perf_9to5: 5 });
    });
    act(() => {
      result.current.cancel();
    });
    act(() => jest.advanceTimersByTime(1000));
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
