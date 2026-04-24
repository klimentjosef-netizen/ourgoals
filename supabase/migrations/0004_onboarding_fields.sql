-- Phase: Onboarding production quality — new user_settings fields
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS work_start_time time;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS work_end_time time;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS deep_work_hours numeric(3,1);
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS work_days integer[] DEFAULT '{1,2,3,4,5}';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS track_mood boolean DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS track_energy boolean DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS track_stress boolean DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS training_days_per_week smallint;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS experience_level text;
