import { useState } from 'react';
import { WorkoutDay, Exercise } from '../types';
import { generateId } from '../utils/storage';
import { program as defaultProgram } from '../data/program';

interface Props {
  program: WorkoutDay[];
  onSave: (days: WorkoutDay[]) => void;
  onReset: () => void;
  onBack: () => void;
}

export function ProgramEditor({ program, onSave, onReset, onBack }: Props) {
  const [days, setDays] = useState<WorkoutDay[]>(() => JSON.parse(JSON.stringify(program)));
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const save = (updated: WorkoutDay[]) => {
    setDays(updated);
    onSave(updated);
  };

  const updateDay = (dayIndex: number, patch: Partial<WorkoutDay>) => {
    const updated = days.map((d, i) => i === dayIndex ? { ...d, ...patch } : d);
    save(updated);
  };

  const updateExercise = (dayIndex: number, exIndex: number, patch: Partial<Exercise>) => {
    const updated = [...days];
    const exercises = [...updated[dayIndex].exercises];
    exercises[exIndex] = { ...exercises[exIndex], ...patch };
    updated[dayIndex] = { ...updated[dayIndex], exercises };
    save(updated);
  };

  const moveExercise = (dayIndex: number, exIndex: number, direction: -1 | 1) => {
    const target = exIndex + direction;
    const exercises = [...days[dayIndex].exercises];
    if (target < 0 || target >= exercises.length) return;
    [exercises[exIndex], exercises[target]] = [exercises[target], exercises[exIndex]];
    const updated = [...days];
    updated[dayIndex] = { ...updated[dayIndex], exercises };
    save(updated);
  };

  const deleteExercise = (dayIndex: number, exIndex: number) => {
    const exercises = days[dayIndex].exercises.filter((_, i) => i !== exIndex);
    const updated = [...days];
    updated[dayIndex] = { ...updated[dayIndex], exercises };
    save(updated);
    setExpandedExercise(null);
  };

  const addExercise = (dayIndex: number) => {
    const newEx: Exercise = {
      id: generateId(),
      name: 'New Exercise',
      sets: 3,
      reps: '8',
      notes: '',
      restSeconds: 90,
    };
    const exercises = [...days[dayIndex].exercises, newEx];
    const updated = [...days];
    updated[dayIndex] = { ...updated[dayIndex], exercises };
    save(updated);
    setExpandedExercise(newEx.id);
  };

  const updateListItem = (dayIndex: number, field: 'warmup' | 'cooldown', itemIndex: number, value: string) => {
    const list = [...days[dayIndex][field]];
    list[itemIndex] = value;
    updateDay(dayIndex, { [field]: list });
  };

  const deleteListItem = (dayIndex: number, field: 'warmup' | 'cooldown', itemIndex: number) => {
    const list = days[dayIndex][field].filter((_, i) => i !== itemIndex);
    updateDay(dayIndex, { [field]: list });
  };

  const addListItem = (dayIndex: number, field: 'warmup' | 'cooldown') => {
    const list = [...days[dayIndex][field], ''];
    updateDay(dayIndex, { [field]: list });
  };

  const handleReset = () => {
    const defaults = JSON.parse(JSON.stringify(defaultProgram));
    setDays(defaults);
    onReset();
  };

  return (
    <div className="program-editor">
      <header className="program-editor__header">
        <button className="workout-view__back" onClick={onBack}>&larr; Back</button>
        <h2 className="program-editor__title">Edit Program</h2>
        <button className="program-editor__reset" onClick={handleReset}>Reset</button>
      </header>

      {days.map((day, dayIndex) => (
        <div key={day.id} className="program-editor__day">
          <div className="program-editor__day-header">
            <label className="program-editor__label">Day Name</label>
            <input
              className="program-editor__input"
              value={day.name}
              onChange={e => updateDay(dayIndex, { name: e.target.value })}
            />
          </div>

          {/* Warmup */}
          <div className="program-editor__section">
            <h4 className="program-editor__section-title">Warmup</h4>
            {day.warmup.map((item, i) => (
              <div key={i} className="program-editor__list-item">
                <input
                  className="program-editor__input program-editor__input--flex"
                  value={item}
                  onChange={e => updateListItem(dayIndex, 'warmup', i, e.target.value)}
                />
                <button
                  className="program-editor__delete-btn"
                  onClick={() => deleteListItem(dayIndex, 'warmup', i)}
                >
                  &times;
                </button>
              </div>
            ))}
            <button className="program-editor__add-btn" onClick={() => addListItem(dayIndex, 'warmup')}>
              + Add Warmup
            </button>
          </div>

          {/* Exercises */}
          <div className="program-editor__section">
            <h4 className="program-editor__section-title">Exercises</h4>
            {day.exercises.map((ex, exIndex) => {
              const isExpanded = expandedExercise === ex.id;
              return (
                <div key={ex.id} className="program-editor__exercise">
                  <button
                    className="program-editor__exercise-header"
                    onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                  >
                    <span className="program-editor__exercise-name">{ex.name}</span>
                    <span className="program-editor__exercise-meta">
                      {ex.sets}x{ex.reps}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="program-editor__exercise-detail">
                      <label className="program-editor__label">Name</label>
                      <input
                        className="program-editor__input"
                        value={ex.name}
                        onChange={e => updateExercise(dayIndex, exIndex, { name: e.target.value })}
                      />

                      <div className="program-editor__row">
                        <div className="program-editor__field">
                          <label className="program-editor__label">Sets</label>
                          <input
                            className="program-editor__input"
                            type="number"
                            value={ex.sets}
                            onChange={e => updateExercise(dayIndex, exIndex, { sets: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div className="program-editor__field">
                          <label className="program-editor__label">Reps</label>
                          <input
                            className="program-editor__input"
                            value={ex.reps}
                            onChange={e => updateExercise(dayIndex, exIndex, { reps: e.target.value })}
                          />
                        </div>
                        <div className="program-editor__field">
                          <label className="program-editor__label">Rest (s)</label>
                          <input
                            className="program-editor__input"
                            type="number"
                            value={ex.restSeconds}
                            onChange={e => updateExercise(dayIndex, exIndex, { restSeconds: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <label className="program-editor__label">Notes</label>
                      <textarea
                        className="program-editor__textarea"
                        value={ex.notes}
                        onChange={e => updateExercise(dayIndex, exIndex, { notes: e.target.value })}
                        rows={2}
                      />

                      <label className="program-editor__label">Video URL</label>
                      <input
                        className="program-editor__input"
                        value={ex.videoUrl ?? ''}
                        onChange={e => updateExercise(dayIndex, exIndex, { videoUrl: e.target.value || undefined })}
                      />

                      <label className="program-editor__label">Superset Letter</label>
                      <input
                        className="program-editor__input"
                        value={ex.superset ?? ''}
                        placeholder="e.g. A, B, C"
                        onChange={e => updateExercise(dayIndex, exIndex, { superset: e.target.value || undefined })}
                      />

                      <div className="program-editor__exercise-actions">
                        <button
                          className="program-editor__move-btn"
                          disabled={exIndex === 0}
                          onClick={() => moveExercise(dayIndex, exIndex, -1)}
                        >
                          Move Up
                        </button>
                        <button
                          className="program-editor__move-btn"
                          disabled={exIndex === day.exercises.length - 1}
                          onClick={() => moveExercise(dayIndex, exIndex, 1)}
                        >
                          Move Down
                        </button>
                        <button
                          className="program-editor__delete-exercise"
                          onClick={() => deleteExercise(dayIndex, exIndex)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <button className="program-editor__add-btn" onClick={() => addExercise(dayIndex)}>
              + Add Exercise
            </button>
          </div>

          {/* Cooldown */}
          <div className="program-editor__section">
            <h4 className="program-editor__section-title">Cooldown</h4>
            {day.cooldown.map((item, i) => (
              <div key={i} className="program-editor__list-item">
                <input
                  className="program-editor__input program-editor__input--flex"
                  value={item}
                  onChange={e => updateListItem(dayIndex, 'cooldown', i, e.target.value)}
                />
                <button
                  className="program-editor__delete-btn"
                  onClick={() => deleteListItem(dayIndex, 'cooldown', i)}
                >
                  &times;
                </button>
              </div>
            ))}
            <button className="program-editor__add-btn" onClick={() => addListItem(dayIndex, 'cooldown')}>
              + Add Cooldown
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
