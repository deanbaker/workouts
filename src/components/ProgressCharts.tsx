import { useState, useRef, useEffect, useCallback } from 'react';
import { getWorkoutLogs } from '../utils/storage';
import { WorkoutDay } from '../types';
import { WeightUnit } from '../hooks/useWeightUnit';

interface Props {
  program: WorkoutDay[];
  unit: WeightUnit;
  onBack: () => void;
}

interface DataPoint {
  date: string;
  maxWeight: number;
}

export function ProgressCharts({ program, unit, onBack }: Props) {
  const exercises = program.flatMap(d => d.exercises.map(e => ({ ...e, dayId: d.id })));
  const [selectedExercise, setSelectedExercise] = useState(exercises[0]?.id ?? '');

  const logs = getWorkoutLogs().sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const dataPoints: DataPoint[] = [];
  for (const log of logs) {
    const el = log.exercises.find(e => e.exerciseId === selectedExercise);
    if (!el) continue;
    const completedSets = el.sets.filter(s => s.completed && s.weight > 0);
    if (completedSets.length === 0) continue;
    const maxWeight = Math.max(...completedSets.map(s => s.weight));
    dataPoints.push({
      date: new Date(log.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      maxWeight,
    });
  }

  // Show last 20 sessions max
  const points = dataPoints.slice(-20);

  return (
    <div className="progress">
      <header className="history__header">
        <button className="workout-view__back" onClick={onBack}>&larr; Back</button>
        <h2>Progress</h2>
      </header>

      <select
        className="progress__select"
        value={selectedExercise}
        onChange={e => setSelectedExercise(e.target.value)}
      >
        {exercises.map(e => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>

      {points.length < 2 ? (
        <p className="progress__empty">
          Need at least 2 sessions with this exercise to show a chart.
        </p>
      ) : (
        <Chart points={points} unit={unit} />
      )}
    </div>
  );
}

function Chart({ points, unit }: { points: DataPoint[]; unit: WeightUnit }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 16, bottom: 48, left: 48 };

    const values = points.map(p => p.maxWeight);
    const minVal = Math.floor(Math.min(...values) * 0.9);
    const maxVal = Math.ceil(Math.max(...values) * 1.1);
    const range = maxVal - minVal || 1;

    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    const toX = (i: number) => padding.left + (i / (points.length - 1)) * plotW;
    const toY = (v: number) => padding.top + plotH - ((v - minVal) / range) * plotH;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#2a2d3a';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (plotH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const val = maxVal - (range / gridLines) * i;
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(val)}`, padding.left - 8, y + 4);
    }

    // Line
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.maxWeight);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.maxWeight);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(toX(points.length - 1), h - padding.bottom);
    ctx.lineTo(toX(0), h - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // Dots
    points.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.maxWeight);
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f1117';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // X-axis labels (show subset to avoid crowding)
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(points.length / 6));
    points.forEach((p, i) => {
      if (i % step === 0 || i === points.length - 1) {
        ctx.fillText(p.date, toX(i), h - padding.bottom + 20);
      }
    });

    // Unit label
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(unit, padding.left, padding.top - 6);
  }, [points, unit]);

  useEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="progress__canvas"
      style={{ width: '100%', height: '260px' }}
    />
  );
}
