-- Quick fix for tasks table
-- Run this in your Supabase SQL Editor

-- Drop the table if it exists (to avoid conflicts)
DROP TABLE IF EXISTS tasks;

-- Create tasks table with proper structure
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tasks_club_id ON tasks(club_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Disable RLS
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add a sample task for testing
INSERT INTO tasks (club_id, title, description, status, priority, due_date) VALUES 
('test_club', 'Sample Task', 'This is a test task', 'todo', 'medium', CURRENT_DATE + INTERVAL '7 days');

-- Verify it works
SELECT 'Tasks table created successfully!' as status;
SELECT * FROM tasks; 