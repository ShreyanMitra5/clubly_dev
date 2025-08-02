-- Fix advisor_requests table constraint
-- Run this in your Supabase SQL Editor

-- Make club_id nullable since students might not have a club yet
ALTER TABLE advisor_requests ALTER COLUMN club_id DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'advisor_requests' AND column_name = 'club_id';

SELECT 'club_id constraint fixed successfully!' as status; 