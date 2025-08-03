-- Fix Teacher Club Counts - Comprehensive Solution
-- This script fixes the issue where teacher current_clubs_count is not accurate

-- 1. Create or replace the increment function
CREATE OR REPLACE FUNCTION increment_teacher_clubs(teacher_id_param UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE teachers 
  SET current_clubs_count = current_clubs_count + 1
  WHERE id = teacher_id_param;
END;
$$;

-- 2. Create or replace the decrement function
CREATE OR REPLACE FUNCTION decrement_teacher_clubs(teacher_id_param UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE teachers 
  SET current_clubs_count = GREATEST(current_clubs_count - 1, 0)
  WHERE id = teacher_id_param;
END;
$$;

-- 3. Create or replace the recalculate function
CREATE OR REPLACE FUNCTION recalculate_teacher_clubs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE teachers
  SET current_clubs_count = (
    SELECT COUNT(*)
    FROM advisor_requests
    WHERE advisor_requests.teacher_id = teachers.id
    AND advisor_requests.status = 'approved'
  );
END;
$$;

-- 4. Create or replace the recalculate all function
CREATE OR REPLACE FUNCTION recalculate_all_teacher_clubs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE teachers
  SET current_clubs_count = (
    SELECT COUNT(*)
    FROM advisor_requests
    WHERE advisor_requests.teacher_id = teachers.id
    AND advisor_requests.status = 'approved'
  );
END;
$$;

-- 5. Create trigger function to automatically update teacher club counts
CREATE OR REPLACE FUNCTION update_teacher_club_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- When a new approved request is inserted
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE teachers 
    SET current_clubs_count = current_clubs_count + 1
    WHERE id = NEW.teacher_id;
    RETURN NEW;
  END IF;
  
  -- When a request status is updated
  IF TG_OP = 'UPDATE' THEN
    -- If status changed from non-approved to approved
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
      UPDATE teachers 
      SET current_clubs_count = current_clubs_count + 1
      WHERE id = NEW.teacher_id;
    END IF;
    
    -- If status changed from approved to non-approved
    IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE teachers 
      SET current_clubs_count = GREATEST(current_clubs_count - 1, 0)
      WHERE id = NEW.teacher_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- When a request is deleted
  IF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE teachers 
    SET current_clubs_count = GREATEST(current_clubs_count - 1, 0)
    WHERE id = OLD.teacher_id;
    RETURN OLD;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS advisor_requests_teacher_count_trigger ON advisor_requests;

-- 7. Create the trigger
CREATE TRIGGER advisor_requests_teacher_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON advisor_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_teacher_club_count();

-- 8. Recalculate all teacher club counts to fix any existing inconsistencies
SELECT recalculate_all_teacher_clubs();

-- 9. Show the results
SELECT 
  t.id,
  t.name,
  t.current_clubs_count,
  t.max_clubs,
  COUNT(ar.id) as actual_approved_requests
FROM teachers t
LEFT JOIN advisor_requests ar ON t.id = ar.teacher_id AND ar.status = 'approved'
GROUP BY t.id, t.name, t.current_clubs_count, t.max_clubs
ORDER BY t.name; 