-- Disable RLS for ALL tables to fix functionality issues
-- This script disables Row Level Security for all tables in the database

-- 1. Disable RLS for all existing tables
ALTER TABLE IF EXISTS clubs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roadmaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS presentations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teacher_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS advisor_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meeting_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS club_emails DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing RLS policies to clean up
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

DROP POLICY IF EXISTS "Users can view their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can create presentations" ON presentations;
DROP POLICY IF EXISTS "Users can update their own presentations" ON presentations;
DROP POLICY IF EXISTS "Users can delete their own presentations" ON presentations;

DROP POLICY IF EXISTS "Users can view their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can create their own usage" ON user_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON user_usage;

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

-- 3. Verify RLS is disabled for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Show status
SELECT 'RLS DISABLED FOR ALL TABLES' AS status;
SELECT 'All features should now work properly!' AS message; 