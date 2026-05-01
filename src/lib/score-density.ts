import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ScoreDensity = 'number' | 'ring' | 'breakdown';

const STORAGE_KEY = 'hmc_score_density';
const DEFAULT: ScoreDensity = 'number';

export function useScoreDensity(): [ScoreDensity, (v: ScoreDensity) => void] {
  const [density, setDensity] = useState<ScoreDensity>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'ring' || v === 'breakdown') setDensity(v);
      })
      .catch(() => {});
  }, []);

  const set = useCallback((v: ScoreDensity) => {
    setDensity(v);
    void AsyncStorage.setItem(STORAGE_KEY, v);
  }, []);

  return [density, set];
}
