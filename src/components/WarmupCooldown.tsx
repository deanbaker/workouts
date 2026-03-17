import { useState } from 'react';

interface Props {
  title: string;
  items: string[];
}

export function WarmupCooldown({ title, items }: Props) {
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));

  const toggle = (index: number) => {
    setChecked(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const allDone = checked.every(Boolean);

  return (
    <div className={`warmup-cooldown ${allDone ? 'warmup-cooldown--done' : ''}`}>
      <h3 className="warmup-cooldown__title">{title}</h3>
      <ul className="warmup-cooldown__list">
        {items.map((item, i) => (
          <li key={i} className="warmup-cooldown__item">
            <label className={`warmup-cooldown__label ${checked[i] ? 'warmup-cooldown__label--checked' : ''}`}>
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="warmup-cooldown__checkbox"
              />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
