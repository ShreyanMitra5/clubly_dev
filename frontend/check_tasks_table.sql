-- Check if tasks table exists and its structure
-- Run this in your Supabase SQL Editor

-- Check if tasks table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'tasks'
    ) THEN 'Tasks table EXISTS'
    ELSE 'Tasks table DOES NOT EXIST'
  END as table_status;

-- If table exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tasks'
ORDER BY ordinal_position;

-- Check if there are any tasks in the table
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM tasks LIMIT 1) THEN 'Tasks table has data'
    ELSE 'Tasks table is empty'
  END as data_status;

-- Show sample data if any exists
SELECT * FROM tasks LIMIT 5; 