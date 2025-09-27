-- Fix normal_schedule_events to use jobber_user_id instead of UUID
-- Execute this in your Supabase SQL Editor

-- First, drop the existing table if it exists
DROP TABLE IF EXISTS normal_schedule_events CASCADE;

-- Create the table with jobber_user_id instead of team_member_id UUID
CREATE TABLE normal_schedule_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobber_user_id TEXT NOT NULL, -- Use Jobber ID directly instead of internal UUID
  day_of_week TEXT NOT NULL, -- 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  event_type TEXT NOT NULL,
  custom_event_name TEXT, -- For Custom event types
  start_time TIME,
  end_time TIME,
  all_day BOOLEAN DEFAULT false,
  recurrence TEXT, -- JSON or enum for complex recurring patterns (if needed)
  monthly_recurrence JSONB, -- For complex monthly patterns (if needed)
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for better performance
CREATE INDEX idx_normal_schedule_events_jobber_user ON normal_schedule_events(jobber_user_id);
CREATE INDEX idx_normal_schedule_events_day_of_week ON normal_schedule_events(day_of_week);

-- Row Level Security
ALTER TABLE normal_schedule_events ENABLE ROW LEVEL SECURITY;

-- Temporary policy to allow all operations (customize based on your needs)
CREATE POLICY "Allow all operations on normal_schedule_events" ON normal_schedule_events FOR ALL USING (true);

-- Update trigger for updated_at column
CREATE TRIGGER update_normal_schedule_events_updated_at
  BEFORE UPDATE ON normal_schedule_events
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add constraint to ensure day_of_week is valid
ALTER TABLE normal_schedule_events
ADD CONSTRAINT check_day_of_week
CHECK (day_of_week IN ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'));