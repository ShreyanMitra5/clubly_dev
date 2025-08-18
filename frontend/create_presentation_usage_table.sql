-- Create presentation_usage table for tracking presentation generation limits
CREATE TABLE IF NOT EXISTS presentation_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month_year TEXT NOT NULL, -- Format: "YYYY-MM" (e.g., "2024-08")
  presentation_topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_presentation_usage_club_id ON presentation_usage(club_id);
CREATE INDEX IF NOT EXISTS idx_presentation_usage_user_id ON presentation_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_usage_month_year ON presentation_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_presentation_usage_club_month ON presentation_usage(club_id, month_year);

-- Disable RLS to match other tables
ALTER TABLE presentation_usage DISABLE ROW LEVEL SECURITY;

-- Add helpful comment
COMMENT ON TABLE presentation_usage IS 'Tracks presentation generation usage per club per month (limit: 5 per month)';
COMMENT ON COLUMN presentation_usage.month_year IS 'Month in YYYY-MM format for efficient monthly usage tracking';
COMMENT ON COLUMN presentation_usage.presentation_topic IS 'Topic of the generated presentation for tracking purposes';
