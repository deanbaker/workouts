import { useState } from 'react';
import { WorkoutLog, WorkoutDay } from '../types';
import { saveWorkoutLog } from '../utils/storage';
import { WeightUnit } from '../hooks/useWeightUnit';

interface Props {
  log: WorkoutLog;
  day: WorkoutDay;
  unit: WeightUnit;
  onDone: () => void;
}

export function SessionSummary({ log, day, unit, onDone }: Props) {
  const [notes, setNotes] = useState(log.notes ?? '');

  const duration = log.startTime
    ? Math.round((new Date(log.date).getTime() - new Date(log.startTime).getTime()) / 1000)
    : 0;

  const completedSets = log.exercises.reduce(
    (sum, el) => sum + el.sets.filter(s => s.completed).length, 0
  );

  const totalVolume = log.exercises.reduce(
    (sum, el) => sum + el.sets.filter(s => s.completed).reduce((s2, set) => s2 + set.weight * set.reps, 0), 0
  );

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handleDone = () => {
    const trimmed = notes.trim();
    if (trimmed) {
      saveWorkoutLog({ ...log, notes: trimmed });
    }
    onDone();
  };

  return (
    <div className="summary">
      <h2 className="summary__title">Workout Complete</h2>
      <p className="summary__day">{day.name}</p>

      <div className="summary__stats">
        <div className="summary__stat">
          <span className="summary__stat-value">{formatDuration(duration)}</span>
          <span className="summary__stat-label">Duration</span>
        </div>
        <div className="summary__stat">
          <span className="summary__stat-value">{completedSets}</span>
          <span className="summary__stat-label">Sets</span>
        </div>
        <div className="summary__stat">
          <span className="summary__stat-value">
            {totalVolume.toLocaleString()}{unit}
          </span>
          <span className="summary__stat-label">Volume</span>
        </div>
      </div>

      <div className="summary__exercises">
        {log.exercises.map(el => {
          const completed = el.sets.filter(s => s.completed);
          if (completed.length === 0) return null;
          const exercise = day.exercises.find(e => e.id === el.exerciseId);
          return (
            <div key={el.exerciseId} className="summary__exercise">
              <span className="summary__exercise-name">{exercise?.name ?? el.exerciseId}</span>
              <span className="summary__exercise-detail">
                {completed.map((s, i) => (
                  <span key={i} className="summary__set-pill">
                    {s.weight}{unit} x {s.reps}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>

      <div className="summary__notes">
        <label className="summary__notes-label">Session Notes</label>
        <textarea
          className="summary__notes-input"
          placeholder="How did it feel? Any issues?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <button className="summary__done-btn" onClick={handleDone}>
        Done
      </button>
    </div>
  );
}
