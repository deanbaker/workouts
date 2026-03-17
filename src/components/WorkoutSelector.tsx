import { useRef } from 'react';
import { WorkoutDay } from '../types';
import { getWorkoutLogs } from '../utils/storage';
import { exportData, importData, downloadJson } from '../utils/export';
import { WeightUnit } from '../hooks/useWeightUnit';

interface Props {
  program: WorkoutDay[];
  unit: WeightUnit;
  onSetUnit: (unit: WeightUnit) => void;
  onSelectDay: (dayId: string) => void;
  onViewHistory: () => void;
  onEditProgram: () => void;
  onViewProgress: () => void;
}

export function WorkoutSelector({ program, unit, onSetUnit, onSelectDay, onViewHistory, onEditProgram, onViewProgress }: Props) {
  const logs = getWorkoutLogs();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLastLog = (dayId: string) =>
    logs.filter(l => l.dayId === dayId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleExport = () => {
    const data = exportData();
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(data, `workout-backup-${date}.json`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importData(reader.result as string);
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error ?? 'Import failed');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="selector">
      <h1 className="selector-title">Workout Tracker</h1>
      <p className="selector-subtitle">2-Day BJJ Gym Program</p>

      <div className="selector__unit-toggle">
        <button
          className={`selector__unit-btn ${unit === 'kg' ? 'selector__unit-btn--active' : ''}`}
          onClick={() => onSetUnit('kg')}
        >
          kg
        </button>
        <button
          className={`selector__unit-btn ${unit === 'lbs' ? 'selector__unit-btn--active' : ''}`}
          onClick={() => onSetUnit('lbs')}
        >
          lbs
        </button>
      </div>

      <div className="selector-buttons">
        {program.map(day => {
          const lastLog = getLastLog(day.id);
          return (
            <button
              key={day.id}
              className={`selector-btn selector-btn--${day.id}`}
              onClick={() => onSelectDay(day.id)}
            >
              <span className="selector-btn__label">{day.name.split('—')[0]?.trim() || day.id}</span>
              <span className="selector-btn__name">
                {day.name.split('—')[1]?.trim() || day.name}
              </span>
              {lastLog && (
                <span className="selector-btn__last">Last: {formatDate(lastLog.date)}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="selector-actions">
        <button className="history-link" onClick={onViewHistory}>
          History ({logs.length})
        </button>
        <button className="history-link" onClick={onViewProgress}>
          Progress
        </button>
        <button className="history-link" onClick={onEditProgram}>
          Edit Program
        </button>
      </div>

      <div className="selector-actions">
        <button className="history-link" onClick={handleExport}>
          Export Data
        </button>
        <button className="history-link" onClick={() => fileInputRef.current?.click()}>
          Import Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>
    </div>
  );
}
