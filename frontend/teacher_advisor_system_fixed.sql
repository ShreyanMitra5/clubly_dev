-- Teacher Advisor Booking System Database Schema
-- Extends existing Clubly system with teacher management and booking capabilities

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  school_email TEXT, -- For Google Workspace integration
  max_clubs INTEGER DEFAULT 3, -- Maximum number of clubs they can advise
  current_clubs_count INTEGER DEFAULT 0,
  room_number TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher availability table
CREATE TABLE IF NOT EXISTS teacher_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  is_recurring BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, day_of_week, start_time, end_time)
);

-- Create advisor requests table
CREATE TABLE IF NOT EXISTS advisor_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL, -- Clerk user ID of requesting student
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, teacher_id)
);

-- Create meeting bookings table
CREATE TABLE IF NOT EXISTS meeting_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL, -- Clerk user ID of booking student
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  purpose TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  type TEXT NOT NULL, -- 'advisor_request', 'booking_confirmed', 'availability_updated', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- ID of related record (advisor_request_id, booking_id, etc.)
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);
CREATE INDEX IF NOT EXISTS idx_teacher_availability_teacher_id ON teacher_availability(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_availability_day_time ON teacher_availability(day_of_week, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_advisor_requests_club_id ON advisor_requests(club_id);
CREATE INDEX IF NOT EXISTS idx_advisor_requests_teacher_id ON advisor_requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_advisor_requests_status ON advisor_requests(status);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_club_id ON meeting_bookings(club_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_teacher_id ON meeting_bookings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_date_time ON meeting_bookings(meeting_date, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Disable RLS for new tables (following existing pattern)
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_teachers_updated_at 
  BEFORE UPDATE ON teachers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_availability_updated_at 
  BEFORE UPDATE ON teacher_availability 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advisor_requests_updated_at 
  BEFORE UPDATE ON advisor_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_bookings_updated_at 
  BEFORE UPDATE ON meeting_bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to check booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_teacher_id UUID,
  p_meeting_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM meeting_bookings 
    WHERE teacher_id = p_teacher_id 
      AND meeting_date = p_meeting_date 
      AND status = 'confirmed'
      AND (
        (start_time < p_end_time AND end_time > p_start_time)
        OR (start_time = p_start_time AND end_time = p_end_time)
      )
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to update teacher's current clubs count
CREATE OR REPLACE FUNCTION update_teacher_clubs_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE teachers 
    SET current_clubs_count = current_clubs_count + 1
    WHERE id = NEW.teacher_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE teachers 
    SET current_clubs_count = current_clubs_count - 1
    WHERE id = OLD.teacher_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update teacher's clubs count
CREATE TRIGGER update_teacher_clubs_count_trigger
  AFTER INSERT OR DELETE ON advisor_requests
  FOR EACH ROW
  WHEN (NEW.status = 'approved' OR OLD.status = 'approved')
  EXECUTE FUNCTION update_teacher_clubs_count();

-- Insert sample teacher data (for testing)
INSERT INTO teachers (user_id, email, name, school_email, max_clubs, room_number) 
VALUES 
  ('teacher_1', 'teacher1@school.edu', 'Dr. Sarah Johnson', 'sarah.johnson@school.edu', 3, 'Room 201'),
  ('teacher_2', 'teacher2@school.edu', 'Mr. Michael Chen', 'michael.chen@school.edu', 2, 'Room 105'),
  ('teacher_3', 'teacher3@school.edu', 'Ms. Emily Rodriguez', 'emily.rodriguez@school.edu', 4, 'Room 302')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample availability (for testing)
INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time, room_number)
SELECT 
  t.id,
  d.day,
  d.start_time,
  d.end_time,
  t.room_number
FROM teachers t
CROSS JOIN (
  VALUES 
    (1, '15:00:00'::TIME, '16:00:00'::TIME),
    (3, '14:00:00'::TIME, '15:00:00'::TIME),
    (5, '13:00:00'::TIME, '14:00:00'::TIME)
) AS d(day, start_time, end_time)
WHERE t.user_id IN ('teacher_1', 'teacher_2', 'teacher_3')
ON CONFLICT (teacher_id, day_of_week, start_time, end_time) DO NOTHING; 