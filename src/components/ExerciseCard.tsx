import { Exercise, ExerciseLog, SetLog } from '../types';
import { SetLogger } from './SetLogger';

interface Props {
  exercise: Exercise;
  exerciseLog: ExerciseLog;
  onUpdateSet: (exerciseId: string, setIndex: number, setLog: SetLog) => void;
  onSetComplete: (restSeconds: number) => void;
}

export function ExerciseCard({ exercise, exerciseLog, onUpdateSet, onSetComplete }: Props) {
  const completedSets = exerciseLog.sets.filter(s => s.completed).length;
  const allDone = completedSets === exercise.sets;

  return (
    <div className={`exercise-card ${allDone ? 'exercise-card--done' : ''}`}>
      <div className="exercise-card__header">
        <div className="exercise-card__title-row">
          {exercise.superset && (
            <span className="exercise-card__superset">{exercise.superset}{exerciseLog.exerciseId === exercise.id ? '' : ''}</span>
          )}
          <h3 className="exercise-card__name">{exercise.name}</h3>
        </div>
        <span className="exercise-card__target">
          {exercise.sets} x {exercise.reps}
        </span>
      </div>

      {exercise.notes && (
        <p className="exercise-card__notes">{exercise.notes}</p>
      )}

      <div className="exercise-card__sets">
        {exerciseLog.sets.map((setLog, i) => (
          <SetLogger
            key={i}
            setIndex={i}
            log={setLog}
            onChange={(updated) => onUpdateSet(exercise.id, i, updated)}
            onComplete={() => onSetComplete(exercise.restSeconds)}
          />
        ))}
      </div>

      {allDone && (
        <div className="exercise-card__complete-badge">Complete</div>
      )}
    </div>
  );
}
