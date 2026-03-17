import { useState } from 'react';
import { WorkoutSelector } from './components/WorkoutSelector';
import { WorkoutView } from './components/WorkoutView';
import { WorkoutHistory } from './components/WorkoutHistory';
import { dayA, dayB } from './data/program';
import './App.css';

type Screen = { type: 'home' } | { type: 'workout'; dayId: 'day-a' | 'day-b' } | { type: 'history' };

function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'home' });

  const day = screen.type === 'workout'
    ? (screen.dayId === 'day-a' ? dayA : dayB)
    : null;

  return (
    <div className="app">
      {screen.type === 'home' && (
        <WorkoutSelector
          onSelectDay={(dayId) => setScreen({ type: 'workout', dayId })}
          onViewHistory={() => setScreen({ type: 'history' })}
        />
      )}
      {screen.type === 'workout' && day && (
        <WorkoutView
          key={day.id + Date.now()}
          day={day}
          onBack={() => setScreen({ type: 'home' })}
        />
      )}
      {screen.type === 'history' && (
        <WorkoutHistory onBack={() => setScreen({ type: 'home' })} />
      )}
    </div>
  );
}

export default App;
