-- Create messages table for advisor-student communication
-- Run this in your Supabase SQL Editor

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create composite index for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- Disable RLS for now (can be enabled later for security)
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Verify the table was created
SELECT 'Messages table created successfully!' as status; 