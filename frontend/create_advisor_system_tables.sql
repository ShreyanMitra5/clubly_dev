-- Create advisor system tables
-- Run this in your Supabase SQL Editor

-- Create advisor_requests table
CREATE TABLE IF NOT EXISTS advisor_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID,
  teacher_id UUID NOT NULL,
  student_id TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_advisor_requests_teacher_id ON advisor_requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_advisor_requests_student_id ON advisor_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_advisor_requests_status ON advisor_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Disable RLS for now (can be enabled later for security)
ALTER TABLE advisor_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_advisor_requests_updated_at ON advisor_requests;
CREATE TRIGGER update_advisor_requests_updated_at 
  BEFORE UPDATE ON advisor_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the tables were created
SELECT 'Advisor system tables created successfully!' as status; 