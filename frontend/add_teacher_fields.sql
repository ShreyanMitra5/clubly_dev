-- Add missing columns to teachers table
-- Run this in your Supabase SQL Editor

-- Add district, school, and subject columns to teachers table
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS subject TEXT;

-- Update existing records to have empty strings for these fields
UPDATE teachers 
SET 
  district = COALESCE(district, ''),
  school = COALESCE(school, ''),
  subject = COALESCE(subject, '')
WHERE district IS NULL OR school IS NULL OR subject IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teachers' 
AND column_name IN ('district', 'school', 'subject'); 