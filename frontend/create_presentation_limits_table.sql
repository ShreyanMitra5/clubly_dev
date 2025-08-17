-- Create presentation limits table to track usage per club per month
-- Run this in your Supabase SQL Editor

-- Create presentation_usage table to track monthly limits
CREATE TABLE IF NOT EXISTS presentation_usage (
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
CREATE INDEX IF NOT EXISTS idx_presentation_usage_club_id ON presentation_usage(club_id);
CREATE INDEX IF NOT EXISTS idx_presentation_usage_user_id ON presentation_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_usage_month_year ON presentation_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_presentation_usage_club_month ON presentation_usage(club_id, month_year);

-- Disable RLS for now (can be enabled later for security)
ALTER TABLE presentation_usage DISABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_presentation_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_presentation_usage_updated_at ON presentation_usage;
CREATE TRIGGER update_presentation_usage_updated_at 
  BEFORE UPDATE ON presentation_usage 
  FOR EACH ROW 
  EXECUTE FUNCTION update_presentation_usage_updated_at();

-- Create function to increment usage count
CREATE OR REPLACE FUNCTION increment_presentation_usage()
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(NEW.usage_count, 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON public.presentation_usage TO authenticated;
GRANT ALL ON public.presentation_usage TO service_role;

-- Verify the table was created
SELECT 'Presentation usage table created successfully!' as status;
