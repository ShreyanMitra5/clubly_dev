-- Fix inconsistent club IDs in tasks table
-- Run this in your Supabase SQL Editor

-- First, let's see what we have
SELECT 'Current task club_ids:' as info;
SELECT DISTINCT club_id, COUNT(*) as task_count FROM tasks GROUP BY club_id;

-- Check what clubs exist
SELECT 'Available clubs:' as info;
SELECT id, name FROM clubs LIMIT 10;

-- Update tasks that have club names instead of club IDs
-- Match "Science Olympiad Club" tasks to the actual club UUID
UPDATE tasks 
SET club_id = c.id
FROM clubs c
WHERE tasks.club_id = c.name;

-- Verify the fix
SELECT 'After fixing club IDs:' as info;
SELECT DISTINCT t.club_id, c.name as club_name, COUNT(*) as task_count 
FROM tasks t
LEFT JOIN clubs c ON t.club_id = c.id
GROUP BY t.club_id, c.name
ORDER BY task_count DESC;

-- Show all tasks with their club names
SELECT 'All tasks with club names:' as info;
SELECT 
  t.id,
  t.club_id,
  c.name as club_name,
  t.title,
  t.status
FROM tasks t
LEFT JOIN clubs c ON t.club_id = c.id
ORDER BY t.created_at DESC;