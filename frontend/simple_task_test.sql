-- Simple task test
-- Run this in your Supabase SQL Editor

-- First, let's see what tasks exist
SELECT 'All tasks:' as info;
SELECT * FROM tasks ORDER BY created_at DESC LIMIT 5;

-- Let's try to manually update a task to see if it works
UPDATE tasks 
SET 
  title = 'Updated Test Task',
  description = 'This task was updated manually',
  updated_at = NOW()
WHERE id = (SELECT id FROM tasks LIMIT 1);

-- Check if the update worked
SELECT 'After manual update:' as info;
SELECT * FROM tasks WHERE title = 'Updated Test Task';

-- Let's also check what club IDs we have
SELECT 'Available club IDs:' as info;
SELECT DISTINCT club_id FROM tasks;
SELECT id, name FROM clubs LIMIT 5;