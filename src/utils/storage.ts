import { WorkoutLog, ExerciseLog } from '../types';

const LOGS_KEY = 'workout-logs';

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

export function getLastWorkoutForDay(dayId: 'day-a' | 'day-b'): WorkoutLog | null {
  const logs = getWorkoutLogs();
  const dayLogs = logs.filter(l => l.dayId === dayId);
  if (dayLogs.length === 0) return null;
  return dayLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

export function getLastExerciseLog(dayId: 'day-a' | 'day-b', exerciseId: string): ExerciseLog | null {
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
