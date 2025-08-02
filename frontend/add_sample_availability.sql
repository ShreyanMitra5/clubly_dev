-- Add sample teacher availability data
-- Run this in your Supabase SQL Editor

-- First, let's check if we have any teachers
SELECT 'Checking teachers table...' as status;
SELECT id, name, school, district FROM teachers LIMIT 5;

-- Add sample availability for existing teachers (Monday slot)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
SELECT 
  t.id,
  1, -- Monday
  '14:00:00',
  '15:00:00',
  t.room_number,
  true,
  true
FROM teachers t
WHERE NOT EXISTS (
  SELECT 1 FROM teacher_availability ta WHERE ta.teacher_id = t.id
)
LIMIT 5;

-- Add sample availability for existing teachers (Tuesday slot)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
SELECT 
  t.id,
  2, -- Tuesday
  '15:30:00',
  '16:30:00',
  t.room_number,
  true,
  true
FROM teachers t
WHERE NOT EXISTS (
  SELECT 1 FROM teacher_availability ta WHERE ta.teacher_id = t.id
)
LIMIT 5;

-- Add sample availability for existing teachers (Wednesday slot)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
SELECT 
  t.id,
  3, -- Wednesday
  '13:00:00',
  '14:00:00',
  t.room_number,
  true,
  true
FROM teachers t
WHERE NOT EXISTS (
  SELECT 1 FROM teacher_availability ta WHERE ta.teacher_id = t.id
)
LIMIT 5;

-- Add sample availability for existing teachers (Thursday slot)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
SELECT 
  t.id,
  4, -- Thursday
  '16:00:00',
  '17:00:00',
  t.room_number,
  true,
  true
FROM teachers t
WHERE NOT EXISTS (
  SELECT 1 FROM teacher_availability ta WHERE ta.teacher_id = t.id
)
LIMIT 5;

-- Add sample availability for existing teachers (Friday slot)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
SELECT 
  t.id,
  5, -- Friday
  '14:30:00',
  '15:30:00',
  t.room_number,
  true,
  true
FROM teachers t
WHERE NOT EXISTS (
  SELECT 1 FROM teacher_availability ta WHERE ta.teacher_id = t.id
)
LIMIT 5;

-- Verify the data was added
SELECT 'Sample availability added successfully!' as status;
SELECT 
  t.name as teacher_name,
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
  ta.end_time,
  ta.room_number
FROM teacher_availability ta
JOIN teachers t ON ta.teacher_id = t.id
ORDER BY t.name, ta.day_of_week
LIMIT 10; 