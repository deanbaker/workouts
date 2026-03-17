import { program } from '../data/program';
import { getWorkoutLogs } from '../utils/storage';

interface Props {
  onSelectDay: (dayId: 'day-a' | 'day-b') => void;
  onViewHistory: () => void;
}

export function WorkoutSelector({ onSelectDay, onViewHistory }: Props) {
  const logs = getWorkoutLogs();
  const lastDayA = logs.filter(l => l.dayId === 'day-a').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const lastDayB = logs.filter(l => l.dayId === 'day-b').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="selector">
      <h1 className="selector-title">Workout Tracker</h1>
      <p className="selector-subtitle">2-Day BJJ Gym Program</p>

      <div className="selector-buttons">
        {program.map(day => {
          const lastLog = day.id === 'day-a' ? lastDayA : lastDayB;
          return (
            <button
              key={day.id}
              className={`selector-btn selector-btn--${day.id}`}
              onClick={() => onSelectDay(day.id)}
            >
              <span className="selector-btn__label">{day.id === 'day-a' ? 'Day A' : 'Day B'}</span>
              <span className="selector-btn__name">
                {day.id === 'day-a' ? 'Lower Body & Posterior Chain' : 'Upper Body & Push/Pull'}
              </span>
              {lastLog && (
                <span className="selector-btn__last">Last: {formatDate(lastLog.date)}</span>
              )}
            </button>
          );
        })}
      </div>

      <button className="history-link" onClick={onViewHistory}>
        View History ({logs.length} {logs.length === 1 ? 'session' : 'sessions'})
      </button>
    </div>
  );
}
