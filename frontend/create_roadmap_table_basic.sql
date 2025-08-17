-- Basic script to create roadmap_usage table
-- Run this in your Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS roadmap_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  month_year TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, month_year)
);

-- Create basic index
CREATE INDEX IF NOT EXISTS idx_roadmap_usage_club_month ON roadmap_usage(club_id, month_year);

-- Disable RLS
ALTER TABLE roadmap_usage DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.roadmap_usage TO authenticated;
GRANT ALL ON public.roadmap_usage TO service_role;

-- Verify table was created
SELECT 'Table created successfully!' as status;
SELECT COUNT(*) as total_records FROM roadmap_usage;
