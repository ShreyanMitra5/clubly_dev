-- Check the actual structure of the clubs table
-- Run this in your Supabase SQL Editor

-- Check clubs table structure
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clubs'
ORDER BY ordinal_position;

-- Check sample data from clubs table
SELECT id, name, owner_id, created_at
FROM clubs
LIMIT 5;

-- Check if clubs.id is actually UUID or TEXT
SELECT 
    'clubs.id data type' as info,
    data_type as actual_type
FROM information_schema.columns 
WHERE table_name = 'clubs' AND column_name = 'id';

-- Check if there are any constraints on clubs table
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'clubs'
ORDER BY tc.constraint_name; 