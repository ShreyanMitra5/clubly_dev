-- Create roadmap limits table to track usage per club per month
-- Run this in your Supabase SQL Editor

-- Create roadmap_usage table to track monthly limits
CREATE TABLE IF NOT EXISTS roadmap_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g., '2024-01')
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
