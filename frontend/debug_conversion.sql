-- Debug column conversion issue
-- Run this in your Supabase SQL Editor

-- Step 1: Check current state
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('advisor_requests', 'meeting_bookings') 
AND column_name = 'club_id'
ORDER BY table_name;

-- Step 2: Check for any constraints that might prevent conversion
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name IN ('advisor_requests', 'meeting_bookings')
AND kcu.column_name = 'club_id';

-- Step 3: Try to drop any existing constraints first
ALTER TABLE advisor_requests DROP CONSTRAINT IF EXISTS advisor_requests_club_id_fkey;
ALTER TABLE meeting_bookings DROP CONSTRAINT IF EXISTS meeting_bookings_club_id_fkey;

-- Step 4: Check if there are any other constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.table_name IN ('advisor_requests', 'meeting_bookings')
AND tc.constraint_type != 'PRIMARY KEY';

-- Step 5: Try the conversion again
ALTER TABLE advisor_requests 
ALTER COLUMN club_id TYPE UUID USING club_id::UUID;

ALTER TABLE meeting_bookings 
ALTER COLUMN club_id TYPE UUID USING club_id::UUID;

-- Step 6: Verify the conversion worked
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name IN ('advisor_requests', 'meeting_bookings') 
AND column_name = 'club_id'
ORDER BY table_name;

-- Step 7: Add foreign key constraints
ALTER TABLE advisor_requests 
ADD CONSTRAINT advisor_requests_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

ALTER TABLE meeting_bookings 
ADD CONSTRAINT meeting_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

SELECT 'Debug complete - check the results above' as status; 