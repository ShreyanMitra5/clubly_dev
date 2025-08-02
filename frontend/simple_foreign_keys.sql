-- Simple foreign key fix - just add constraints
-- Run this in your Supabase SQL Editor

-- First, let's see what we're working with
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name IN ('clubs', 'advisor_requests', 'meeting_bookings') 
AND column_name IN ('id', 'club_id')
ORDER BY table_name, column_name;

-- Try to add foreign key constraints (this will fail if types don't match)
-- But it will tell us exactly what the issue is

-- Drop any existing constraints first
ALTER TABLE advisor_requests DROP CONSTRAINT IF EXISTS advisor_requests_club_id_fkey;
ALTER TABLE meeting_bookings DROP CONSTRAINT IF EXISTS meeting_bookings_club_id_fkey;

-- Try to add the constraints
ALTER TABLE advisor_requests 
ADD CONSTRAINT advisor_requests_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

ALTER TABLE meeting_bookings 
ADD CONSTRAINT meeting_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- If we get here, it worked!
SELECT 'Foreign key constraints added successfully' as status; 