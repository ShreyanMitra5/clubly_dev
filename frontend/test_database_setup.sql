-- Test and create presentation_usage table if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Check if table exists
SELECT 'Checking if presentation_usage table exists...' as status;

SELECT 
    table_name,
    table_type,
    row_security
FROM information_schema.tables 
WHERE table_name = 'presentation_usage';

-- If table doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'presentation_usage') THEN
        RAISE NOTICE 'Creating presentation_usage table...';
        
        CREATE TABLE presentation_usage (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          club_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          month_year TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g., '2024-01')
          usage_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(club_id, month_year)
        );

        -- Create indexes for better performance
        CREATE INDEX idx_presentation_usage_club_id ON presentation_usage(club_id);
        CREATE INDEX idx_presentation_usage_user_id ON presentation_usage(user_id);
        CREATE INDEX idx_presentation_usage_month_year ON presentation_usage(month_year);
        CREATE INDEX idx_presentation_usage_club_month ON presentation_usage(club_id, month_year);

        -- Disable RLS for now (can be enabled later for security)
        ALTER TABLE presentation_usage DISABLE ROW LEVEL SECURITY;

        -- Add trigger for updated_at timestamp
        CREATE OR REPLACE FUNCTION update_presentation_usage_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- Drop trigger if it exists, then create it
        DROP TRIGGER IF EXISTS update_presentation_usage_updated_at ON presentation_usage;
        CREATE TRIGGER update_presentation_usage_updated_at 
          BEFORE UPDATE ON presentation_usage 
          FOR EACH ROW 
          EXECUTE FUNCTION update_presentation_usage_updated_at();

        -- Grant necessary permissions
        GRANT ALL ON public.presentation_usage TO authenticated;
        GRANT ALL ON public.presentation_usage TO service_role;

        RAISE NOTICE 'presentation_usage table created successfully!';
    ELSE
        RAISE NOTICE 'presentation_usage table already exists!';
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
WHERE table_name = 'presentation_usage'
ORDER BY ordinal_position;

-- Check if table has any data
SELECT 'Checking table data...' as status;

SELECT COUNT(*) as total_records FROM presentation_usage;

-- Test insert (optional - remove this if you don't want test data)
SELECT 'Testing insert...' as status;

INSERT INTO presentation_usage (club_id, user_id, month_year, usage_count)
VALUES ('test-club-123', 'test-user-456', '2025-08', 1)
ON CONFLICT (club_id, month_year) 
DO UPDATE SET 
    usage_count = presentation_usage.usage_count + 1,
    updated_at = NOW();

-- Verify the test data
SELECT 'Verifying test data...' as status;

SELECT * FROM presentation_usage WHERE club_id = 'test-club-123';

-- Clean up test data (optional)
-- DELETE FROM presentation_usage WHERE club_id = 'test-club-123';

SELECT 'Database setup verification complete!' as status;
