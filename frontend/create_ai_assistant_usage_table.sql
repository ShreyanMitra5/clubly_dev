-- Create ai_assistant_usage table for tracking AI Assistant message limits
CREATE TABLE IF NOT EXISTS ai_assistant_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  message_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month_year TEXT NOT NULL, -- Format: "YYYY-MM" (e.g., "2024-08")
  message_content TEXT, -- Optional: store message content for tracking purposes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_ai_assistant_usage_club_id ON ai_assistant_usage(club_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_usage_user_id ON ai_assistant_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_usage_month_year ON ai_assistant_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_usage_club_month ON ai_assistant_usage(club_id, month_year);

-- Disable RLS to match other tables
ALTER TABLE ai_assistant_usage DISABLE ROW LEVEL SECURITY;

-- Add helpful comments
COMMENT ON TABLE ai_assistant_usage IS 'Tracks AI Assistant message usage per club per month (limit: 60 per month)';
COMMENT ON COLUMN ai_assistant_usage.month_year IS 'Month in YYYY-MM format for efficient monthly usage tracking';
COMMENT ON COLUMN ai_assistant_usage.message_content IS 'Optional: user message content for tracking purposes';
