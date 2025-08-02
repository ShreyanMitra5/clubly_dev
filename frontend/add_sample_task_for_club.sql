-- Add sample task for actual clubs
-- Run this in your Supabase SQL Editor

-- First, let's see what clubs exist
SELECT 'Checking existing clubs...' as status;
SELECT id, name FROM clubs LIMIT 10;

-- Add sample tasks for existing clubs
INSERT INTO tasks (club_id, title, description, status, priority, due_date)
SELECT 
  c.id,
  'Plan Next Meeting',
  'Organize agenda and prepare materials for the upcoming club meeting.',
  'todo',
  'high',
  CURRENT_DATE + INTERVAL '3 days'
FROM clubs c
WHERE NOT EXISTS (
  SELECT 1 FROM tasks t WHERE t.club_id = c.id
)
LIMIT 5;

-- Add another sample task
INSERT INTO tasks (club_id, title, description, status, priority, due_date)
SELECT 
  c.id,
  'Review Member Applications',
  'Review and process new member applications for the club.',
  'in_progress',
  'medium',
  CURRENT_DATE + INTERVAL '7 days'
FROM clubs c
WHERE NOT EXISTS (
  SELECT 1 FROM tasks t WHERE t.club_id = c.id AND t.title = 'Review Member Applications'
)
LIMIT 5;

-- Verify the tasks were added
SELECT 'Sample tasks added successfully!' as status;
SELECT 
  t.id,
  t.club_id,
  c.name as club_name,
  t.title,
  t.status,
  t.priority,
  t.due_date
FROM tasks t
LEFT JOIN clubs c ON t.club_id = c.id
ORDER BY t.created_at DESC
LIMIT 10; 