import { useState } from 'react';
import { WorkoutSelector } from './components/WorkoutSelector';
import { WorkoutView } from './components/WorkoutView';
import { WorkoutHistory } from './components/WorkoutHistory';
import { ProgramEditor } from './components/ProgramEditor';
import { SessionSummary } from './components/SessionSummary';
import { ProgressCharts } from './components/ProgressCharts';
import { useProgram } from './hooks/useProgram';
import { useWeightUnit } from './hooks/useWeightUnit';
import { WorkoutLog } from './types';
import './App.css';

type Screen =
  | { type: 'home' }
  | { type: 'workout'; dayId: string }
  | { type: 'history' }
  | { type: 'edit-program' }
  | { type: 'summary'; log: WorkoutLog; dayId: string }
  | { type: 'progress' };

function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'home' });
  const [program, setProgram, resetProgram] = useProgram();
  const [unit, setUnit] = useWeightUnit();

  const day = screen.type === 'workout'
    ? program.find(d => d.id === screen.dayId) ?? null
    : screen.type === 'summary'
    ? program.find(d => d.id === screen.dayId) ?? null
    : null;

  return (
    <div className="app">
      {screen.type === 'home' && (
        <WorkoutSelector
          program={program}
          unit={unit}
          onSetUnit={setUnit}
          onSelectDay={(dayId) => setScreen({ type: 'workout', dayId })}
          onViewHistory={() => setScreen({ type: 'history' })}
          onEditProgram={() => setScreen({ type: 'edit-program' })}
          onViewProgress={() => setScreen({ type: 'progress' })}
        />
      )}
      {screen.type === 'workout' && day && (
        <WorkoutView
          key={day.id + Date.now()}
          day={day}
          unit={unit}
          onBack={() => setScreen({ type: 'home' })}
          onFinish={(log) => setScreen({ type: 'summary', log, dayId: day.id })}
        />
      )}
      {screen.type === 'summary' && day && (
        <SessionSummary
          log={screen.log}
          day={day}
          unit={unit}
          onDone={() => setScreen({ type: 'home' })}
        />
      )}
      {screen.type === 'history' && (
        <WorkoutHistory
          program={program}
          unit={unit}
          onBack={() => setScreen({ type: 'home' })}
        />
      )}
      {screen.type === 'edit-program' && (
        <ProgramEditor
          program={program}
          onSave={setProgram}
          onReset={resetProgram}
          onBack={() => setScreen({ type: 'home' })}
        />
      )}
      {screen.type === 'progress' && (
        <ProgressCharts
          program={program}
          unit={unit}
          onBack={() => setScreen({ type: 'home' })}
        />
      )}
    </div>
  );
}

export default App;
