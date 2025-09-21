-- ScheduleDesk Database Schema
-- Execute this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core internal entities that you fully control
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  display_name TEXT,
  avatar_uri TEXT,
  jobber_user_id TEXT, -- Link to Jobber user if applicable
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE availability_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  custom_event_name TEXT, -- For Custom event types
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  all_day BOOLEAN DEFAULT false,
  recurrence TEXT, -- JSON or enum
  monthly_recurrence JSONB, -- For complex monthly patterns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE schedule_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  data JSONB, -- Store complex schedule data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE schedule_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date_created TIMESTAMPTZ DEFAULT NOW(),
  schedule_document_id UUID REFERENCES schedule_documents(id)
);

CREATE TABLE job_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  priority_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_member_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  type TEXT DEFAULT 'object',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationship tables
CREATE TABLE team_member_skills (
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  highlight_id UUID REFERENCES team_member_highlights(id) ON DELETE CASCADE,
  PRIMARY KEY (team_member_id, highlight_id)
);

-- Cached Jobber data for performance and offline capability
CREATE TABLE jobber_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobber_id TEXT UNIQUE NOT NULL,
  title TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  instructions TEXT,
  client_data JSONB,
  assigned_users JSONB,
  status TEXT,
  last_sync TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobber_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobber_id TEXT UNIQUE NOT NULL,
  job_id TEXT,
  message TEXT,
  file_attachments JSONB,
  created_by JSONB,
  created_at TIMESTAMPTZ,
  last_edited_by JSONB,
  last_sync TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobber_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jobber_id TEXT UNIQUE NOT NULL,
  name JSONB,
  email TEXT,
  last_sync TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_availability_events_team_member ON availability_events(team_member_id);
CREATE INDEX idx_availability_events_date_range ON availability_events(start_date, end_date);
CREATE INDEX idx_schedule_documents_date_range ON schedule_documents(date_range_start, date_range_end);
CREATE INDEX idx_jobber_visits_date ON jobber_visits(start_at);
CREATE INDEX idx_app_settings_key ON app_settings(key);

-- Row Level Security (RLS) - Enable but allow all operations for now
-- You can customize these policies based on your authentication needs
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobber_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobber_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobber_users ENABLE ROW LEVEL SECURITY;

-- Temporary policies to allow all operations (customize based on your needs)
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow all operations on availability_events" ON availability_events FOR ALL USING (true);
CREATE POLICY "Allow all operations on schedule_documents" ON schedule_documents FOR ALL USING (true);
CREATE POLICY "Allow all operations on schedule_lists" ON schedule_lists FOR ALL USING (true);
CREATE POLICY "Allow all operations on job_highlights" ON job_highlights FOR ALL USING (true);
CREATE POLICY "Allow all operations on team_member_highlights" ON team_member_highlights FOR ALL USING (true);
CREATE POLICY "Allow all operations on app_settings" ON app_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on team_member_skills" ON team_member_skills FOR ALL USING (true);
CREATE POLICY "Allow all operations on jobber_visits" ON jobber_visits FOR ALL USING (true);
CREATE POLICY "Allow all operations on jobber_notes" ON jobber_notes FOR ALL USING (true);
CREATE POLICY "Allow all operations on jobber_users" ON jobber_users FOR ALL USING (true);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_availability_events_updated_at BEFORE UPDATE ON availability_events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_schedule_documents_updated_at BEFORE UPDATE ON schedule_documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();