-- Fix All RLS Policies - Comprehensive Solution
-- This script fixes policies for all tables to prevent "violates row-level security policy" errors

-- 1. Drop all existing policies that might be too restrictive
DROP POLICY IF EXISTS "allow_authenticated_users" ON clubs;
DROP POLICY IF EXISTS "allow_authenticated_users" ON memberships;
DROP POLICY IF EXISTS "allow_authenticated_users" ON tasks;
DROP POLICY IF EXISTS "allow_authenticated_users" ON roadmaps;
DROP POLICY IF EXISTS "allow_authenticated_users" ON teachers;
DROP POLICY IF EXISTS "allow_authenticated_users" ON teacher_availability;
DROP POLICY IF EXISTS "allow_authenticated_users" ON advisor_requests;
DROP POLICY IF EXISTS "allow_authenticated_users" ON meeting_bookings;
DROP POLICY IF EXISTS "allow_authenticated_users" ON messages;
DROP POLICY IF EXISTS "allow_authenticated_users" ON notifications;
DROP POLICY IF EXISTS "allow_authenticated_users" ON club_emails;
DROP POLICY IF EXISTS "allow_authenticated_users" ON users;
DROP POLICY IF EXISTS "allow_authenticated_users" ON roadmap_usage;
DROP POLICY IF EXISTS "allow_authenticated_users" ON presentation_usage;
DROP POLICY IF EXISTS "allow_authenticated_users" ON ai_assistant_usage;
DROP POLICY IF EXISTS "allow_authenticated_users" ON meeting_notes_usage;

-- 2. Create better policies for each table

-- Clubs: Allow reading all clubs, but only owners can modify
CREATE POLICY "clubs_read_all" ON clubs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "clubs_owner_manage" ON clubs
  FOR ALL USING (owner_id = auth.uid()::text);

-- Memberships: Allow users to manage their own memberships
CREATE POLICY "memberships_own_data" ON memberships
  FOR ALL USING (user_id = auth.uid()::text);

-- Tasks: Allow all authenticated users to read/write (since tasks are club-based)
CREATE POLICY "tasks_authenticated" ON tasks
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Roadmaps: Allow all authenticated users to read/write
CREATE POLICY "roadmaps_authenticated" ON roadmaps
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Teachers: Allow teachers to manage their own data
CREATE POLICY "teachers_own_data" ON teachers
  FOR ALL USING (user_id = auth.uid()::text);

-- Teacher Availability: Allow teachers to manage their own availability
CREATE POLICY "teacher_availability_own_data" ON teacher_availability
  FOR ALL USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()::text)
  );

-- Advisor Requests: Allow users to manage their own requests
CREATE POLICY "advisor_requests_own_data" ON advisor_requests
  FOR ALL USING (student_id = auth.uid()::text);

-- Meeting Bookings: Allow all authenticated users (since it's a booking system)
CREATE POLICY "meeting_bookings_authenticated" ON meeting_bookings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Messages: Allow users to see messages they sent/received
CREATE POLICY "messages_own_data" ON messages
  FOR ALL USING (
    sender_id = auth.uid()::text OR receiver_id = auth.uid()::text
  );

-- Notifications: Allow users to see their own notifications
CREATE POLICY "notifications_own_data" ON notifications
  FOR ALL USING (user_id = auth.uid()::text);

-- Club Emails: Allow all authenticated users (since it's club-based)
CREATE POLICY "club_emails_authenticated" ON club_emails
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Users: Allow users to manage their own data
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (id = auth.uid()::text);

-- Usage tracking tables: Allow users to see their own usage
CREATE POLICY "roadmap_usage_own_data" ON roadmap_usage
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "presentation_usage_own_data" ON presentation_usage
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "ai_assistant_usage_own_data" ON ai_assistant_usage
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "meeting_notes_usage_own_data" ON meeting_notes_usage
  FOR ALL USING (user_id = auth.uid()::text);

-- 3. Verify all policies are created
SELECT 
    '=== ALL POLICIES CREATED ===' AS info;

SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 4. Success message
SELECT 'ALL POLICIES FIXED!' AS status;
SELECT 'You should now be able to use the platform without RLS errors.' AS message;
