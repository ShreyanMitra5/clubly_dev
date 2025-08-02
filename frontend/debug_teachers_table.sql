-- Debug teachers table - comprehensive check
-- Run this in your Supabase SQL Editor

-- 1. Check if the table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'teachers'
) as table_exists;

-- 2. Check table structure
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'teachers'
ORDER BY ordinal_position;

-- 3. Check if there are any rows
SELECT COUNT(*) as total_teachers FROM teachers;

-- 4. Show sample data (if any exists)
SELECT 
    id,
    user_id,
    name,
    school,
    district,
    subject,
    max_clubs,
    current_clubs_count,
    active,
    created_at
FROM teachers
LIMIT 5;

-- 5. Check for any constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'teachers';

-- 6. Test the exact query that's failing
SELECT 
    id,
    name,
    school,
    district,
    subject,
    max_clubs,
    current_clubs_count,
    active
FROM teachers 
WHERE school = 'Lincoln High School' 
AND district = 'Los Angeles Unified' 
AND active = true 
AND current_clubs_count < max_clubs 
ORDER BY name;

-- 7. Check for any data type issues
SELECT 
    'school' as column_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN school IS NULL THEN 1 END) as null_count,
    COUNT(DISTINCT school) as unique_values
FROM teachers
UNION ALL
SELECT 
    'district' as column_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN district IS NULL THEN 1 END) as null_count,
    COUNT(DISTINCT district) as unique_values
FROM teachers
UNION ALL
SELECT 
    'active' as column_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN active IS NULL THEN 1 END) as null_count,
    COUNT(DISTINCT active) as unique_values
FROM teachers; 