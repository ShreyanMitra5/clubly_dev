-- Create the missing ai_assistant_messages table
-- This assumes ai_assistant_chats already exists

-- Create ai_assistant_messages table
CREATE TABLE IF NOT EXISTS ai_assistant_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES ai_assistant_chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_assistant_messages_chat_id ON ai_assistant_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_messages_created_at ON ai_assistant_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_assistant_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON ai_assistant_messages;

-- Create permissive RLS policy (allow all operations for now)
CREATE POLICY "Allow all operations for authenticated users" ON ai_assistant_messages
    FOR ALL USING (true) WITH CHECK (true);

-- Verify the table was created
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'ai_assistant_messages'
AND table_schema = 'public';

-- Test basic functionality
INSERT INTO ai_assistant_messages (chat_id, content, is_user) 
SELECT id, 'Test message', true 
FROM ai_assistant_chats 
WHERE user_id = 'test-user-123' 
LIMIT 1;

-- Verify the test record
SELECT * FROM ai_assistant_messages WHERE content = 'Test message';
