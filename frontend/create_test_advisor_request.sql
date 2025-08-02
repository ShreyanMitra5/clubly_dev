-- Create a test advisor request to test the Teacher Advisor system
-- Run this in your Supabase SQL Editor after ensuring you have teachers and clubs

-- 1. Check what data we have
SELECT 'Checking teachers...' as info;
SELECT id, name, email, school, district FROM teachers LIMIT 3;

SELECT 'Checking clubs...' as info;  
SELECT id, name FROM clubs LIMIT 3;

-- 2. Create a test approved advisor request
-- Replace the UUIDs below with actual IDs from your database

-- First, get a teacher ID and club ID (replace these with real values)
DO $$
DECLARE
    test_teacher_id UUID;
    test_club_id TEXT;
    test_student_id TEXT := 'user_30Gb3DRgrLTnSV2j6dmkJ99VzSO'; -- Replace with your actual user ID
BEGIN
    -- Get the first available teacher
    SELECT id INTO test_teacher_id FROM teachers LIMIT 1;
    
    -- Get the first available club
    SELECT id INTO test_club_id FROM clubs LIMIT 1;
    
    -- Only create if we have both teacher and club
    IF test_teacher_id IS NOT NULL AND test_club_id IS NOT NULL THEN
        -- Create an approved advisor request
        INSERT INTO advisor_requests (
            id,
            teacher_id,
            club_id, 
            student_id,
            message,
            club_name,
            club_description,
            meeting_day,
            meeting_time,
            status,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            test_teacher_id,
            test_club_id,
            test_student_id,
            'Test advisor request for debugging the system.',
            'Test Club',
            'This is a test club for verifying the advisor system works correctly.',
            'Wednesday',
            '15:30:00',
            'approved', -- This should make it show up as accepted
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created test advisor request with teacher_id: %, club_id: %, student_id: %', 
                     test_teacher_id, test_club_id, test_student_id;
    ELSE
        RAISE NOTICE 'No teachers or clubs found. Please run create_test_data.sql first.';
    END IF;
END $$;

-- 3. Verify the advisor request was created
SELECT 'Test advisor requests:' as info;
SELECT 
    ar.id,
    ar.student_id,
    ar.club_id,
    ar.status,
    ar.created_at,
    t.name as teacher_name,
    c.name as club_name
FROM advisor_requests ar
LEFT JOIN teachers t ON ar.teacher_id = t.id  
LEFT JOIN clubs c ON ar.club_id = c.id
WHERE ar.status = 'approved'
ORDER BY ar.created_at DESC
LIMIT 5;

-- 4. Show what the frontend query should find
SELECT 'Frontend query simulation:' as info;
SELECT 
    ar.*,
    json_build_object(
        'name', t.name,
        'subject', t.subject, 
        'room_number', t.room_number,
        'email', t.email
    ) as teacher
FROM advisor_requests ar
LEFT JOIN teachers t ON ar.teacher_id = t.id
WHERE ar.student_id = 'user_30Gb3DRgrLTnSV2j6dmkJ99VzSO' -- Replace with your user ID
  AND ar.status = 'approved'
ORDER BY ar.created_at DESC;