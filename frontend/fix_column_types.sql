-- Fix column types for empty tables
-- Run this in your Supabase SQL Editor

-- Since advisor_requests and meeting_bookings are empty (0 rows),
-- we can safely convert the club_id columns from TEXT to UUID

-- Step 1: Drop any existing constraints
ALTER TABLE advisor_requests DROP CONSTRAINT IF EXISTS advisor_requests_club_id_fkey;
ALTER TABLE meeting_bookings DROP CONSTRAINT IF EXISTS meeting_bookings_club_id_fkey;

-- Step 2: Convert advisor_requests.club_id from TEXT to UUID
ALTER TABLE advisor_requests 
ALTER COLUMN club_id TYPE UUID USING club_id::UUID;

-- Step 3: Convert meeting_bookings.club_id from TEXT to UUID  
ALTER TABLE meeting_bookings 
ALTER COLUMN club_id TYPE UUID USING club_id::UUID;

-- Step 4: Add foreign key constraints
ALTER TABLE advisor_requests 
ADD CONSTRAINT advisor_requests_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

ALTER TABLE meeting_bookings 
ADD CONSTRAINT meeting_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- Step 5: Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name IN ('clubs', 'advisor_requests', 'meeting_bookings') 
AND column_name IN ('id', 'club_id')
ORDER BY table_name, column_name;

-- Step 6: Test the relationships
SELECT 'Conversion complete - foreign keys should now work!' as status; 