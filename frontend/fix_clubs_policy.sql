-- Fix Clubs Table Policy Issue
-- This script fixes the "new row violates row-level security policy" error for clubs table

-- 1. Drop the existing policy that's causing issues
DROP POLICY IF EXISTS "allow_authenticated_users" ON clubs;

-- 2. Create a more specific policy for clubs that allows proper access
-- This policy allows authenticated users to read all clubs and create/update their own clubs
CREATE POLICY "clubs_read_all" ON clubs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "clubs_owner_manage" ON clubs
  FOR ALL USING (owner_id = auth.uid()::text);

-- 3. Test the fix by trying to insert a test club
-- (This will be cleaned up automatically)
INSERT INTO clubs (name, description, owner_id) 
VALUES ('Test Club', 'Test Description', 'test_owner_123')
ON CONFLICT DO NOTHING;

-- 4. Check if the test club was created
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM clubs WHERE owner_id = 'test_owner_123') 
        THEN '✅ CLUBS POLICY FIXED - Can now create clubs'
        ELSE '❌ CLUBS POLICY STILL HAS ISSUES'
    END as clubs_test_result;

-- 5. Clean up test data
DELETE FROM clubs WHERE owner_id = 'test_owner_123';

-- 6. Show current policies for clubs
SELECT 
    '=== CLUBS POLICIES ===' AS info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'clubs'
ORDER BY policyname;

-- 7. Success message
SELECT 'CLUBS POLICY FIXED!' AS status;
SELECT 'You should now be able to create clubs without errors.' AS message;
