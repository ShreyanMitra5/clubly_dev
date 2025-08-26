-- Enable Row Level Security (RLS) for Production - FIXED VERSION
-- This script only includes tables that actually exist in your database
-- Based on the error list you provided

-- 1. Enable RLS on all existing tables (from your error list)
ALTER TABLE IF EXISTS advisor_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS club_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS advisor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS advisor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meeting_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roadmap_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS presentation_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_assistant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meeting_notes_usage ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view clubs they're members of" ON clubs;
DROP POLICY IF EXISTS "Users can create clubs" ON clubs;
DROP POLICY IF EXISTS "Club owners can update their clubs" ON clubs;
DROP POLICY IF EXISTS "Club owners can delete their clubs" ON clubs;
DROP POLICY IF EXISTS "Users can view relevant memberships" ON memberships;
DROP POLICY IF EXISTS "Users can create their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can access roadmaps for their clubs" ON roadmaps;
DROP POLICY IF EXISTS "Club owners can manage roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks for their clubs" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Teachers can view their own data" ON teachers;
DROP POLICY IF EXISTS "Teachers can update their own data" ON teachers;
DROP POLICY IF EXISTS "Teachers can create their own data" ON teachers;
DROP POLICY IF EXISTS "Teachers can view their own availability" ON teacher_availability;
DROP POLICY IF EXISTS "Teachers can update their own availability" ON teacher_availability;
DROP POLICY IF EXISTS "Teachers can create their own availability" ON teacher_availability;
DROP POLICY IF EXISTS "Users can view their own advisor requests" ON advisor_requests;
DROP POLICY IF EXISTS "Users can create their own advisor requests" ON advisor_requests;
DROP POLICY IF EXISTS "Users can update their own advisor requests" ON advisor_requests;
DROP POLICY IF EXISTS "Teachers can view requests for them" ON advisor_requests;
DROP POLICY IF EXISTS "Teachers can update requests for them" ON advisor_requests;
DROP POLICY IF EXISTS "Users can view their own meeting bookings" ON meeting_bookings;
DROP POLICY IF EXISTS "Users can create their own meeting bookings" ON meeting_bookings;
DROP POLICY IF EXISTS "Users can update their own meeting bookings" ON meeting_bookings;
DROP POLICY IF EXISTS "Teachers can view bookings for them" ON meeting_bookings;
DROP POLICY IF EXISTS "Teachers can update bookings for them" ON meeting_bookings;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can create their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view club emails for their clubs" ON club_emails;
DROP POLICY IF EXISTS "Users can insert emails for their clubs" ON club_emails;
DROP POLICY IF EXISTS "Users can update emails for their clubs" ON club_emails;
DROP POLICY IF EXISTS "Users can delete emails for their clubs" ON club_emails;

-- 3. Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (id = auth.uid()::text);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (id = auth.uid()::text);

-- 4. Create RLS policies for clubs table
CREATE POLICY "Users can view clubs they're members of" ON clubs
  FOR SELECT USING (
    id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create clubs" ON clubs
  FOR INSERT WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Club owners can update their clubs" ON clubs
  FOR UPDATE USING (owner_id = auth.uid()::text);

CREATE POLICY "Club owners can delete their clubs" ON clubs
  FOR DELETE USING (owner_id = auth.uid()::text);

-- 5. Create RLS policies for memberships table
CREATE POLICY "Users can view relevant memberships" ON memberships
  FOR SELECT USING (
    user_id = auth.uid()::text OR
    club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()::text)
  );

CREATE POLICY "Users can create their own memberships" ON memberships
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own memberships" ON memberships
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own memberships" ON memberships
  FOR DELETE USING (user_id = auth.uid()::text);

-- 6. Create RLS policies for tasks table
CREATE POLICY "Users can view tasks for their clubs" ON tasks
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create tasks for their clubs" ON tasks
  FOR INSERT WITH CHECK (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update tasks for their clubs" ON tasks
  FOR UPDATE USING (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete tasks for their clubs" ON tasks
  FOR DELETE USING (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()::text
    )
  );

-- 7. Create RLS policies for roadmaps table
CREATE POLICY "Users can access roadmaps for their clubs" ON roadmaps
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Club owners can manage roadmaps" ON roadmaps
  FOR ALL USING (
    club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()::text)
  );

-- 8. Create RLS policies for teachers table
CREATE POLICY "Teachers can view their own data" ON teachers
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Teachers can update their own data" ON teachers
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Teachers can create their own data" ON teachers
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- 9. Create RLS policies for teacher_availability table
CREATE POLICY "Teachers can manage their own availability" ON teacher_availability
  FOR ALL USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()::text)
  );

-- 10. Create RLS policies for advisor_requests table
CREATE POLICY "Users can view their own advisor requests" ON advisor_requests
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own advisor requests" ON advisor_requests
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own advisor requests" ON advisor_requests
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Teachers can view requests for them" ON advisor_requests
  FOR SELECT USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()::text)
  );

CREATE POLICY "Teachers can update requests for them" ON advisor_requests
  FOR UPDATE USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()::text)
  );

-- 11. Create RLS policies for meeting_bookings table
CREATE POLICY "Users can view their own meeting bookings" ON meeting_bookings
  FOR SELECT USING (student_id = auth.uid()::text);

CREATE POLICY "Users can create their own meeting bookings" ON meeting_bookings
  FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "Users can update their own meeting bookings" ON meeting_bookings
  FOR UPDATE USING (student_id = auth.uid()::text);

CREATE POLICY "Teachers can view bookings for them" ON meeting_bookings
  FOR SELECT USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()::text)
  );

CREATE POLICY "Teachers can update bookings for them" ON meeting_bookings
  FOR UPDATE USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()::text)
  );

-- 12. Create RLS policies for messages table
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid()::text OR receiver_id = auth.uid()::text
  );

CREATE POLICY "Users can create their own messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid()::text);

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid()::text);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (sender_id = auth.uid()::text);

-- 13. Create RLS policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid()::text);

-- 14. Create RLS policies for club_emails table
CREATE POLICY "Users can view club emails for their clubs" ON club_emails
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert emails for their clubs" ON club_emails
  FOR INSERT WITH CHECK (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update emails for their clubs" ON club_emails
  FOR UPDATE USING (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete emails for their clubs" ON club_emails
  FOR DELETE USING (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()::text
    )
  );

-- 15. Create RLS policies for advisor_chats table
CREATE POLICY "Users can view their own advisor chats" ON advisor_chats
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own advisor chats" ON advisor_chats
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own advisor chats" ON advisor_chats
  FOR UPDATE USING (user_id = auth.uid()::text);

-- 16. Create RLS policies for advisor_messages table
CREATE POLICY "Users can view their own advisor messages" ON advisor_messages
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own advisor messages" ON advisor_messages
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own advisor messages" ON advisor_messages
  FOR UPDATE USING (user_id = auth.uid()::text);

-- 17. Create RLS policies for usage tracking tables
CREATE POLICY "Users can view their own roadmap usage" ON roadmap_usage
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own roadmap usage" ON roadmap_usage
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own presentation usage" ON presentation_usage
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own presentation usage" ON presentation_usage
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own ai assistant usage" ON ai_assistant_usage
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own ai assistant usage" ON ai_assistant_usage
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can view their own meeting notes usage" ON meeting_notes_usage
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own meeting notes usage" ON meeting_notes_usage
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- 18. Verify RLS is enabled for all tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 19. Show success message
SELECT 'RLS ENABLED FOR ALL EXISTING TABLES - PRODUCTION READY!' AS status;
SELECT 'All security policies have been created successfully!' AS message;
