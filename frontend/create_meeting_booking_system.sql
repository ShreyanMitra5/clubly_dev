-- Create Meeting Booking System
-- This extends the existing advisor system with meeting request capabilities
-- Run this in your Supabase SQL Editor

-- First, check if meeting_bookings table exists and drop it to recreate with new schema
DROP TABLE IF EXISTS meeting_bookings CASCADE;

-- Create meeting_bookings table with approve/decline functionality
CREATE TABLE meeting_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL, -- Match clubs.id type (likely TEXT)
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL, -- Clerk user ID
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed', 'cancelled')),
  teacher_response TEXT, -- Optional note from teacher when approving/declining
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for club_id
ALTER TABLE meeting_bookings 
ADD CONSTRAINT meeting_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_meeting_bookings_club_id ON meeting_bookings(club_id);
CREATE INDEX idx_meeting_bookings_teacher_id ON meeting_bookings(teacher_id);
CREATE INDEX idx_meeting_bookings_student_id ON meeting_bookings(student_id);
CREATE INDEX idx_meeting_bookings_status ON meeting_bookings(status);
CREATE INDEX idx_meeting_bookings_meeting_date ON meeting_bookings(meeting_date);

-- Disable RLS for now (can be enabled later for security)
ALTER TABLE meeting_bookings DISABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_meeting_bookings_updated_at ON meeting_bookings;
CREATE TRIGGER update_meeting_bookings_updated_at 
  BEFORE UPDATE ON meeting_bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created successfully
SELECT 'Meeting booking system created successfully!' as status;

-- Show the table structure
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'meeting_bookings'
ORDER BY ordinal_position;