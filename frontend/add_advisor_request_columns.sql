-- Add missing columns to advisor_requests table
-- Run this in Supabase SQL Editor

-- Add meeting_day and meeting_time columns if they don't exist
ALTER TABLE advisor_requests ADD COLUMN IF NOT EXISTS meeting_day TEXT;
ALTER TABLE advisor_requests ADD COLUMN IF NOT EXISTS meeting_time TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'advisor_requests' 
AND column_name IN ('meeting_day', 'meeting_time')
ORDER BY column_name;

-- Show current table structure
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'advisor_requests'
ORDER BY ordinal_position;