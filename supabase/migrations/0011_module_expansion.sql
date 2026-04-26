-- ============================================================
-- OurGoals — 0011: Module Expansion
-- Chybějící sloupce pro onboarding + nové tabulky pro Work & Goals
-- ============================================================

-- ======================== MISSING user_settings COLUMNS ======
-- Onboarding ukládá tato data, ale sloupce neexistovaly:

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS work_location text DEFAULT 'home';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS work_meetings jsonb DEFAULT '[]';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS week_schedule jsonb;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fixed_commitments jsonb DEFAULT '[]';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS prefer_training text;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS prefer_deep_work text;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS children_ages integer[] DEFAULT '{}';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS fiber_target_g integer;

-- ======================== DAILY HABITS EXPANSION =============
-- Podpora pro frekvenci (ne jen denní)

ALTER TABLE daily_habits ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'daily';
ALTER TABLE daily_habits ADD COLUMN IF NOT EXISTS active_days integer[] DEFAULT '{0,1,2,3,4,5,6}';

-- ======================== WORKOUT EXERCISES EXPANSION ========
-- Podpora pro supersety

ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS superset_group smallint;

-- ======================== NEW TABLE: deep_work_sessions ======
-- Work & Focus modul: timer pro deep work bloky

CREATE TABLE IF NOT EXISTS deep_work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT current_date,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  planned_minutes smallint NOT NULL DEFAULT 60,
  actual_minutes smallint,
  focus_score_1_10 smallint CHECK (focus_score_1_10 BETWEEN 1 AND 10),
  task_description text,
  interruptions smallint DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER deep_work_sessions_updated_at BEFORE UPDATE ON deep_work_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE deep_work_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own deep work sessions"
  ON deep_work_sessions FOR ALL USING (auth.uid() = profile_id);

CREATE INDEX idx_deep_work_sessions_profile_date
  ON deep_work_sessions(profile_id, date DESC);

-- ======================== NEW TABLE: work_tasks ==============
-- Task management pro Work modul

CREATE TABLE IF NOT EXISTS work_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  priority smallint DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  due_date date,
  project text,
  estimated_minutes smallint,
  actual_minutes smallint,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER work_tasks_updated_at BEFORE UPDATE ON work_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE work_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own work tasks"
  ON work_tasks FOR ALL USING (auth.uid() = profile_id);

CREATE INDEX idx_work_tasks_profile_status
  ON work_tasks(profile_id, status);

-- ======================== NEW TABLE: goal_milestones =========
-- Sub-cíle s progress tracking

CREATE TABLE IF NOT EXISTS goal_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_value numeric,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

-- RLS přes goals -> profile_id
CREATE POLICY "Own goal milestones"
  ON goal_milestones FOR ALL USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_milestones.goal_id
        AND goals.profile_id = auth.uid()
    )
  );

CREATE INDEX idx_goal_milestones_goal
  ON goal_milestones(goal_id, sort_order);

-- ======================== MISSING ACHIEVEMENTS ===============
-- checkin/actions.ts odkazuje streak_3 a streak_14, ale neexistují

INSERT INTO achievements (key, name, description, category, icon, xp_reward, condition_json)
VALUES
  ('streak_3', 'Třídenní série', '3 dny v řadě', 'streak', 'flame', 30, '{"type":"streak","threshold":3}'),
  ('streak_14', 'Dvoutýdenní série', '14 dní v řadě', 'streak', 'flame', 200, '{"type":"streak","threshold":14}')
ON CONFLICT (key) DO NOTHING;

-- ======================== WEEKLY REVIEWS EXPANSION ============
-- Přidat sloupce pro automatický souhrn

ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS avg_mood numeric(3,1);
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS avg_energy numeric(3,1);
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS avg_sleep_hours numeric(3,1);
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS training_sessions_count smallint DEFAULT 0;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS deep_work_minutes integer DEFAULT 0;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS habits_completed integer DEFAULT 0;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS habits_total integer DEFAULT 0;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS goals_progress_summary jsonb;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS xp_earned integer DEFAULT 0;
