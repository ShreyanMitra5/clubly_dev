-- Enable RLS Only - NO POLICIES
-- This script only enables RLS without creating any policies
-- This will fix the security errors but won't restrict access
-- Use this if you want to fix the errors first, then add policies later

-- Enable RLS on all existing tables (from your error list)
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

-- Verify RLS is enabled
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

-- Success message
SELECT 'RLS ENABLED - SECURITY ERRORS FIXED!' AS status;
SELECT 'No policies created - you can add them later if needed.' AS message;
