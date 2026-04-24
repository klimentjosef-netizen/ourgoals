export type ExerciseCategory = "push" | "pull" | "legs" | "core" | "cardio" | "mobility" | "compound";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  primary_muscle: string | null;
  secondary_muscles: string[] | null;
  equipment: string | null;
  demo_url: string | null;
  created_at: string;
}

export interface TrainingPlan {
  id: string;
  profile_id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  split_type: string | null;
  days_per_week: number | null;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  plan_id: string;
  day_index: number;
  day_label: string;
  focus: string | null;
  target_duration_min: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  order_idx: number;
  exercise_id: string;
  sets: number;
  reps_low: number | null;
  reps_high: number | null;
  rpe_target: number | null;
  rest_sec: number | null;
  notes: string | null;
  created_at: string;
  exercises?: Exercise;
}

export interface WorkoutSession {
  id: string;
  profile_id: string;
  workout_id: string | null;
  date: string;
  started_at: string | null;
  completed_at: string | null;
  mood_1_10: number | null;
  energy_1_10: number | null;
  notes: string | null;
  visibility: string;
  household_id: string | null;
  created_at: string;
  updated_at: string;
  workouts?: Workout;
}

export interface SetLog {
  id: string;
  session_id: string;
  exercise_id: string;
  set_idx: number;
  weight_kg: number | null;
  reps: number | null;
  rpe: number | null;
  is_warmup: boolean;
  completed_at: string | null;
}

export interface BodyMetric {
  id: string;
  profile_id: string;
  date: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hip_cm: number | null;
  thigh_cm: number | null;
  arm_cm: number | null;
  sleep_hours: number | null;
  morning_feel_1_10: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const EXERCISE_CATEGORIES: Record<ExerciseCategory, string> = {
  push: "Tlaky",
  pull: "Tahy",
  legs: "Nohy",
  core: "Core",
  cardio: "Kardio",
  mobility: "Mobilita",
  compound: "Compound",
};
