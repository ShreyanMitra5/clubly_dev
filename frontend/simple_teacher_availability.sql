-- Simple script to add teacher availability
-- Run this in Supabase SQL Editor

-- First, check if we have any teachers
SELECT 'Checking teachers...' as status;
SELECT COUNT(*) as teacher_count FROM teachers;

-- Show current availability
SELECT 'Current availability...' as status;
SELECT COUNT(*) as availability_count FROM teacher_availability;

-- Add availability for the specific teacher we see in logs
-- Cal High Python Club teacher
INSERT INTO teacher_availability (
    teacher_id,
    day_of_week,
    start_time,
    end_time,
    room_number,
    is_recurring,
    is_active
)
SELECT 
    id,
    1, -- Monday
    '14:00:00',
    '15:00:00',
    'Room 204',
    true,
    true
FROM teachers 
WHERE name LIKE '%Cal High%' OR name LIKE '%Python%' OR subject = 'CS'
ON CONFLICT (teacher_id, day_of_week, start_time, end_time) DO NOTHING;

INSERT INTO teacher_availability (
    teacher_id,
    day_of_week,
    start_time,
    end_time,
    room_number,
    is_recurring,
    is_active
)
SELECT 
    id,
    3, -- Wednesday
    '15:30:00',
    '16:30:00',
    'Room 204',
    true,
    true
FROM teachers 
WHERE name LIKE '%Cal High%' OR name LIKE '%Python%' OR subject = 'CS'
ON CONFLICT (teacher_id, day_of_week, start_time, end_time) DO NOTHING;

INSERT INTO teacher_availability (
    teacher_id,
    day_of_week,
    start_time,
    end_time,
    room_number,
    is_recurring,
    is_active
)
SELECT 
    id,
    5, -- Friday
    '13:00:00',
    '14:00:00',
    'Room 204',
    true,
    true
FROM teachers 
WHERE name LIKE '%Cal High%' OR name LIKE '%Python%' OR subject = 'CS'
ON CONFLICT (teacher_id, day_of_week, start_time, end_time) DO NOTHING;

-- Verify results
SELECT 'Final check...' as status;
SELECT 
    t.name,
    ta.day_of_week,
    CASE ta.day_of_week
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
        WHEN 7 THEN 'Sunday'
    END as day_name,
    ta.start_time,
    ta.end_time
FROM teacher_availability ta
JOIN teachers t ON ta.teacher_id = t.id
ORDER BY t.name, ta.day_of_week;