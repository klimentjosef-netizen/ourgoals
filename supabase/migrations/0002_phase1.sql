-- ============================================================
-- OurGoals — Phase 1: Onboarding, Goals, Habits, Check-in
-- ============================================================

-- ======================== ALTER EXISTING ====================

ALTER TABLE profiles ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN date_of_birth date;

ALTER TABLE user_settings ADD COLUMN active_modules text[] NOT NULL DEFAULT '{}';

-- ======================== NEW TABLES ========================

-- Daily habits (user-configurable tasks tied to goals)
CREATE TABLE daily_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  xp_value integer NOT NULL DEFAULT 15,
  is_active boolean NOT NULL DEFAULT true,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER daily_habits_updated_at BEFORE UPDATE ON daily_habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own habits"
  ON daily_habits FOR ALL USING (auth.uid() = profile_id);

CREATE INDEX idx_daily_habits_profile ON daily_habits(profile_id, sort_order);

-- Habit completions (which habits were done on which day)
CREATE TABLE habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES daily_habits(id) ON DELETE CASCADE,
  date date NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, habit_id, date)
);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own habit completions"
  ON habit_completions FOR ALL USING (auth.uid() = profile_id);

CREATE INDEX idx_habit_completions_profile_date ON habit_completions(profile_id, date);

-- Sleep logs (dedicated sleep tracking)
CREATE TABLE sleep_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  bedtime timestamptz,
  wake_time timestamptz,
  quality_1_10 smallint CHECK (quality_1_10 BETWEEN 1 AND 10),
  wake_count smallint DEFAULT 0,
  sleep_hours numeric(3,1),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, date)
);

CREATE TRIGGER sleep_logs_updated_at BEFORE UPDATE ON sleep_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own sleep logs"
  ON sleep_logs FOR ALL USING (auth.uid() = profile_id);

CREATE INDEX idx_sleep_logs_profile_date ON sleep_logs(profile_id, date DESC);

-- ======================== SEED: ACHIEVEMENTS ================

INSERT INTO achievements (key, name, description, category, icon, xp_reward, condition_json) VALUES
  ('first_checkin', 'První check-in', 'Dokončil jsi svůj první check-in', 'milestone', 'clipboard-check', 50, '{"type":"count","source":"checkin","threshold":1}'),
  ('streak_7', 'Týdenní série', '7 dní v řadě', 'streak', 'flame', 100, '{"type":"streak","threshold":7}'),
  ('streak_30', 'Měsíční válec', '30 dní v řadě', 'streak', 'flame', 500, '{"type":"streak","threshold":30}'),
  ('first_goal', 'Cíl stanoven', 'Vytvořil jsi svůj první cíl', 'milestone', 'target', 50, '{"type":"count","source":"goal","threshold":1}'),
  ('goal_completed', 'Cíl splněn', 'Dokončil jsi svůj první cíl', 'milestone', 'trophy', 200, '{"type":"count","source":"goal_completed","threshold":1}'),
  ('perfect_day_1', 'Perfektní den', 'Splnil jsi všechny úkoly za den', 'consistency', 'star', 75, '{"type":"count","source":"perfect_day","threshold":1}'),
  ('perfect_week', 'Perfektní týden', '7 perfektních dnů v řadě', 'consistency', 'crown', 300, '{"type":"count","source":"perfect_day","threshold":7}'),
  ('level_5', 'Svědomitý', 'Dosáhl jsi úrovně 5', 'milestone', 'award', 0, '{"type":"level","threshold":5}'),
  ('level_10', 'Disciplinovaný', 'Dosáhl jsi úrovně 10', 'milestone', 'award', 0, '{"type":"level","threshold":10}'),
  ('level_20', 'Bojovník', 'Dosáhl jsi úrovně 20', 'milestone', 'shield', 0, '{"type":"level","threshold":20}'),
  ('xp_1000', 'Tisícovka', 'Nasbíral jsi 1000 XP', 'milestone', 'zap', 50, '{"type":"xp_total","threshold":1000}'),
  ('early_bird', 'Ranní ptáče', '5x check-in před 7:00', 'consistency', 'sunrise', 100, '{"type":"count","source":"early_checkin","threshold":5}');
