# Workout Tracker

A mobile-first PWA for logging a 2-day gym program designed around BJJ training. Select a day, log your sets, and track progress over time — all offline with no account required.

**Live app:** https://deanbaker.github.io/workouts/

## Features

- **2-day program** — Lower Body & Posterior Chain (Day A) and Upper Body & Push/Pull (Day B)
- **Superset grouping** — exercises are visually grouped into supersets matching the program structure
- **Auto-fill from last session** — weight and reps pre-populate from your previous workout
- **Rest timer** — configurable countdown with vibration alert when time's up
- **Session history** — browse and expand past workouts to review logged sets
- **Installable PWA** — add to home screen for a native app experience
- **Offline-first** — all data stored in localStorage, works without internet

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React 18 + TypeScript
- Vite
- vite-plugin-pwa
- localStorage for persistence
