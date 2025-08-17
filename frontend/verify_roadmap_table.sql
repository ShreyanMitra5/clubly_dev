-- Verify and create roadmap_usage table if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Check if table exists
SELECT 'Checking if roadmap_usage table exists...' as status;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'roadmap_usage';

-- If table doesn't exist, create it
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'roadmap_usage'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Creating roadmap_usage table...';
        
        CREATE TABLE roadmap_usage (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          club_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          month_year TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g., '2025-08')
          usage_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(club_id, month_year)
        );

        -- Create indexes for better performance
        CREATE INDEX idx_roadmap_usage_club_id ON roadmap_usage(club_id);
        CREATE INDEX idx_roadmap_usage_user_id ON roadmap_usage(user_id);
        CREATE INDEX idx_roadmap_usage_month_year ON roadmap_usage(month_year);
        CREATE INDEX idx_roadmap_usage_club_month ON roadmap_usage(club_id, month_year);

        -- Disable RLS for now (can be enabled later for security)
        ALTER TABLE roadmap_usage DISABLE ROW LEVEL SECURITY;

        -- Add trigger for updated_at timestamp
        CREATE OR REPLACE FUNCTION update_roadmap_usage_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Drop trigger if it exists, then create it
        DROP TRIGGER IF EXISTS update_roadmap_usage_updated_at ON roadmap_usage;
        CREATE TRIGGER update_roadmap_usage_updated_at 
          BEFORE UPDATE ON roadmap_usage 
          FOR EACH ROW 
          EXECUTE FUNCTION update_roadmap_usage_updated_at();

        -- Grant necessary permissions
        GRANT ALL ON public.roadmap_usage TO authenticated;
        GRANT ALL ON public.roadmap_usage TO service_role;

        RAISE NOTICE 'roadmap_usage table created successfully!';
    ELSE
        RAISE NOTICE 'roadmap_usage table already exists!';
    END IF;
END $$;

-- Verify table structure
SELECT 'Verifying table structure...' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'roadmap_usage'
ORDER BY ordinal_position;

-- Check if table has any data
SELECT 'Checking table data...' as status;

SELECT COUNT(*) as total_records FROM roadmap_usage;

-- Test insert (optional - remove this if you don't want test data)
SELECT 'Testing insert...' as status;

INSERT INTO roadmap_usage (club_id, user_id, month_year, usage_count)
VALUES ('test-club-123', 'test-user-456', '2025-08', 1)
ON CONFLICT (club_id, month_year) 
DO UPDATE SET 
    usage_count = roadmap_usage.usage_count + 1,
    updated_at = NOW();

-- Verify the test data
SELECT 'Verifying test data...' as status;

SELECT * FROM roadmap_usage WHERE club_id = 'test-club-123';

-- Clean up test data (optional)
-- DELETE FROM roadmap_usage WHERE club_id = 'test-club-123';

SELECT 'Database setup verification complete!' as status;
