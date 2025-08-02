-- Add availability for existing teachers
-- This will ensure teacher availability times show up in the search

-- 1. Check current teachers
SELECT 'Current teachers:' as info;
SELECT id, name, email, school FROM teachers;

-- 2. Check current availability 
SELECT 'Current teacher availability:' as info;
SELECT ta.*, t.name as teacher_name
FROM teacher_availability ta
LEFT JOIN teachers t ON ta.teacher_id = t.id;

-- 3. Add availability for ALL existing teachers
DO $$
DECLARE
    teacher_record RECORD;
BEGIN
    FOR teacher_record IN SELECT id, name FROM teachers LOOP
        -- Add Monday availability
        INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
        VALUES (teacher_record.id, 1, '14:00:00', '15:00:00', 'Room 204', true, true)
        ON CONFLICT (teacher_id, day_of_week, start_time, end_time) DO NOTHING;
        
        -- Add Wednesday availability  
        INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
        VALUES (teacher_record.id, 3, '15:30:00', '16:30:00', 'Room 204', true, true)
        ON CONFLICT (teacher_id, day_of_week, start_time, end_time) DO NOTHING;
        
        -- Add Friday availability
        INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
        VALUES (teacher_record.id, 5, '13:00:00', '14:00:00', 'Room 204', true, true)
        ON CONFLICT (teacher_id, day_of_week, start_time, end_time) DO NOTHING;
        
        RAISE NOTICE 'Added availability for teacher: %', teacher_record.name;
    END LOOP;
END $$;

-- 4. Verify availability was added
SELECT 'Updated teacher availability:' as info;
SELECT 
    t.name as teacher_name,
    ta.day_of_week,
    CASE ta.day_of_week
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday' 
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
        WHEN 7 THEN 'Sunday'
        ELSE 'Unknown'
    END as day_name,
    ta.start_time,
    ta.end_time
FROM teacher_availability ta
LEFT JOIN teachers t ON ta.teacher_id = t.id
ORDER BY t.name, ta.day_of_week;