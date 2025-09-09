-- Create AI assistant tables with RLS enabled
-- Drop existing tables if they exist
DROP TABLE IF EXISTS ai_assistant_messages CASCADE;
DROP TABLE IF EXISTS ai_assistant_chats CASCADE;

-- Create ai_assistant_chats table
CREATE TABLE ai_assistant_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_assistant_messages table
CREATE TABLE ai_assistant_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES ai_assistant_chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ai_assistant_chats_user_club ON ai_assistant_chats(user_id, club_id);
CREATE INDEX idx_ai_assistant_chats_updated_at ON ai_assistant_chats(updated_at DESC);
CREATE INDEX idx_ai_assistant_messages_chat_id ON ai_assistant_messages(chat_id);
CREATE INDEX idx_ai_assistant_messages_created_at ON ai_assistant_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_assistant_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON ai_assistant_chats;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON ai_assistant_messages;

-- Create permissive RLS policies (allow all operations for now)
-- This allows any authenticated user to perform any operation
CREATE POLICY "Allow all operations for authenticated users" ON ai_assistant_chats
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON ai_assistant_messages
    FOR ALL USING (true) WITH CHECK (true);

-- Verify tables were created
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name IN ('ai_assistant_chats', 'ai_assistant_messages')
AND table_schema = 'public';

-- Test basic functionality
INSERT INTO ai_assistant_chats (user_id, club_id, title) 
VALUES ('test-user-123', 'test-club-456', 'Test Chat Success');

-- Verify the test record
SELECT * FROM ai_assistant_chats WHERE user_id = 'test-user-123'; 