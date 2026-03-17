import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  seconds: number;
  onDismiss: () => void;
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    // Three short beeps
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.65);
    osc.stop(ctx.currentTime + 0.7);
  } catch {
    // Silent fail
  }
}

export function RestTimer({ seconds, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(true);
  const hasNotified = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    setIsRunning(true);
    hasNotified.current = false;
  }, [seconds]);

  useEffect(() => {
    if (!isRunning || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          setIsRunning(false);
          if (!hasNotified.current) {
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            playBeep();
            hasNotified.current = true;
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
