-- ============================================================
-- OurGoals — 0012: Household/Partner Expansion
-- Společné úkoly, rituály, quality time, vztahový dotazník
-- ============================================================

-- ======================== HOUSEHOLD TASKS ====================
-- Sdílené úkoly s přiřazením osoby

CREATE TABLE IF NOT EXISTS household_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id),
  assigned_to uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  category text DEFAULT 'general' CHECK (category IN ('general', 'groceries', 'cleaning', 'kids', 'cooking', 'errands', 'finance')),
  priority smallint DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  due_date date,
  due_time time,
  recurring text, -- 'daily', 'weekly', 'monthly', null
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  completed_at timestamptz,
  completed_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER household_tasks_updated_at BEFORE UPDATE ON household_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE household_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage tasks"
  ON household_tasks FOR ALL USING (
    is_household_member(household_id, auth.uid())
  );

CREATE INDEX idx_household_tasks_household
  ON household_tasks(household_id, status);

-- ======================== RELATIONSHIP CHECK-INS =============
-- Týdenní vztahový dotazník

CREATE TABLE IF NOT EXISTS relationship_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id),
  week_start date NOT NULL,
  -- 1-10 scores
  connection_score smallint CHECK (connection_score BETWEEN 1 AND 10),
  communication_score smallint CHECK (communication_score BETWEEN 1 AND 10),
  support_score smallint CHECK (support_score BETWEEN 1 AND 10),
  quality_time_score smallint CHECK (quality_time_score BETWEEN 1 AND 10),
  -- Free text
  grateful_for text,
  wish_for text,
  highlight text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, profile_id, week_start)
);

ALTER TABLE relationship_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage checkins"
  ON relationship_checkins FOR ALL USING (
    is_household_member(household_id, auth.uid())
  );

-- ======================== QUALITY TIME LOGS ==================
-- Sledování společně stráveného času

CREATE TABLE IF NOT EXISTS quality_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  logged_by uuid NOT NULL REFERENCES profiles(id),
  date date NOT NULL DEFAULT current_date,
  minutes integer NOT NULL,
  activity text, -- 'dinner', 'walk', 'movie', 'talk', 'date_night', 'exercise', 'other'
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quality_time_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage quality time"
  ON quality_time_logs FOR ALL USING (
    is_household_member(household_id, auth.uid())
  );

-- ======================== SHARED CHALLENGES ==================
-- Společné výzvy (30 dní bez cukru spolu, atd.)

CREATE TABLE IF NOT EXISTS shared_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  start_date date NOT NULL DEFAULT current_date,
  duration_days integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shared_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage challenges"
  ON shared_challenges FOR ALL USING (
    is_household_member(household_id, auth.uid())
  );

-- Challenge daily completions (each member marks their day)
CREATE TABLE IF NOT EXISTS shared_challenge_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES shared_challenges(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id),
  date date NOT NULL,
  completed boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, profile_id, date)
);

ALTER TABLE shared_challenge_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage challenge days"
  ON shared_challenge_days FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shared_challenges sc
      WHERE sc.id = challenge_id
        AND is_household_member(sc.household_id, auth.uid())
    )
  );

-- ======================== PARTNER NOTE ENHANCEMENTS ==========
-- Přidat pole pro lepší tracking

ALTER TABLE partner_notes ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE partner_notes ADD COLUMN IF NOT EXISTS emoji text;

-- ======================== HOUSEHOLD MILESTONES ===============
-- Výročí, společné achievementy

CREATE TABLE IF NOT EXISTS household_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  category text DEFAULT 'anniversary' CHECK (category IN ('anniversary', 'achievement', 'memory', 'goal_completed')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE household_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Household members can manage milestones"
  ON household_milestones FOR ALL USING (
    is_household_member(household_id, auth.uid())
  );
