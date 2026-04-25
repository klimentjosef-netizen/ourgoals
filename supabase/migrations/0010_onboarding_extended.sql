-- Extended onboarding fields for user_settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS nutrition_tracking_level text DEFAULT 'macros';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS allergies text[] DEFAULT '{}';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS diet_type text DEFAULT 'none';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS meals_per_day smallint DEFAULT 3;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS has_partner boolean DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS has_children boolean DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS children_count smallint DEFAULT 0;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS sharing_preferences text[] DEFAULT '{}';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS training_location text DEFAULT 'gym';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS training_goal text DEFAULT 'maintain';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS track_meditation boolean DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS track_screen_time boolean DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS track_caffeine boolean DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS track_alcohol boolean DEFAULT false;
