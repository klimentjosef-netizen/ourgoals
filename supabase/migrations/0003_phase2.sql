-- Phase 2: Calendar & Work module additions
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS daily_priority text;
