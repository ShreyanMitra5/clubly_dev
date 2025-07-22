-- Create clubs table
CREATE TABLE IF NOT EXISTS clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  mission TEXT,
  goals TEXT,
  audience TEXT,
  owner_id TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memberships table for club membership
CREATE TABLE IF NOT EXISTS memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, club_id)
);

-- Create roadmaps table for storing club roadmap data
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  config JSONB, -- Store form configuration (club topic, meeting days, etc.)
  events JSONB, -- Store array of events
  data JSONB, -- Store full roadmap data structure
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_clubs_owner_id ON clubs(owner_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_club_id ON memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_club_id ON roadmaps(club_id);

-- Disable RLS for clubs & memberships (for now to avoid errors with external auth)
ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps DISABLE ROW LEVEL SECURITY;

-- Remove problematic memberships policies
DROP POLICY IF EXISTS "Users can view relevant memberships" ON memberships;
DROP POLICY IF EXISTS "Users can create their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON memberships;

-- NOTE: Roadmaps table still has RLS enabled with the appropriate policies

-- RLS Policies for clubs table
-- Users can view clubs they're members of
CREATE POLICY "Users can view clubs they're members of" ON clubs
  FOR SELECT USING (
    id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can create clubs (they automatically become the owner)
CREATE POLICY "Users can create clubs" ON clubs
  FOR INSERT WITH CHECK (
    owner_id = auth.jwt() ->> 'sub'
  );

-- Club owners can update their clubs
CREATE POLICY "Club owners can update their clubs" ON clubs
  FOR UPDATE USING (
    owner_id = auth.jwt() ->> 'sub'
  );

-- Club owners can delete their clubs
CREATE POLICY "Club owners can delete their clubs" ON clubs
  FOR DELETE USING (
    owner_id = auth.jwt() ->> 'sub'
  );

-- Create policy to allow users to access roadmaps for clubs they're members of
CREATE POLICY "Users can access roadmaps for their clubs" ON roadmaps
  FOR ALL USING (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create policy to allow club owners to manage roadmaps
CREATE POLICY "Club owners can manage roadmaps" ON roadmaps
  FOR ALL USING (
    club_id IN (
      SELECT id FROM clubs WHERE owner_id = auth.jwt() ->> 'sub'
    )
  );

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_clubs_updated_at ON clubs;
DROP TRIGGER IF EXISTS update_roadmaps_updated_at ON roadmaps;

-- Create triggers
CREATE TRIGGER update_clubs_updated_at 
  BEFORE UPDATE ON clubs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at 
  BEFORE UPDATE ON roadmaps 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 