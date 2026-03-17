import { useState } from 'react';
import { getWorkoutLogs, deleteWorkoutLog } from '../utils/storage';
import { WorkoutLog, WorkoutDay } from '../types';
import { WeightUnit } from '../hooks/useWeightUnit';

interface Props {
  program: WorkoutDay[];
  unit: WeightUnit;
  onBack: () => void;
}

export function WorkoutHistory({ program, unit, onBack }: Props) {
  const [logs, setLogs] = useState<WorkoutLog[]>(() =>
    getWorkoutLogs().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (logId: string) => {
    deleteWorkoutLog(logId);
    setLogs(prev => prev.filter(l => l.id !== logId));
  };

  const getDayName = (dayId: string) => {
    const day = program.find(d => d.id === dayId);
    return day?.name ?? dayId;
  };

  const getExerciseName = (dayId: string, exerciseId: string) => {
    const day = program.find(d => d.id === dayId);
    return day?.exercises.find(e => e.id === exerciseId)?.name ?? exerciseId;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDuration = (log: WorkoutLog) => {
    if (!log.startTime) return null;
    const secs = Math.round((new Date(log.date).getTime() - new Date(log.startTime).getTime()) / 1000);
    if (secs <= 0) return null;
    const m = Math.floor(secs / 60);
    if (m < 1) return null;
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m`;
  };

  if (logs.length === 0) {
    return (
      <div className="history">
        <header className="history__header">
          <button className="workout-view__back" onClick={onBack}>&larr; Back</button>
          <h2>History</h2>
        </header>
        <p className="history__empty">No workouts logged yet. Get after it!</p>
      </div>
    );
  }

  return (
    <div className="history">
      <header className="history__header">
        <button className="workout-view__back" onClick={onBack}>&larr; Back</button>
        <h2>History</h2>
      </header>

      <div className="history__list">
        {logs.map(log => {
          const isExpanded = expandedId === log.id;
          const completedSets = log.exercises.reduce(
            (sum, el) => sum + el.sets.filter(s => s.completed).length, 0
          );
          const totalSets = log.exercises.reduce((sum, el) => sum + el.sets.length, 0);
          const duration = formatDuration(log);

          return (
            <div key={log.id} className="history__item">
              <button
                className="history__item-header"
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
              >
                <div className="history__item-info">
                  <span className="history__item-date">{formatDate(log.date)}</span>
                  <span className="history__item-day">{getDayName(log.dayId)}</span>
                </div>
                <div className="history__item-meta">
                  {duration && <span className="history__item-duration">{duration}</span>}
                  <span className="history__item-sets">{completedSets}/{totalSets} sets</span>
                </div>
              </button>

              {isExpanded && (
                <div className="history__item-detail">
                  {log.exercises.map(el => {
                    const completedExSets = el.sets.filter(s => s.completed);
                    if (completedExSets.length === 0) return null;
                    return (
                      <div key={el.exerciseId} className="history__exercise">
                        <span className="history__exercise-name">
                          {getExerciseName(log.dayId, el.exerciseId)}
                        </span>
                        <div className="history__exercise-sets">
                          {completedExSets.map((s, i) => (
                            <span key={i} className="history__set">
                              {s.weight}{unit} x {s.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {log.notes && (
                    <div className="history__notes">
                      <span className="history__notes-label">Notes:</span> {log.notes}
                    </div>
                  )}
                  <button
                    className="history__delete"
                    onClick={() => handleDelete(log.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
