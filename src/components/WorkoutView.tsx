import { useState, useEffect, useCallback, useRef } from 'react';
import { WorkoutDay, ExerciseLog, SetLog, WorkoutLog } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';
import { WarmupCooldown } from './WarmupCooldown';
import { getLastExerciseLog, saveWorkoutLog, generateId } from '../utils/storage';

interface Props {
  day: WorkoutDay;
  onBack: () => void;
}

export function WorkoutView({ day, onBack }: Props) {
  const workoutIdRef = useRef(generateId());
  const startTimeRef = useRef(new Date().toISOString());

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => {
    return day.exercises.map(exercise => {
      const lastLog = getLastExerciseLog(day.id, exercise.id);
      const sets: SetLog[] = Array.from({ length: exercise.sets }, (_, i) => ({
        weight: lastLog?.sets[i]?.weight ?? 0,
        reps: lastLog?.sets[i]?.reps ?? 0,
        completed: false,
      }));
      return { exerciseId: exercise.id, sets };
    });
  });

  const [restTimer, setRestTimer] = useState<{ seconds: number; key: number } | null>(null);

  // Auto-save on every change
  useEffect(() => {
    const log: WorkoutLog = {
      id: workoutIdRef.current,
      dayId: day.id,
      date: new Date().toISOString(),
      exercises: exerciseLogs,
      startTime: startTimeRef.current,
    };
    saveWorkoutLog(log);
  }, [exerciseLogs, day.id]);

  const handleUpdateSet = useCallback((exerciseId: string, setIndex: number, setLog: SetLog) => {
    setExerciseLogs(prev =>
      prev.map(el =>
        el.exerciseId === exerciseId
          ? { ...el, sets: el.sets.map((s, i) => (i === setIndex ? setLog : s)) }
          : el
      )
    );
  }, []);

  const handleSetComplete = useCallback((restSeconds: number) => {
    setRestTimer({ seconds: restSeconds, key: Date.now() });
  }, []);

  const dismissTimer = useCallback(() => {
    setRestTimer(null);
  }, []);

  const totalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);
  const completedSets = exerciseLogs.reduce(
    (sum, el) => sum + el.sets.filter(s => s.completed).length, 0
  );

  // Group exercises by superset
  const groupedExercises: { group: string | null; exercises: typeof day.exercises }[] = [];
  let currentGroup: string | null = null;
  let currentItems: typeof day.exercises = [];

  day.exercises.forEach(exercise => {
    if (exercise.superset !== currentGroup) {
      if (currentItems.length > 0) {
        groupedExercises.push({ group: currentGroup, exercises: currentItems });
      }
      currentGroup = exercise.superset ?? null;
      currentItems = [exercise];
    } else {
      currentItems.push(exercise);
    }
  });
  if (currentItems.length > 0) {
    groupedExercises.push({ group: currentGroup, exercises: currentItems });
  }

  return (
    <div className="workout-view">
      <header className="workout-view__header">
        <button className="workout-view__back" onClick={onBack}>&larr; Back</button>
        <h2 className="workout-view__title">{day.name}</h2>
        <div className="workout-view__progress">
          {completedSets}/{totalSets} sets
        </div>
      </header>

      <div className="workout-view__progress-bar">
        <div
          className="workout-view__progress-fill"
          style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
        />
      </div>

      <WarmupCooldown title="Warmup (5 min)" items={day.warmup} />

      <div className="workout-view__exercises">
        {groupedExercises.map(({ group, exercises }) => (
          <div key={group ?? 'standalone'} className={`exercise-group ${group ? 'exercise-group--superset' : ''}`}>
            {group && exercises.length > 1 && (
              <div className="exercise-group__label">Superset {group}</div>
            )}
            {exercises.map(exercise => {
              const log = exerciseLogs.find(el => el.exerciseId === exercise.id)!;
              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  exerciseLog={log}
                  onUpdateSet={handleUpdateSet}
                  onSetComplete={handleSetComplete}
                />
              );
            })}
          </div>
        ))}
      </div>

      <WarmupCooldown title="Cooldown" items={day.cooldown} />

      {restTimer && (
        <RestTimer
          key={restTimer.key}
          seconds={restTimer.seconds}
          onDismiss={dismissTimer}
        />
      )}
    </div>
  );
}
