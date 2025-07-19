-- Create roadmaps table for storing club roadmap data
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  config JSONB, -- Store form configuration (club topic, meeting days, etc.)
  events JSONB, -- Store array of events
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster club lookups
CREATE INDEX IF NOT EXISTS idx_roadmaps_club_id ON roadmaps(club_id);

-- Enable Row Level Security
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access roadmaps for clubs they're members of
CREATE POLICY "Users can access roadmaps for their clubs" ON roadmaps
  FOR ALL USING (
    club_id IN (
      SELECT club_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Create policy to allow club owners to manage roadmaps
CREATE POLICY "Club owners can manage roadmaps" ON roadmaps
  FOR ALL USING (
    club_id IN (
      SELECT id FROM clubs WHERE owner_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roadmaps_updated_at 
  BEFORE UPDATE ON roadmaps 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 