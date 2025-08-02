-- Fix advisor requests constraint to allow new requests after removal
-- Run this in Supabase SQL Editor

-- 1. Check current constraints
SELECT 'Current constraints on advisor_requests:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'advisor_requests'::regclass;

-- 2. Check current data to understand the issue
SELECT 'Current advisor requests:' as info;
SELECT 
    id,
    club_id,
    teacher_id,
    student_id,
    status,
    created_at
FROM advisor_requests 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Drop the problematic unique constraint if it exists
DO $$
BEGIN
    -- Try to drop the constraint that's causing issues
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'advisor_requests_club_id_teacher_id_key'
        AND conrelid = 'advisor_requests'::regclass
    ) THEN
        ALTER TABLE advisor_requests DROP CONSTRAINT advisor_requests_club_id_teacher_id_key;
        RAISE NOTICE 'Dropped constraint: advisor_requests_club_id_teacher_id_key';
    END IF;
    
    -- Try alternative constraint names
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname LIKE '%club_id%teacher_id%'
        AND conrelid = 'advisor_requests'::regclass
    ) THEN
        -- Get the exact constraint name and drop it
        DECLARE
            constraint_name TEXT;
        BEGIN
            SELECT conname INTO constraint_name
            FROM pg_constraint 
            WHERE conname LIKE '%club_id%teacher_id%'
            AND conrelid = 'advisor_requests'::regclass
            LIMIT 1;
            
            IF constraint_name IS NOT NULL THEN
                EXECUTE 'ALTER TABLE advisor_requests DROP CONSTRAINT ' || constraint_name;
                RAISE NOTICE 'Dropped constraint: %', constraint_name;
            END IF;
        END;
    END IF;
END $$;

-- 4. Create a better constraint that only prevents duplicates for ACTIVE requests
-- This allows multiple requests for the same club-teacher pair if previous ones are closed/denied
CREATE UNIQUE INDEX IF NOT EXISTS advisor_requests_active_unique 
ON advisor_requests (club_id, teacher_id, student_id) 
WHERE status IN ('pending', 'approved');

-- 5. Verify the new setup
SELECT 'New constraints:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'advisor_requests'::regclass;

SELECT 'New indexes:' as info;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'advisor_requests' 
AND indexname LIKE '%unique%';

RAISE NOTICE 'Constraint fix completed. You can now send new advisor requests after removing previous ones.';