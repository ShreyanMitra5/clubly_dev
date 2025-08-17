-- Simple script to create roadmap_usage table
-- Run this in your Supabase SQL Editor

-- Check if table exists
SELECT 'Checking if roadmap_usage table exists...' as status;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'roadmap_usage';

-- Create the table (this will fail if it already exists, which is fine)
CREATE TABLE IF NOT EXISTS roadmap_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g., '2025-08')
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, month_year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roadmap_usage_club_id ON roadmap_usage(club_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_usage_user_id ON roadmap_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_usage_month_year ON roadmap_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_roadmap_usage_club_month ON roadmap_usage(club_id, month_year);

-- Disable RLS for now (can be enabled later for security)
ALTER TABLE roadmap_usage DISABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_roadmap_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_roadmap_usage_updated_at ON roadmap_usage;
CREATE TRIGGER update_roadmap_usage_updated_at 
  BEFORE UPDATE ON roadmap_usage 
  FOR EACH ROW 
  EXECUTE FUNCTION update_roadmap_usage_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.roadmap_usage TO authenticated;
GRANT ALL ON public.roadmap_usage TO service_role;

-- Verify the table was created
SELECT 'Roadmap usage table created successfully!' as status;

-- Check table structure
SELECT 'Verifying table structure...' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'roadmap_usage'
ORDER BY ordinal_position;

-- Check if table has any data
SELECT 'Checking table data...' as status;

SELECT COUNT(*) as total_records FROM roadmap_usage;

-- Test insert (optional - remove this if you don't want test data)
SELECT 'Testing insert...' as status;

INSERT INTO roadmap_usage (club_id, user_id, month_year, usage_count)
VALUES ('test-club-123', 'test-user-456', '2025-08', 1)
ON CONFLICT (club_id, month_year) 
DO UPDATE SET 
    usage_count = roadmap_usage.usage_count + 1,
    updated_at = NOW();

-- Verify the test data
SELECT 'Verifying test data...' as status;

SELECT * FROM roadmap_usage WHERE club_id = 'test-club-123';

-- Clean up test data (optional)
-- DELETE FROM roadmap_usage WHERE club_id = 'test-club-123';

SELECT 'Database setup verification complete!' as status;
