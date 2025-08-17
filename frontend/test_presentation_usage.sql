-- Test script for presentation_usage table
-- Run this in your Supabase SQL Editor

-- 1. Check if table exists
SELECT 'Step 1: Checking if table exists...' as status;
SELECT table_name FROM information_schema.tables WHERE table_name = 'presentation_usage';

-- 2. Check table structure
SELECT 'Step 2: Checking table structure...' as status;
SELECT column_name, data_type, is_nullable FROM information_schema.columns 
WHERE table_name = 'presentation_usage' ORDER BY ordinal_position;

-- 3. Check constraints
SELECT 'Step 3: Checking constraints...' as status;
SELECT constraint_name, constraint_type FROM information_schema.table_constraints 
WHERE table_name = 'presentation_usage';

-- 4. Check current data
SELECT 'Step 4: Checking current data...' as status;
SELECT COUNT(*) as total_records FROM presentation_usage;

-- 5. Check current month data
SELECT 'Step 5: Checking current month data...' as status;
SELECT 
    club_id, 
    user_id, 
    month_year, 
    usage_count, 
    created_at, 
    updated_at
FROM presentation_usage 
WHERE month_year = '2025-08'
ORDER BY created_at DESC;

-- 6. Test insert for current month
SELECT 'Step 6: Testing insert for current month...' as status;
INSERT INTO presentation_usage (club_id, user_id, month_year, usage_count)
VALUES ('test-club-presentation', 'test-user-presentation', '2025-08', 1)
ON CONFLICT (club_id, month_year) 
DO UPDATE SET 
    usage_count = presentation_usage.usage_count + 1,
    updated_at = NOW();

-- 7. Verify insert
SELECT 'Step 7: Verifying insert...' as status;
SELECT * FROM presentation_usage WHERE club_id = 'test-club-presentation';

-- 8. Test update
SELECT 'Step 8: Testing update...' as status;
UPDATE presentation_usage 
SET usage_count = usage_count + 1, updated_at = NOW()
WHERE club_id = 'test-club-presentation' AND month_year = '2025-08';

-- 9. Verify update
SELECT 'Step 9: Verifying update...' as status;
SELECT * FROM presentation_usage WHERE club_id = 'test-club-presentation';

-- 10. Clean up test data
SELECT 'Step 10: Cleaning up test data...' as status;
DELETE FROM presentation_usage WHERE club_id = 'test-club-presentation';

-- 11. Final check
SELECT 'Step 11: Final check...' as status;
SELECT COUNT(*) as total_records FROM presentation_usage;

SELECT 'Test completed!' as status;
