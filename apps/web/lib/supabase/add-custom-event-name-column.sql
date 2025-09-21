-- Add custom_event_name column to availability_events table
-- This column is needed for Custom event types

ALTER TABLE availability_events
ADD COLUMN IF NOT EXISTS custom_event_name TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'availability_events'
AND column_name = 'custom_event_name';