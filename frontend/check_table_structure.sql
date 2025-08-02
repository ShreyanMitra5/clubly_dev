-- Check actual table structures in your database
-- Run this in your Supabase SQL Editor

-- Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('clubs', 'advisor_requests', 'meeting_bookings', 'teachers')
ORDER BY table_name;

-- Check column types for each table
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('clubs', 'advisor_requests', 'meeting_bookings', 'teachers')
ORDER BY table_name, ordinal_position;

-- Check for any existing constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('advisor_requests', 'meeting_bookings')
ORDER BY tc.table_name, tc.constraint_name;

-- Check sample data to see what's actually in the tables
SELECT 'advisor_requests' as table_name, COUNT(*) as row_count FROM advisor_requests
UNION ALL
SELECT 'meeting_bookings' as table_name, COUNT(*) as row_count FROM meeting_bookings
UNION ALL
SELECT 'clubs' as table_name, COUNT(*) as row_count FROM clubs
UNION ALL
SELECT 'teachers' as table_name, COUNT(*) as row_count FROM teachers; 