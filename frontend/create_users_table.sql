-- Create users table for storing user information
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Disable RLS for users table (for now to avoid errors with external auth)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Add helpful comments
COMMENT ON TABLE users IS 'Stores basic user information from Clerk authentication';
COMMENT ON COLUMN users.id IS 'Clerk user ID (primary key)';
COMMENT ON COLUMN users.email IS 'User email address';
COMMENT ON COLUMN users.name IS 'User full name';
