-- Fix tables to match clubs.id type (whatever it actually is)
-- Run this in your Supabase SQL Editor

-- First, let's see what clubs.id actually is
SELECT 
    'clubs.id type' as info,
    data_type as actual_type
FROM information_schema.columns 
WHERE table_name = 'clubs' AND column_name = 'id';

-- Drop existing tables (they're empty, so safe)
DROP TABLE IF EXISTS meeting_bookings CASCADE;
DROP TABLE IF EXISTS advisor_requests CASCADE;

-- Recreate advisor_requests table with matching type
CREATE TABLE advisor_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL,  -- Match clubs.id type (likely TEXT)
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, teacher_id)
);

-- Recreate meeting_bookings table with matching type
CREATE TABLE meeting_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL,  -- Match clubs.id type (likely TEXT)
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

-- Add foreign key constraints (should work now with matching types)
ALTER TABLE advisor_requests 
ADD CONSTRAINT advisor_requests_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

ALTER TABLE meeting_bookings 
ADD CONSTRAINT meeting_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_advisor_requests_club_id ON advisor_requests(club_id);
CREATE INDEX idx_advisor_requests_teacher_id ON advisor_requests(teacher_id);
CREATE INDEX idx_meeting_bookings_club_id ON meeting_bookings(club_id);
CREATE INDEX idx_meeting_bookings_teacher_id ON meeting_bookings(teacher_id);

-- Disable RLS
ALTER TABLE advisor_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_bookings DISABLE ROW LEVEL SECURITY;

-- Add triggers for updated_at
CREATE TRIGGER update_advisor_requests_updated_at 
  BEFORE UPDATE ON advisor_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_bookings_updated_at 
  BEFORE UPDATE ON meeting_bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the structure
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name IN ('clubs', 'advisor_requests', 'meeting_bookings') 
AND column_name IN ('id', 'club_id')
ORDER BY table_name, column_name;

SELECT 'Tables created with matching types - foreign keys should work!' as status; 