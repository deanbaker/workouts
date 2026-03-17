import { useCallback } from 'react';
import { WorkoutDay } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { program as defaultProgram } from '../data/program';

const PROGRAM_KEY = 'custom-program';

export function useProgram(): [WorkoutDay[], (days: WorkoutDay[]) => void, () => void] {
  const [program, setProgram] = useLocalStorage<WorkoutDay[]>(PROGRAM_KEY, defaultProgram);

  const resetProgram = useCallback(() => {
    setProgram(defaultProgram);
  }, [setProgram]);

  return [program, setProgram, resetProgram];
}
