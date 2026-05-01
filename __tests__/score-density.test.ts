/* eslint-disable import/first */
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useScoreDensity } from '../src/lib/score-density';
/* eslint-enable import/first */

describe('useScoreDensity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('returns "number" as default when nothing is stored', async () => {
    const { result } = renderHook(() => useScoreDensity());
    await waitFor(() => {
      expect(result.current[0]).toBe('number');
    });
  });

  it('loads stored "ring" value from AsyncStorage on mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('ring');
    const { result } = renderHook(() => useScoreDensity());
    await waitFor(() => {
      expect(result.current[0]).toBe('ring');
    });
  });

  it('loads stored "breakdown" value from AsyncStorage on mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('breakdown');
    const { result } = renderHook(() => useScoreDensity());
    await waitFor(() => {
      expect(result.current[0]).toBe('breakdown');
    });
  });

  it('ignores stored "number" and invalid values, keeps default', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid_value');
    const { result } = renderHook(() => useScoreDensity());
    await waitFor(() => {
      expect(result.current[0]).toBe('number');
    });
  });

  it('set() updates state and writes to AsyncStorage', async () => {
    const { result } = renderHook(() => useScoreDensity());
    act(() => {
      result.current[1]('ring');
    });
    expect(result.current[0]).toBe('ring');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('hmc_score_density', 'ring');
  });
});
