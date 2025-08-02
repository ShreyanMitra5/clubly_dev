-- Fix advisor for Robotics Club - Simple version without missing columns
-- Based on debug logs: clubId = 43156a57-dcb4-4767-8e69-7187c799a1f5, studentId = user_30Gb3DRgrLTnSV2j6dmkJ99VzSO

-- 1. First, check the actual table structure
SELECT 'advisor_requests table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'advisor_requests' 
ORDER BY ordinal_position;

-- 2. Check current data
SELECT 'Current advisor requests:' as info;
SELECT * FROM advisor_requests LIMIT 3;

-- 3. Check if we have teachers
SELECT 'Available teachers:' as info;
SELECT id, name, email FROM teachers LIMIT 3;

-- 4. Create minimal advisor request for Robotics Club (using only existing columns)
DO $$
DECLARE
    target_student_id TEXT := 'user_30Gb3DRgrLTnSV2j6dmkJ99VzSO';
    target_club_id TEXT := '43156a57-dcb4-4767-8e69-7187c799a1f5'; 
    test_teacher_id UUID;
BEGIN
    -- Get the first available teacher
    SELECT id INTO test_teacher_id FROM teachers LIMIT 1;
    
    IF test_teacher_id IS NOT NULL THEN
        -- Create minimal advisor request with only core columns
        INSERT INTO advisor_requests (
            id,
            teacher_id,
            club_id,
            student_id,
            message,
            status,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            test_teacher_id,
            target_club_id,
            target_student_id,
            'Advisor request for Robotics Club debugging',
            'approved', -- APPROVED STATUS
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created approved advisor request for Robotics Club';
        RAISE NOTICE 'Teacher ID: %, Club ID: %, Student ID: %', test_teacher_id, target_club_id, target_student_id;
    ELSE
        RAISE NOTICE 'No teachers found. Run create_test_data.sql first to create a teacher.';
    END IF;
END $$;

-- 5. Verify the specific request was created
SELECT 'NEW advisor requests for Robotics Club:' as info;
SELECT ar.*, t.name as teacher_name
FROM advisor_requests ar
LEFT JOIN teachers t ON ar.teacher_id = t.id  
WHERE ar.club_id = '43156a57-dcb4-4767-8e69-7187c799a1f5'
  AND ar.student_id = 'user_30Gb3DRgrLTnSV2j6dmkJ99VzSO';

-- 6. Final verification - exact frontend query
SELECT 'Frontend query result:' as info;
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
WHERE ar.student_id = 'user_30Gb3DRgrLTnSV2j6dmkJ99VzSO'
  AND ar.club_id = '43156a57-dcb4-4767-8e69-7187c799a1f5'
  AND ar.status = 'approved';