export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  locale: string;
  timezone: string;
  onboarding_completed: boolean;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  profile_id: string;
  active_modules: string[];
  target_weight: number | null;
  target_bf: number | null;
  tdee_override: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  bedtime_target: string | null;
  wake_target: string | null;
  coach_tone: string;
  detail_level: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  metric: string | null;
  target_value: number | null;
  start_value: number | null;
  current_value: number | null;
  status: "active" | "completed" | "paused" | "abandoned";
  visibility: string;
  household_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyHabit {
  id: string;
  profile_id: string;
  goal_id: string | null;
  title: string;
  description: string | null;
  xp_value: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  profile_id: string;
  habit_id: string;
  date: string;
  completed_at: string;
}

export interface DailyCheckin {
  id: string;
  profile_id: string;
  date: string;
  morning_ritual_done: boolean;
  evening_ritual_done: boolean;
  mood_1_10: number | null;
  energy_1_10: number | null;
  stress_1_10: number | null;
  steps: number | null;
  caffeine_drinks: number | null;
  alcohol_drinks: number | null;
  meditation_min: number | null;
  screen_time_min: number | null;
  notes: string | null;
  day_rating_1_10: number | null;
  best_thing: string | null;
  worst_thing: string | null;
  tomorrow_risk: string | null;
  created_at: string;
  updated_at: string;
}

export interface SleepLog {
  id: string;
  profile_id: string;
  date: string;
  bedtime: string | null;
  wake_time: string | null;
  quality_1_10: number | null;
  wake_count: number | null;
  sleep_hours: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GamificationProfile {
  profile_id: string;
  total_xp: number;
  level: number;
  title: string;
  current_streak: number;
  longest_streak: number;
  perfect_days: number;
  ok_days: number;
  missed_days: number;
  updated_at: string;
}

export interface DailyCompletion {
  id: string;
  profile_id: string;
  date: string;
  morning_checkin: boolean;
  evening_checkin: boolean;
  training_done: boolean;
  training_required: boolean;
  protein_target_met: boolean;
  bedtime_target_met: boolean;
  xp_earned: number;
  status: "pending" | "ok" | "perfect" | "missed";
  created_at: string;
  updated_at: string;
}

export interface XPLedgerEntry {
  id: string;
  profile_id: string;
  amount: number;
  reason: string;
  source_type: string | null;
  source_id: string | null;
  earned_at: string;
}

export interface UserAchievement {
  id: string;
  profile_id: string;
  achievement_id: string;
  unlocked_at: string;
}
