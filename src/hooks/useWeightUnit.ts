import { useLocalStorage } from './useLocalStorage';

export type WeightUnit = 'kg' | 'lbs';

export function useWeightUnit() {
  return useLocalStorage<WeightUnit>('weight-unit', 'kg');
}
