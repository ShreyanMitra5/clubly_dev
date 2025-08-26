-- RLS Setup Verification Script
-- Run this after enabling RLS to verify everything is working correctly

-- 1. Check RLS status for all tables
SELECT 
    '=== RLS STATUS CHECK ===' AS info;

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

-- 2. Check existing policies
SELECT 
    '=== EXISTING POLICIES ===' AS info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Test basic authentication (this should work if RLS is properly configured)
SELECT 
    '=== AUTHENTICATION TEST ===' AS info;

-- This will show the current authenticated user (should be null if not authenticated)
SELECT 
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ User authenticated: ' || auth.uid()::text
        ELSE '⚠️ No user authenticated (this is normal for SQL editor)'
    END as auth_status;

-- 4. Check table access permissions
SELECT 
    '=== TABLE ACCESS CHECK ===' AS info;

-- Try to access each table (this will show if RLS policies are working)
SELECT 'users' as table_name, COUNT(*) as accessible_rows FROM users
UNION ALL
SELECT 'clubs' as table_name, COUNT(*) as accessible_rows FROM clubs
UNION ALL
SELECT 'memberships' as table_name, COUNT(*) as accessible_rows FROM memberships
UNION ALL
SELECT 'tasks' as table_name, COUNT(*) as accessible_rows FROM tasks
UNION ALL
SELECT 'roadmaps' as table_name, COUNT(*) as accessible_rows FROM roadmaps
UNION ALL
SELECT 'teachers' as table_name, COUNT(*) as accessible_rows FROM teachers
UNION ALL
SELECT 'teacher_availability' as table_name, COUNT(*) as accessible_rows FROM teacher_availability
UNION ALL
SELECT 'advisor_requests' as table_name, COUNT(*) as accessible_rows FROM advisor_requests
UNION ALL
SELECT 'meeting_bookings' as table_name, COUNT(*) as accessible_rows FROM meeting_bookings
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as accessible_rows FROM messages
UNION ALL
SELECT 'notifications' as table_name, COUNT(*) as accessible_rows FROM notifications
UNION ALL
SELECT 'club_emails' as table_name, COUNT(*) as accessible_rows FROM club_emails
ORDER BY table_name;

-- 5. Summary
SELECT 
    '=== SUMMARY ===' AS info;

SELECT 
    COUNT(*) as total_tables,
    COUNT(CASE WHEN rowsecurity = true THEN 1 END) as rls_enabled_tables,
    COUNT(CASE WHEN rowsecurity = false THEN 1 END) as rls_disabled_tables
FROM pg_tables 
WHERE schemaname = 'public';

SELECT 
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- 6. Final status
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false) = 0 
        THEN '✅ ALL TABLES HAVE RLS ENABLED - PRODUCTION READY!'
        ELSE '❌ SOME TABLES STILL HAVE RLS DISABLED'
    END as final_status;
