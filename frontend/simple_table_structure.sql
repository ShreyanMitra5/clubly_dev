-- Simple Database Structure Report for Supabase
-- Run this in your Supabase SQL editor

-- 1. List all tables
SELECT '=== ALL TABLES ===' AS info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Get column details for each table
SELECT '=== TABLE COLUMNS ===' AS info;
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    c.character_maximum_length,
    c.ordinal_position
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
AND c.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- 3. Get primary keys
SELECT '=== PRIMARY KEYS ===' AS info;
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- 4. Get foreign keys
SELECT '=== FOREIGN KEYS ===' AS info;
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 5. Get row counts (simplified)
SELECT '=== ROW COUNTS ===' AS info;
SELECT 'advisor_requests' AS table_name, COUNT(*) AS row_count FROM advisor_requests
UNION ALL
SELECT 'clubs', COUNT(*) FROM clubs
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'presentations', COUNT(*) FROM presentations
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'teacher_availability', COUNT(*) FROM teacher_availability
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'user_usage', COUNT(*) FROM user_usage
ORDER BY table_name; 