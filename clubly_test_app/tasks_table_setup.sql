-- Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    club_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint (assuming you have a clubs table)
-- ALTER TABLE public.tasks 
-- ADD CONSTRAINT fk_tasks_club_id 
-- FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_club_id ON public.tasks(club_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only see tasks for clubs they are members of
CREATE POLICY "Users can view tasks for their clubs" ON public.tasks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE memberships.club_id = tasks.club_id
            AND memberships.user_id = auth.uid()
        )
    );

-- Policy: Users can insert tasks for clubs they are members of
CREATE POLICY "Users can create tasks for their clubs" ON public.tasks
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE memberships.club_id = tasks.club_id
            AND memberships.user_id = auth.uid()
        )
    );

-- Policy: Users can update tasks for clubs they are members of
CREATE POLICY "Users can update tasks for their clubs" ON public.tasks
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE memberships.club_id = tasks.club_id
            AND memberships.user_id = auth.uid()
        )
    );

-- Policy: Users can delete tasks for clubs they are members of
CREATE POLICY "Users can delete tasks for their clubs" ON public.tasks
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.memberships
            WHERE memberships.club_id = tasks.club_id
            AND memberships.user_id = auth.uid()
        )
    );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role; 