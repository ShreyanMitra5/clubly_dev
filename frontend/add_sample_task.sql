-- Add a sample task for testing
-- Run this in your Supabase SQL Editor

-- First, let's check if we have any clubs to reference
SELECT 'Checking for clubs...' as status;
SELECT id, name FROM clubs LIMIT 5;

-- Add a sample task (replace 'your_club_id_here' with an actual club ID from above)
INSERT INTO tasks (
  club_id,
  title,
  description,
  status,
  priority,
  due_date
) VALUES (
  'test_club_123', -- Replace with actual club ID
  'Sample Task',
  'This is a sample task for testing the task management system.',
  'todo',
  'medium',
  CURRENT_DATE + INTERVAL '7 days'
);

-- Verify the task was added
SELECT 'Sample task added successfully!' as status;
SELECT * FROM tasks WHERE title = 'Sample Task'; 