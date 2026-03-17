import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  seconds: number;
  onDismiss: () => void;
}

export function RestTimer({ seconds, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(true);
  const hasVibrated = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    setIsRunning(true);
    hasVibrated.current = false;
  }, [seconds]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          setIsRunning(false);
          if (!hasVibrated.current && navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
            hasVibrated.current = true;
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  const formatTime = useCallback((s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }, []);

  const progress = 1 - remaining / seconds;
  const isDone = remaining === 0;

  return (
    <div className={`rest-timer ${isDone ? 'rest-timer--done' : ''}`}>
      <div className="rest-timer__bar" style={{ width: `${progress * 100}%` }} />
      <div className="rest-timer__content">
        <span className="rest-timer__label">{isDone ? 'Rest Complete!' : 'Rest'}</span>
        <span className="rest-timer__time">{formatTime(remaining)}</span>
        <div className="rest-timer__actions">
          {isRunning && (
            <button className="rest-timer__btn" onClick={() => setIsRunning(false)}>Pause</button>
          )}
          {!isRunning && !isDone && (
            <button className="rest-timer__btn" onClick={() => setIsRunning(true)}>Resume</button>
          )}
          <button className="rest-timer__btn rest-timer__btn--dismiss" onClick={onDismiss}>
            {isDone ? 'Next Set' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
}
