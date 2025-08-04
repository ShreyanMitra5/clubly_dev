-- Simple Email System Fix
-- This creates the club_emails table without complex RLS policies

-- 1. Create club_emails table
CREATE TABLE IF NOT EXISTS club_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_club_emails_club_id ON club_emails(club_id);
CREATE INDEX IF NOT EXISTS idx_club_emails_email ON club_emails(email);

-- 3. Add unique constraint to prevent duplicate emails per club
ALTER TABLE club_emails 
ADD CONSTRAINT unique_club_email UNIQUE (club_id, email);

-- 4. Disable RLS for simplicity (since we're using file-based storage anyway)
ALTER TABLE club_emails DISABLE ROW LEVEL SECURITY;

-- 5. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_club_emails_updated_at 
    BEFORE UPDATE ON club_emails 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Verify the table was created
SELECT 'club_emails table created successfully' AS status;

-- 7. Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'club_emails'
ORDER BY ordinal_position; 