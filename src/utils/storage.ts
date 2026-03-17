import { WorkoutLog, ExerciseLog, WorkoutDay } from '../types';
import { program as defaultProgram } from '../data/program';

const LOGS_KEY = 'workout-logs';
const PROGRAM_KEY = 'custom-program';

export function getWorkoutLogs(): WorkoutLog[] {
  try {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWorkoutLog(log: WorkoutLog): void {
  const logs = getWorkoutLogs();
  const existingIndex = logs.findIndex(l => l.id === log.id);
  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs.push(log);
  }
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getLastWorkoutForDay(dayId: string): WorkoutLog | null {
  const logs = getWorkoutLogs();
  const dayLogs = logs.filter(l => l.dayId === dayId);
  if (dayLogs.length === 0) return null;
  return dayLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

export function getLastExerciseLog(dayId: string, exerciseId: string): ExerciseLog | null {
  const lastWorkout = getLastWorkoutForDay(dayId);
  if (!lastWorkout) return null;
  return lastWorkout.exercises.find(e => e.exerciseId === exerciseId) ?? null;
}

export function deleteWorkoutLog(logId: string): void {
  const logs = getWorkoutLogs().filter(l => l.id !== logId);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function getProgram(): WorkoutDay[] {
  try {
    const data = localStorage.getItem(PROGRAM_KEY);
    return data ? JSON.parse(data) : defaultProgram;
  } catch {
    return defaultProgram;
  }
}

export function saveProgram(days: WorkoutDay[]): void {
  localStorage.setItem(PROGRAM_KEY, JSON.stringify(days));
}

export function resetProgram(): void {
  localStorage.removeItem(PROGRAM_KEY);
}

export function getExercisePR(exerciseId: string): { weight: number; reps: number } | null {
  const logs = getWorkoutLogs();
  let best: { weight: number; reps: number } | null = null;
  for (const log of logs) {
    const el = log.exercises.find(e => e.exerciseId === exerciseId);
    if (!el) continue;
    for (const set of el.sets) {
      if (!set.completed || set.weight <= 0) continue;
      if (!best || set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps)) {
        best = { weight: set.weight, reps: set.reps };
      }
    }
  }
  return best;
}

export function getWeightUnit(): 'kg' | 'lbs' {
  return (localStorage.getItem('weight-unit') as 'kg' | 'lbs') ?? 'kg';
}

export function setWeightUnit(unit: 'kg' | 'lbs'): void {
  localStorage.setItem('weight-unit', unit);
}
