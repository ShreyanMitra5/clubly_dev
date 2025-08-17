-- Test script for roadmap_usage table
-- Run this in your Supabase SQL Editor

-- 1. Check if table exists
SELECT 'Step 1: Checking if table exists...' as status;
SELECT table_name FROM information_schema.tables WHERE table_name = 'roadmap_usage';

-- 2. Check table structure
SELECT 'Step 2: Checking table structure...' as status;
SELECT column_name, data_type, is_nullable FROM information_schema.columns 
WHERE table_name = 'roadmap_usage' ORDER BY ordinal_position;

-- 3. Check constraints
SELECT 'Step 3: Checking constraints...' as status;
SELECT constraint_name, constraint_type FROM information_schema.table_constraints 
WHERE table_name = 'roadmap_usage';

-- 4. Check current data
SELECT 'Step 4: Checking current data...' as status;
SELECT COUNT(*) as total_records FROM roadmap_usage;

-- 5. Test insert
SELECT 'Step 5: Testing insert...' as status;
INSERT INTO roadmap_usage (club_id, user_id, month_year, usage_count)
VALUES ('test-club-456', 'test-user-789', '2025-09', 1);

-- 6. Verify insert
SELECT 'Step 6: Verifying insert...' as status;
SELECT * FROM roadmap_usage WHERE club_id = 'test-club-456';

-- 7. Test update
SELECT 'Step 7: Testing update...' as status;
UPDATE roadmap_usage 
SET usage_count = usage_count + 1, updated_at = NOW()
WHERE club_id = 'test-club-456' AND month_year = '2025-09';

-- 8. Verify update
SELECT 'Step 8: Verifying update...' as status;
SELECT * FROM roadmap_usage WHERE club_id = 'test-club-456';

-- 9. Clean up test data
SELECT 'Step 9: Cleaning up test data...' as status;
DELETE FROM roadmap_usage WHERE club_id = 'test-club-456';

-- 10. Final check
SELECT 'Step 10: Final check...' as status;
SELECT COUNT(*) as total_records FROM roadmap_usage;

SELECT 'Test completed!' as status;
