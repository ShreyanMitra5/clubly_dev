-- Create functions to safely update teacher club counts
-- These functions ensure the count never goes below 0

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

-- Create function to recalculate teacher club counts from advisor_requests
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