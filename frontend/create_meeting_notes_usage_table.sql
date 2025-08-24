-- Create meeting_notes_usage table for tracking meeting notes generation limits
CREATE TABLE IF NOT EXISTS meeting_notes_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month_year TEXT NOT NULL, -- Format: "YYYY-MM" (e.g., "2024-08")
  meeting_duration_minutes INTEGER, -- Duration of the recorded meeting
  meeting_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_meeting_notes_usage_club_id ON meeting_notes_usage(club_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_usage_user_id ON meeting_notes_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_usage_month_year ON meeting_notes_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_usage_club_month ON meeting_notes_usage(club_id, month_year);

-- Disable RLS to match other tables
ALTER TABLE meeting_notes_usage DISABLE ROW LEVEL SECURITY;

-- Add helpful comments
COMMENT ON TABLE meeting_notes_usage IS 'Tracks meeting notes generation usage per club per month (unlimited per month, max 30 minutes per session)';
COMMENT ON COLUMN meeting_notes_usage.month_year IS 'Month in YYYY-MM format for efficient monthly usage tracking';
COMMENT ON COLUMN meeting_notes_usage.meeting_duration_minutes IS 'Duration of the recorded meeting in minutes';
COMMENT ON COLUMN meeting_notes_usage.meeting_title IS 'Title/topic of the meeting notes generated';
