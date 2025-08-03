-- Create helper functions for teacher club count management
-- These functions ensure data integrity when updating teacher club counts

-- Function to increment teacher club count (when advisor request is approved)
CREATE OR REPLACE FUNCTION increment_teacher_clubs(teacher_id_param UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE teachers 
  SET current_clubs_count = current_clubs_count + 1
  WHERE id = teacher_id_param;
$$;

-- Function to decrement teacher club count (when advisor request is denied/removed)
CREATE OR REPLACE FUNCTION decrement_teacher_clubs(teacher_id_param UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE teachers 
  SET current_clubs_count = GREATEST(current_clubs_count - 1, 0)
  WHERE id = teacher_id_param;
$$;

-- Function to recalculate all teacher club counts from scratch
-- This can be used to fix any inconsistencies
CREATE OR REPLACE FUNCTION recalculate_all_teacher_clubs()
RETURNS void
LANGUAGE sql
AS $$
  UPDATE teachers
  SET current_clubs_count = (
    SELECT COUNT(*)
    FROM advisor_requests
    WHERE advisor_requests.teacher_id = teachers.id
    AND advisor_requests.status = 'approved'
  );
$$;

-- Add some sample teacher availability if none exists
DO $$
DECLARE
    teacher_record RECORD;
    availability_count INTEGER;
BEGIN
    -- Check if any teacher availability exists
    SELECT COUNT(*) INTO availability_count FROM teacher_availability;
    
    IF availability_count = 0 THEN
        -- Add default availability for all teachers
        FOR teacher_record IN SELECT id, name FROM teachers WHERE active = true LOOP
            -- Monday 3-4 PM
            INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
            VALUES (teacher_record.id, 1, '15:00:00', '16:00:00', 'Room 204', true, true);
            
            -- Wednesday 3:30-4:30 PM
            INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
            VALUES (teacher_record.id, 3, '15:30:00', '16:30:00', 'Room 204', true, true);
            
            -- Friday 2-3 PM
            INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number, is_recurring, is_active)
            VALUES (teacher_record.id, 5, '14:00:00', '15:00:00', 'Room 204', true, true);
            
            RAISE NOTICE 'Added availability for teacher: %', teacher_record.name;
        END LOOP;
        
        RAISE NOTICE 'Added default availability for all teachers';
    ELSE
        RAISE NOTICE 'Teacher availability already exists (% records)', availability_count;
    END IF;
END $$;

-- Verify the setup
SELECT 'Teacher availability summary:' as info;
SELECT 
    t.name as teacher_name,
    t.current_clubs_count,
    t.max_clubs,
    COUNT(ta.id) as availability_slots
FROM teachers t
LEFT JOIN teacher_availability ta ON t.id = ta.teacher_id AND ta.is_active = true
WHERE t.active = true
GROUP BY t.id, t.name, t.current_clubs_count, t.max_clubs
ORDER BY t.name;