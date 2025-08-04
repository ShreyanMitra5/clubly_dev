-- Fix Email System - Create Missing Tables
-- This script creates the missing club_emails table and related structures

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

-- 4. Enable Row Level Security (RLS)
ALTER TABLE club_emails ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Users can view emails for clubs they own or are members of
CREATE POLICY "Users can view club emails for their clubs" ON club_emails
    FOR SELECT USING (
        club_id IN (
            SELECT c.id FROM clubs c
            LEFT JOIN memberships m ON c.id = m.club_id
            WHERE c.owner_id = auth.jwt() ->> 'sub' OR m.user_id = auth.jwt() ->> 'sub'
        )
    );

-- Users can insert emails for clubs they own
CREATE POLICY "Users can insert emails for their clubs" ON club_emails
    FOR INSERT WITH CHECK (
        club_id IN (
            SELECT id FROM clubs WHERE owner_id = auth.jwt() ->> 'sub'
        )
    );

-- Users can update emails for clubs they own
CREATE POLICY "Users can update emails for their clubs" ON club_emails
    FOR UPDATE USING (
        club_id IN (
            SELECT id FROM clubs WHERE owner_id = auth.jwt() ->> 'sub'
        )
    );

-- Users can delete emails for clubs they own
CREATE POLICY "Users can delete emails for their clubs" ON club_emails
    FOR DELETE USING (
        club_id IN (
            SELECT id FROM clubs WHERE owner_id = auth.jwt() ->> 'sub'
        )
    );

-- 6. Create trigger to update updated_at timestamp
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

-- 7. Insert some sample data (optional - for testing)
-- INSERT INTO club_emails (club_id, email, name) VALUES 
-- ('your-club-id-here', 'test@example.com', 'Test User');

-- 8. Verify the table was created
SELECT 'club_emails table created successfully' AS status;

-- 9. Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'club_emails'
ORDER BY ordinal_position; 