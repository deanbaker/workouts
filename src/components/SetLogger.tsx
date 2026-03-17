import { SetLog } from '../types';
import { WeightUnit } from '../hooks/useWeightUnit';

interface Props {
  setIndex: number;
  log: SetLog;
  unit: WeightUnit;
  onChange: (log: SetLog) => void;
  onComplete: () => void;
}

export function SetLogger({ setIndex, log, unit, onChange, onComplete }: Props) {
  return (
    <div className={`set-row ${log.completed ? 'set-row--done' : ''}`}>
      <span className="set-row__number">Set {setIndex + 1}</span>
      <div className="set-row__input-wrap">
        <input
          type="number"
          inputMode="decimal"
          className="set-row__input"
          placeholder={unit}
          value={log.weight || ''}
          onChange={e => onChange({ ...log, weight: parseFloat(e.target.value) || 0 })}
          disabled={log.completed}
        />
        <span className="set-row__unit">{unit}</span>
      </div>
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
