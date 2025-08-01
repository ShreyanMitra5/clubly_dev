-- Teacher Advisor Booking System - Fixed Version
-- This will work with your existing clubs table

-- Drop existing tables if they exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS meeting_bookings CASCADE;
DROP TABLE IF EXISTS advisor_requests CASCADE;
DROP TABLE IF EXISTS teacher_availability CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS check_booking_conflict(UUID, DATE, TIME, TIME, UUID);
DROP FUNCTION IF EXISTS update_teacher_clubs_count();

-- Create teachers table
CREATE TABLE teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  school_email TEXT,
  max_clubs INTEGER DEFAULT 3,
  current_clubs_count INTEGER DEFAULT 0,
  room_number TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher availability table
CREATE TABLE teacher_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  is_recurring BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, day_of_week, start_time, end_time)
);

-- Create advisor requests table - using UUID for club_id to match clubs table
CREATE TABLE advisor_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, teacher_id)
);

-- Create meeting bookings table
CREATE TABLE meeting_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
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
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_teacher_availability_teacher_id ON teacher_availability(teacher_id);
CREATE INDEX idx_advisor_requests_club_id ON advisor_requests(club_id);
CREATE INDEX idx_advisor_requests_teacher_id ON advisor_requests(teacher_id);
CREATE INDEX idx_meeting_bookings_club_id ON meeting_bookings(club_id);
CREATE INDEX idx_meeting_bookings_teacher_id ON meeting_bookings(teacher_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Disable RLS
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Create triggers
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

-- Insert sample data
INSERT INTO teachers (user_id, email, name, school_email, max_clubs, room_number) 
VALUES 
  ('teacher_1', 'teacher1@school.edu', 'Dr. Sarah Johnson', 'sarah.johnson@school.edu', 3, 'Room 201'),
  ('teacher_2', 'teacher2@school.edu', 'Mr. Michael Chen', 'michael.chen@school.edu', 2, 'Room 105'),
  ('teacher_3', 'teacher3@school.edu', 'Ms. Emily Rodriguez', 'emily.rodriguez@school.edu', 4, 'Room 302');

-- Insert sample availability
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
WHERE t.user_id IN ('teacher_1', 'teacher_2', 'teacher_3'); 