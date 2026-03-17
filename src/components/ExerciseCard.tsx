import { Exercise, ExerciseLog, SetLog } from '../types';
import { SetLogger } from './SetLogger';
import { WeightUnit } from '../hooks/useWeightUnit';

interface Props {
  exercise: Exercise;
  exerciseLog: ExerciseLog;
  unit: WeightUnit;
  isPR?: boolean;
  onUpdateSet: (exerciseId: string, setIndex: number, setLog: SetLog) => void;
  onSetComplete: (restSeconds: number) => void;
}

export function ExerciseCard({ exercise, exerciseLog, unit, isPR, onUpdateSet, onSetComplete }: Props) {
  const completedSets = exerciseLog.sets.filter(s => s.completed).length;
  const allDone = completedSets === exercise.sets;

  return (
    <div className={`exercise-card ${allDone ? 'exercise-card--done' : ''}`}>
      <div className="exercise-card__header">
        <div className="exercise-card__title-row">
          {exercise.superset && (
            <span className="exercise-card__superset">{exercise.superset}</span>
          )}
          <h3 className="exercise-card__name">
            {exercise.name}
            {exercise.videoUrl && (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="exercise-card__video-link"
                onClick={(e) => e.stopPropagation()}
              >
                &#9654;
              </a>
            )}
          </h3>
        </div>
        <span className="exercise-card__target">
          {exercise.sets} x {exercise.reps}
        </span>
      </div>

      {exercise.notes && (
        <p className="exercise-card__notes">{exercise.notes}</p>
      )}

      {isPR && (
        <div className="exercise-card__pr-badge">New PR!</div>
      )}

      <div className="exercise-card__sets">
        {exerciseLog.sets.map((setLog, i) => (
          <SetLogger
            key={i}
            setIndex={i}
            log={setLog}
            unit={unit}
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
