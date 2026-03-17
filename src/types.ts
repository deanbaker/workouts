export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  notes: string;
  restSeconds: number;
  superset?: string;
  videoUrl?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  warmup: string[];
  exercises: Exercise[];
  cooldown: string[];
}

export interface SetLog {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  dayId: string;
  date: string;
  exercises: ExerciseLog[];
  duration?: number;
  startTime?: string;
  notes?: string;
}
