-- Create the tasks table with TEXT club_id to match current app behavior
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    club_id TEXT NOT NULL,  -- Changed from UUID to TEXT to match current app usage
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Note: No foreign key constraint since club_id is club name (TEXT), not UUID
-- This matches the current app behavior where club names are used as identifiers

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_club_id ON public.tasks(club_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);

-- Disable RLS to match existing schema pattern (clubs, memberships, roadmaps all have RLS disabled)
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;

-- Test insert to verify it works
INSERT INTO public.tasks (club_id, title, description) 
VALUES ('Test Club', 'Test Task', 'This is a test task to verify the table works');

-- Verify the test record
SELECT * FROM public.tasks WHERE club_id = 'Test Club';

-- Clean up test record
DELETE FROM public.tasks WHERE club_id = 'Test Club' AND title = 'Test Task'; 