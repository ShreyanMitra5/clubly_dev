-- Recreate tables with correct UUID types
-- Run this in your Supabase SQL Editor

-- Since both tables are empty, we can safely drop and recreate them

-- Step 1: Drop existing tables (they're empty, so no data loss)
DROP TABLE IF EXISTS meeting_bookings CASCADE;
DROP TABLE IF EXISTS advisor_requests CASCADE;

-- Step 2: Recreate advisor_requests table with correct UUID type
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

-- Step 3: Recreate meeting_bookings table with correct UUID type
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

-- Step 4: Add foreign key constraints
ALTER TABLE advisor_requests 
ADD CONSTRAINT advisor_requests_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

ALTER TABLE meeting_bookings 
ADD CONSTRAINT meeting_bookings_club_id_fkey 
FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- Step 5: Create indexes
CREATE INDEX idx_advisor_requests_club_id ON advisor_requests(club_id);
CREATE INDEX idx_advisor_requests_teacher_id ON advisor_requests(teacher_id);
CREATE INDEX idx_meeting_bookings_club_id ON meeting_bookings(club_id);
CREATE INDEX idx_meeting_bookings_teacher_id ON meeting_bookings(teacher_id);

-- Step 6: Disable RLS
ALTER TABLE advisor_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_bookings DISABLE ROW LEVEL SECURITY;

-- Step 7: Add triggers for updated_at
CREATE TRIGGER update_advisor_requests_updated_at 
  BEFORE UPDATE ON advisor_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_bookings_updated_at 
  BEFORE UPDATE ON meeting_bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Verify the structure
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name IN ('advisor_requests', 'meeting_bookings') 
AND column_name IN ('id', 'club_id', 'teacher_id')
ORDER BY table_name, column_name;

SELECT 'Tables recreated successfully with correct UUID types!' as status; 