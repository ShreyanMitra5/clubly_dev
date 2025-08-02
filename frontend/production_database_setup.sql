-- Production Database Setup for Clubly Teacher Interface
-- Run this script in your Supabase SQL Editor to ensure all tables and constraints are properly set up

-- 1. Ensure messages table exists with proper structure
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- 3. Ensure advisor_requests table has the proper structure with day and time fields
ALTER TABLE advisor_requests ADD COLUMN IF NOT EXISTS meeting_day TEXT;
ALTER TABLE advisor_requests ADD COLUMN IF NOT EXISTS meeting_time TEXT;

-- 4. Ensure notifications table exists
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 6. Ensure teacher_availability table exists
CREATE TABLE IF NOT EXISTS teacher_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  is_recurring BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create indexes for teacher availability
CREATE INDEX IF NOT EXISTS idx_teacher_availability_teacher_id ON teacher_availability(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_availability_day ON teacher_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_teacher_availability_active ON teacher_availability(is_active);

-- 8. Ensure meeting_bookings table exists
CREATE TABLE IF NOT EXISTS meeting_bookings (
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

-- 9. Create indexes for meeting bookings
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_teacher_id ON meeting_bookings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_club_id ON meeting_bookings(club_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_date ON meeting_bookings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_status ON meeting_bookings(status);

-- 10. Enable Row Level Security (RLS) for production
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_bookings ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for messages table
CREATE POLICY IF NOT EXISTS "Teachers can view their own messages" ON messages
  FOR SELECT USING (
    sender_id IN (SELECT id::text FROM teachers WHERE user_id = auth.uid()::text) OR
    receiver_id IN (SELECT id::text FROM teachers WHERE user_id = auth.uid()::text)
  );

CREATE POLICY IF NOT EXISTS "Teachers can insert messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id::text FROM teachers WHERE user_id = auth.uid()::text)
  );

-- 12. Create RLS policies for notifications table
CREATE POLICY IF NOT EXISTS "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY IF NOT EXISTS "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- 13. Create RLS policies for teacher_availability table
CREATE POLICY IF NOT EXISTS "Teachers can manage their own availability" ON teacher_availability
  FOR ALL USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()::text));

-- 14. Create RLS policies for meeting_bookings table
CREATE POLICY IF NOT EXISTS "Teachers can view their own bookings" ON meeting_bookings
  FOR SELECT USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()::text));

CREATE POLICY IF NOT EXISTS "Teachers can manage their own bookings" ON meeting_bookings
  FOR ALL USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()::text));

-- 15. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_meeting_bookings_updated_at ON meeting_bookings;
CREATE TRIGGER update_meeting_bookings_updated_at 
  BEFORE UPDATE ON meeting_bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 17. Add constraints to ensure data integrity
ALTER TABLE advisor_requests 
  ADD CONSTRAINT IF NOT EXISTS advisor_requests_status_check 
  CHECK (status IN ('pending', 'approved', 'denied'));

-- 18. Create function to clean up old notifications (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days' 
  AND read = true;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Production database setup completed successfully!' as status;

-- Verify all tables exist
SELECT 
  'Tables created:' as info,
  string_agg(table_name, ', ') as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('messages', 'notifications', 'teacher_availability', 'meeting_bookings');