-- Quick test data setup for advisor system
-- Run this in your Supabase SQL Editor

-- 1. Check current data
SELECT 'Current teachers count:' as info, COUNT(*) as count FROM teachers;
SELECT 'Current availability count:' as info, COUNT(*) as count FROM teacher_availability;
SELECT 'Current advisor requests count:' as info, COUNT(*) as count FROM advisor_requests;

-- 2. Create test teacher if none exist
INSERT INTO teachers (id, name, email, school, district, subject, room_number, max_clubs, current_clubs_count, is_active, user_id)
VALUES (
  gen_random_uuid(),
  'Dr. Sarah Johnson',
  'sarah.johnson@school.edu',
  'Lincoln High School', 
  'Central District',
  'Science',
  'Room 204',
  3,
  0,
  true,
  gen_random_uuid()
) ON CONFLICT (email) DO NOTHING;

-- 3. Add availability for the test teacher
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
WHERE t.email = 'sarah.johnson@school.edu'
ON CONFLICT (teacher_id, day_of_week, start_time, end_time) DO NOTHING;

INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
SELECT 
  t.id,
  3, -- Wednesday
  '15:30:00',
  '16:30:00',
  t.room_number,
  true,
  true
FROM teachers t 
WHERE t.email = 'sarah.johnson@school.edu'
ON CONFLICT (teacher_id, day_of_week, start_time, end_time) DO NOTHING;

-- 4. Final check
SELECT 'Teachers with availability:' as info;
SELECT 
  t.name,
  t.school,
  t.district,
  t.subject,
  t.room_number,
  COUNT(ta.id) as availability_slots
FROM teachers t
LEFT JOIN teacher_availability ta ON t.id = ta.teacher_id
GROUP BY t.id, t.name, t.school, t.district, t.subject, t.room_number
ORDER BY t.name;

SELECT 'All availability slots:' as info;
SELECT 
  t.name,
  CASE ta.day_of_week
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday' 
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
  END as day_name,
  ta.start_time,
  ta.end_time,
  ta.room_number
FROM teacher_availability ta
JOIN teachers t ON ta.teacher_id = t.id
ORDER BY t.name, ta.day_of_week, ta.start_time;