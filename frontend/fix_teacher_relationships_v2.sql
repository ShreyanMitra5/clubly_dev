-- Fix foreign key relationships for teacher advisor system - V2
-- Run this in your Supabase SQL Editor

-- First, let's check if the clubs table exists and has the right structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs') THEN
        RAISE EXCEPTION 'Clubs table does not exist. Please run the supabase_setup.sql first.';
    END IF;
END $$;

-- Check current column types and data
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('clubs', 'advisor_requests', 'meeting_bookings') 
AND column_name IN ('id', 'club_id')
ORDER BY table_name, column_name;

-- Check for problematic data (simple approach)
SELECT 'advisor_requests' as table_name, club_id, COUNT(*) as count
FROM advisor_requests 
WHERE club_id IS NOT NULL 
GROUP BY club_id
HAVING club_id = '' OR LENGTH(club_id) != 36
ORDER BY count DESC;

SELECT 'meeting_bookings' as table_name, club_id, COUNT(*) as count
FROM meeting_bookings 
WHERE club_id IS NOT NULL 
GROUP BY club_id
HAVING club_id = '' OR LENGTH(club_id) != 36
ORDER BY count DESC;

-- Step 1: Drop existing constraints
ALTER TABLE advisor_requests DROP CONSTRAINT IF EXISTS advisor_requests_club_id_fkey;
ALTER TABLE meeting_bookings DROP CONSTRAINT IF EXISTS meeting_bookings_club_id_fkey;

-- Step 2: Clean up problematic data (simple approach)
UPDATE advisor_requests 
SET club_id = NULL 
WHERE club_id = '' OR club_id IS NULL OR LENGTH(club_id) != 36;

UPDATE meeting_bookings 
SET club_id = NULL 
WHERE club_id = '' OR club_id IS NULL OR LENGTH(club_id) != 36;

-- Step 3: Make columns nullable
ALTER TABLE advisor_requests ALTER COLUMN club_id DROP NOT NULL;
ALTER TABLE meeting_bookings ALTER COLUMN club_id DROP NOT NULL;

-- Step 4: Convert to UUID
ALTER TABLE advisor_requests ALTER COLUMN club_id TYPE UUID USING club_id::UUID;
ALTER TABLE meeting_bookings ALTER COLUMN club_id TYPE UUID USING club_id::UUID;

-- Step 5: Add foreign key constraints
ALTER TABLE advisor_requests 
ADD CONSTRAINT advisor_requests_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

ALTER TABLE meeting_bookings 
ADD CONSTRAINT meeting_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('clubs', 'advisor_requests', 'meeting_bookings') 
AND column_name IN ('id', 'club_id')
ORDER BY table_name, column_name;

-- Test the relationships
SELECT 
    ar.id as request_id,
    c.name as club_name,
    ar.status,
    ar.created_at
FROM advisor_requests ar
LEFT JOIN clubs c ON ar.club_id = c.id
LIMIT 5; 