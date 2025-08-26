-- Test RLS Setup - Verify Everything is Working
-- Run this script to test your RLS configuration

-- 1. Check RLS Status
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

-- 2. Check Policies
SELECT 
    '=== POLICIES CHECK ===' AS info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Test Authentication Status
SELECT 
    '=== AUTHENTICATION TEST ===' AS info;

SELECT 
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ User authenticated: ' || auth.uid()::text
        ELSE '⚠️ No user authenticated (this is normal in SQL editor)'
    END as auth_status;

-- 4. Test Table Access (this will show if policies are working)
SELECT 
    '=== TABLE ACCESS TEST ===' AS info;

-- Try to access each table and count rows
-- If policies are working, these should return row counts
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
UNION ALL
SELECT 'roadmap_usage' as table_name, COUNT(*) as accessible_rows FROM roadmap_usage
UNION ALL
SELECT 'presentation_usage' as table_name, COUNT(*) as accessible_rows FROM presentation_usage
UNION ALL
SELECT 'ai_assistant_usage' as table_name, COUNT(*) as accessible_rows FROM ai_assistant_usage
UNION ALL
SELECT 'meeting_notes_usage' as table_name, COUNT(*) as accessible_rows FROM meeting_notes_usage
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

-- 6. Final Status
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false) = 0 
        THEN '✅ ALL TABLES HAVE RLS ENABLED'
        ELSE '❌ SOME TABLES STILL HAVE RLS DISABLED'
    END as rls_status;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') > 0 
        THEN '✅ POLICIES ARE CREATED'
        ELSE '❌ NO POLICIES FOUND'
    END as policies_status;

-- 7. Test Insert (this will show if policies allow data modification)
SELECT 
    '=== INSERT TEST ===' AS info;

-- Try to insert a test notification (this should work if policies are correct)
INSERT INTO notifications (user_id, title, message, type) 
VALUES ('test_user_123', 'Test Notification', 'This is a test', 'test')
ON CONFLICT DO NOTHING;

-- Check if the test record was inserted
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM notifications WHERE user_id = 'test_user_123') 
        THEN '✅ INSERT TEST PASSED - Policies allow data modification'
        ELSE '❌ INSERT TEST FAILED - Policies may be too restrictive'
    END as insert_test_result;

-- Clean up test data
DELETE FROM notifications WHERE user_id = 'test_user_123';

-- 8. Final Result
SELECT 
    '=== FINAL RESULT ===' AS info;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) >= 16
        AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 16
        THEN '🎉 RLS SETUP IS WORKING CORRECTLY!'
        ELSE '⚠️ RLS SETUP NEEDS ATTENTION'
    END as final_result;
