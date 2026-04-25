-- Goal types and areas for rich goal system
ALTER TABLE goals ADD COLUMN IF NOT EXISTS goal_type text NOT NULL DEFAULT 'measurable';
-- goal_type: 'measurable' | 'habit' | 'oneoff' | 'challenge' | 'shared'

ALTER TABLE goals ADD COLUMN IF NOT EXISTS area text NOT NULL DEFAULT 'other';
-- area: 'health' | 'work' | 'finance' | 'growth' | 'relationships' | 'mental' | 'home' | 'other'

ALTER TABLE goals ADD COLUMN IF NOT EXISTS frequency text;
-- for habit goals: 'daily' | '3x_week' | '4x_week' | '5x_week' | 'weekly'

ALTER TABLE goals ADD COLUMN IF NOT EXISTS frequency_target integer;
-- for habit goals: how many times per period (e.g. 4 for 4x/week)

ALTER TABLE goals ADD COLUMN IF NOT EXISTS challenge_days integer;
-- for challenge goals: 30, 60, 90, custom

ALTER TABLE goals ADD COLUMN IF NOT EXISTS challenge_start date;
-- when the challenge started
