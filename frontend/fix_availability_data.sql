-- Fix teacher availability data issues

-- 1. First, let's see what we have
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

-- 2. Remove duplicate availability entries (keep the oldest one)
DELETE FROM teacher_availability 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY teacher_id, day_of_week, start_time, end_time 
             ORDER BY created_at
           ) as rn
    FROM teacher_availability
    WHERE teacher_id = (SELECT id FROM teachers WHERE name = 'Cal High Python Club')
  ) t
  WHERE t.rn > 1
);

-- 3. Fix day_of_week values if they're incorrect
-- Standard mapping: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
-- If the current values are wrong, update them
UPDATE teacher_availability 
SET day_of_week = CASE 
  WHEN day_of_week = 1 THEN 1  -- Monday
  WHEN day_of_week = 2 THEN 2  -- Tuesday  
  WHEN day_of_week = 3 THEN 3  -- Wednesday
  WHEN day_of_week = 4 THEN 4  -- Thursday
  WHEN day_of_week = 5 THEN 5  -- Friday
  WHEN day_of_week = 6 THEN 6  -- Saturday
  WHEN day_of_week = 0 THEN 0  -- Sunday
  ELSE day_of_week
END
WHERE teacher_id = (SELECT id FROM teachers WHERE name = 'Cal High Python Club');

-- 4. Ensure all entries are active
UPDATE teacher_availability 
SET is_active = true
WHERE teacher_id = (SELECT id FROM teachers WHERE name = 'Cal High Python Club')
AND is_active = false;

-- 5. Show the cleaned up data
SELECT 
  t.name as teacher_name,
  ta.day_of_week,
  CASE ta.day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
    ELSE 'Unknown'
  END as day_name,
  ta.start_time,
  ta.end_time,
  ta.room_number,
  ta.is_active
FROM teachers t
JOIN teacher_availability ta ON t.id = ta.teacher_id
WHERE t.name = 'Cal High Python Club'
ORDER BY ta.day_of_week, ta.start_time; 