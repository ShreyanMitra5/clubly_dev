-- Safe Disable RLS - Only disable RLS on tables that exist
-- This script safely disables Row Level Security for existing tables

-- 1. First, let's see what tables actually exist
SELECT '=== EXISTING TABLES ===' AS info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Disable RLS only for tables that exist (using IF EXISTS)
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE IF EXISTS %I DISABLE ROW LEVEL SECURITY', table_record.tablename);
        RAISE NOTICE 'Disabled RLS for table: %', table_record.tablename;
    END LOOP;
END $$;

-- 3. Drop all existing RLS policies (only if they exist)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy: % on table: %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- 4. Verify RLS is disabled for all tables
SELECT '=== RLS STATUS AFTER DISABLING ===' AS info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. Show final status
SELECT 'RLS DISABLED FOR ALL EXISTING TABLES' AS status;
SELECT 'All features should now work properly!' AS message; 