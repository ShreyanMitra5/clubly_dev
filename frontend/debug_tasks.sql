-- Debug tasks table
-- Run this in your Supabase SQL Editor

-- Check what tasks currently exist
SELECT 'Current tasks in database:' as status;
SELECT 
  t.id,
  t.club_id,
  t.title,
  t.status,
  t.priority,
  t.created_at,
  c.name as club_name
FROM tasks t
LEFT JOIN clubs c ON t.club_id = c.id
ORDER BY t.created_at DESC;

-- Check what clubs exist
SELECT 'Current clubs in database:' as status;
SELECT id, name FROM clubs LIMIT 10;

-- Check for any tasks with the test_club ID
SELECT 'Tasks with test_club ID:' as status;
SELECT * FROM tasks WHERE club_id = 'test_club';

-- Check the structure of the tasks table
SELECT 'Tasks table structure:' as status;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tasks'
ORDER BY ordinal_position;