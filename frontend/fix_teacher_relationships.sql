-- Fix foreign key relationships for teacher advisor system
-- Run this in your Supabase SQL Editor

-- First, let's check if the clubs table exists and has the right structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs') THEN
        RAISE EXCEPTION 'Clubs table does not exist. Please run the supabase_setup.sql first.';
    END IF;
END $$;

-- Check current column types
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('clubs', 'advisor_requests', 'meeting_bookings') 
AND column_name IN ('id', 'club_id')
ORDER BY table_name, column_name;

-- Fix data type mismatches
-- Convert club_id columns from TEXT to UUID to match clubs.id

-- First, drop any existing constraints that might conflict
ALTER TABLE advisor_requests DROP CONSTRAINT IF EXISTS advisor_requests_club_id_fkey;
ALTER TABLE meeting_bookings DROP CONSTRAINT IF EXISTS meeting_bookings_club_id_fkey;

-- Simple approach: just convert and let PostgreSQL handle errors
-- We'll clean up any issues manually if needed

-- Convert advisor_requests.club_id
ALTER TABLE advisor_requests 
ALTER COLUMN club_id DROP NOT NULL;

-- Try direct conversion, if it fails we'll handle it
ALTER TABLE advisor_requests 
ALTER COLUMN club_id TYPE UUID USING club_id::UUID;

-- Convert meeting_bookings.club_id  
ALTER TABLE meeting_bookings 
ALTER COLUMN club_id DROP NOT NULL;

-- Try direct conversion, if it fails we'll handle it
ALTER TABLE meeting_bookings 
ALTER COLUMN club_id TYPE UUID USING club_id::UUID;

-- Now add the foreign key constraints
ALTER TABLE advisor_requests 
ADD CONSTRAINT advisor_requests_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

ALTER TABLE meeting_bookings 
ADD CONSTRAINT meeting_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- Verify the constraints were added
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('advisor_requests', 'meeting_bookings');

-- Test the relationships by trying to select with joins
SELECT 
    ar.id as request_id,
    c.name as club_name,
    ar.status,
    ar.created_at
FROM advisor_requests ar
LEFT JOIN clubs c ON ar.club_id = c.id
LIMIT 5; 