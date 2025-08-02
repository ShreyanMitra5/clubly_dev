-- Check teachers table structure and add test data
-- Run this in your Supabase SQL Editor

-- First, let's check the current structure
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'teachers'
ORDER BY ordinal_position;

-- Check if there are any teachers in the table
SELECT COUNT(*) as teacher_count FROM teachers;

-- If no teachers exist, let's add some test data
-- (Replace the user_id with actual Clerk user IDs from your system)
INSERT INTO teachers (
    user_id,
    email,
    name,
    school_email,
    district,
    school,
    subject,
    max_clubs,
    current_clubs_count,
    room_number,
    active
) VALUES 
(
    'test_teacher_1', -- Replace with actual Clerk user ID
    'teacher1@school.edu',
    'Dr. Sarah Johnson',
    'teacher1@school.edu',
    'Los Angeles Unified',
    'Lincoln High School',
    'Computer Science',
    5,
    2,
    'Room 201',
    true
),
(
    'test_teacher_2', -- Replace with actual Clerk user ID
    'teacher2@school.edu',
    'Mr. Michael Chen',
    'teacher2@school.edu',
    'Los Angeles Unified',
    'Lincoln High School',
    'Mathematics',
    3,
    1,
    'Room 305',
    true
),
(
    'test_teacher_3', -- Replace with actual Clerk user ID
    'teacher3@school.edu',
    'Ms. Emily Rodriguez',
    'teacher3@school.edu',
    'Los Angeles Unified',
    'Lincoln High School',
    'Science',
    4,
    0,
    'Room 102',
    true
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify the test data was added
SELECT 
    name,
    school,
    district,
    subject,
    max_clubs,
    current_clubs_count,
    active
FROM teachers
ORDER BY name;

-- Test the query that's failing
SELECT * 
FROM teachers 
WHERE school = 'Lincoln High School' 
AND district = 'Los Angeles Unified' 
AND active = true 
AND current_clubs_count < max_clubs 
ORDER BY name; 