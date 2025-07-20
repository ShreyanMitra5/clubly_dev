-- Simple approach: Create tables without RLS for now
-- We'll add security later once basic functionality works

-- Drop existing tables if they exist
DROP TABLE IF EXISTS advisor_messages CASCADE;
DROP TABLE IF EXISTS advisor_chats CASCADE;

-- Create advisor_chats table (no RLS)
CREATE TABLE advisor_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advisor_messages table (no RLS)
CREATE TABLE advisor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES advisor_chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_user BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_advisor_chats_user_club ON advisor_chats(user_id, club_id);
CREATE INDEX idx_advisor_chats_updated_at ON advisor_chats(updated_at DESC);
CREATE INDEX idx_advisor_messages_chat_id ON advisor_messages(chat_id);
CREATE INDEX idx_advisor_messages_created_at ON advisor_messages(created_at);

-- Verify tables were created
SELECT table_name, row_security 
FROM information_schema.tables 
WHERE table_name IN ('advisor_chats', 'advisor_messages');

-- Test basic functionality
INSERT INTO advisor_chats (user_id, club_id, title) 
VALUES ('test-user-123', 'test-club-456', 'Test Chat Success');

-- Verify the test record
SELECT * FROM advisor_chats WHERE user_id = 'test-user-123'; 