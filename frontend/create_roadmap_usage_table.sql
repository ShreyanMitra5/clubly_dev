-- Create roadmap_usage table for tracking roadmap generation limits
CREATE TABLE IF NOT EXISTS roadmap_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month_year TEXT NOT NULL, -- Format: "YYYY-MM" (e.g., "2024-01")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_roadmap_usage_club_id ON roadmap_usage(club_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_usage_user_id ON roadmap_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_usage_month_year ON roadmap_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_roadmap_usage_club_month ON roadmap_usage(club_id, month_year);

-- Disable RLS for now (matching the pattern of other tables)
ALTER TABLE roadmap_usage DISABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own usage data
CREATE POLICY "Users can access roadmap usage for their clubs" ON roadmap_usage
  FOR ALL USING (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.jwt() ->> 'sub'
    )
    OR
    club_id IN (
      SELECT id FROM clubs WHERE owner_id = auth.jwt() ->> 'sub'
    )
  );

-- Add helpful comment
COMMENT ON TABLE roadmap_usage IS 'Tracks roadmap generation usage per club per month (limit: 2 per month)';
COMMENT ON COLUMN roadmap_usage.month_year IS 'Month in YYYY-MM format for efficient monthly usage tracking';
