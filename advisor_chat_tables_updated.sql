-- Drop existing tables if they exist (optional, for fresh start)
-- DROP TABLE IF EXISTS advisor_messages;
-- DROP TABLE IF EXISTS advisor_chats;

-- Create advisor_chats table with TEXT for all IDs
CREATE TABLE IF NOT EXISTS advisor_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advisor_messages table
CREATE TABLE IF NOT EXISTS advisor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES advisor_chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_advisor_chats_user_club ON advisor_chats(user_id, club_id);
CREATE INDEX IF NOT EXISTS idx_advisor_chats_updated_at ON advisor_chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_advisor_messages_chat_id ON advisor_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_advisor_messages_created_at ON advisor_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE advisor_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own chats" ON advisor_chats;
DROP POLICY IF EXISTS "Users can insert their own chats" ON advisor_chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON advisor_chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON advisor_chats;
DROP POLICY IF EXISTS "Users can view messages from their chats" ON advisor_messages;
DROP POLICY IF EXISTS "Users can insert messages to their chats" ON advisor_messages;
DROP POLICY IF EXISTS "Users can update messages from their chats" ON advisor_messages;
DROP POLICY IF EXISTS "Users can delete messages from their chats" ON advisor_messages;

-- Create RLS policies for advisor_chats
CREATE POLICY "Users can view their own chats" ON advisor_chats
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own chats" ON advisor_chats
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own chats" ON advisor_chats
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own chats" ON advisor_chats
    FOR DELETE USING (user_id = auth.uid()::text);

-- Create RLS policies for advisor_messages
CREATE POLICY "Users can view messages from their chats" ON advisor_messages
    FOR SELECT USING (
        chat_id IN (
            SELECT id FROM advisor_chats WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert messages to their chats" ON advisor_messages
    FOR INSERT WITH CHECK (
        chat_id IN (
            SELECT id FROM advisor_chats WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update messages from their chats" ON advisor_messages
    FOR UPDATE USING (
        chat_id IN (
            SELECT id FROM advisor_chats WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete messages from their chats" ON advisor_messages
    FOR DELETE USING (
        chat_id IN (
            SELECT id FROM advisor_chats WHERE user_id = auth.uid()::text
        )
    );

-- Test the table (optional)
-- INSERT INTO advisor_chats (user_id, club_id, title) VALUES ('test-user', 'test-club', 'Test Chat'); 