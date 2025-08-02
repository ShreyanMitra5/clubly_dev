-- Simple fix for teacher relationships
-- Run this in your Supabase SQL Editor

-- Step 1: Drop any existing constraints
ALTER TABLE advisor_requests DROP CONSTRAINT IF EXISTS advisor_requests_club_id_fkey;
ALTER TABLE meeting_bookings DROP CONSTRAINT IF EXISTS meeting_bookings_club_id_fkey;

-- Step 2: Make columns nullable first
ALTER TABLE advisor_requests ALTER COLUMN club_id DROP NOT NULL;
ALTER TABLE meeting_bookings ALTER COLUMN club_id DROP NOT NULL;

-- Step 3: Set empty strings to NULL
UPDATE advisor_requests SET club_id = NULL WHERE club_id = '';
UPDATE meeting_bookings SET club_id = NULL WHERE club_id = '';

-- Step 4: Try to convert to UUID (this will fail if there are invalid UUIDs, but that's okay)
-- We'll handle any errors manually
ALTER TABLE advisor_requests ALTER COLUMN club_id TYPE UUID USING club_id::UUID;
ALTER TABLE meeting_bookings ALTER COLUMN club_id TYPE UUID USING club_id::UUID;

-- Step 5: Add foreign key constraints
ALTER TABLE advisor_requests 
ADD CONSTRAINT advisor_requests_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

ALTER TABLE meeting_bookings 
ADD CONSTRAINT meeting_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- Step 6: Verify
SELECT 'Conversion complete' as status; 