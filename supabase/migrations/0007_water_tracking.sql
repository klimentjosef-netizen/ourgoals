-- Water tracking: add water_glasses column to daily_checkins
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS water_glasses smallint DEFAULT 0;
