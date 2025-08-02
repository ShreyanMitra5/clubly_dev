-- Update advisor_requests table to support 'closed' status
-- Run this in your Supabase SQL Editor

-- First, check current status values
SELECT 'Current status values:' as info;
SELECT DISTINCT status, COUNT(*) as count 
FROM advisor_requests 
GROUP BY status;

-- Drop the existing constraint if it exists
ALTER TABLE advisor_requests 
DROP CONSTRAINT IF EXISTS advisor_requests_status_check;

-- Add the new constraint with 'closed' status
ALTER TABLE advisor_requests 
ADD CONSTRAINT advisor_requests_status_check 
CHECK (status IN ('pending', 'approved', 'denied', 'closed'));

-- Verify the constraint was added
SELECT 'Constraint updated successfully!' as info;

-- Show updated structure
SELECT 'Updated status options: pending, approved, denied, closed' as info;