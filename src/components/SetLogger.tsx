import { SetLog } from '../types';

interface Props {
  setIndex: number;
  log: SetLog;
  onChange: (log: SetLog) => void;
  onComplete: () => void;
}

export function SetLogger({ setIndex, log, onChange, onComplete }: Props) {
  return (
    <div className={`set-row ${log.completed ? 'set-row--done' : ''}`}>
      <span className="set-row__number">Set {setIndex + 1}</span>
      <input
        type="number"
        inputMode="decimal"
        className="set-row__input"
        placeholder="kg"
        value={log.weight || ''}
        onChange={e => onChange({ ...log, weight: parseFloat(e.target.value) || 0 })}
        disabled={log.completed}
      />
      <input
        type="number"
        inputMode="numeric"
        className="set-row__input set-row__input--reps"
        placeholder="reps"
        value={log.reps || ''}
        onChange={e => onChange({ ...log, reps: parseInt(e.target.value) || 0 })}
        disabled={log.completed}
      />
      <button
        className={`set-row__btn ${log.completed ? 'set-row__btn--done' : ''}`}
        onClick={() => {
          onChange({ ...log, completed: !log.completed });
          if (!log.completed) onComplete();
        }}
      >
        {log.completed ? '✓' : 'Done'}
      </button>
    </div>
  );
}
