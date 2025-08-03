-- Check teacher availability data for issues
SELECT 
  t.name as teacher_name,
  ta.day_of_week,
  ta.start_time,
  ta.end_time,
  ta.room_number,
  ta.is_active,
  ta.created_at
FROM teachers t
JOIN teacher_availability ta ON t.id = ta.teacher_id
WHERE t.name = 'Cal High Python Club'
ORDER BY ta.day_of_week, ta.start_time;

-- Check for duplicate availability entries
SELECT 
  teacher_id,
  day_of_week,
  start_time,
  end_time,
  COUNT(*) as duplicate_count
FROM teacher_availability
WHERE teacher_id = (SELECT id FROM teachers WHERE name = 'Cal High Python Club')
GROUP BY teacher_id, day_of_week, start_time, end_time
HAVING COUNT(*) > 1
ORDER BY day_of_week, start_time;

-- Show all teachers with availability count
SELECT 
  t.name,
  t.current_clubs_count,
  t.max_clubs,
  COUNT(ta.id) as availability_slots
FROM teachers t
LEFT JOIN teacher_availability ta ON t.id = ta.teacher_id AND ta.is_active = true
GROUP BY t.id, t.name, t.current_clubs_count, t.max_clubs
ORDER BY t.name; 