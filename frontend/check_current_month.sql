-- Check current month and presentation usage data
-- Run this in your Supabase SQL Editor

-- 1. Check what month we're currently in
SELECT 'Current month check:' as status;
SELECT 
    EXTRACT(YEAR FROM NOW()) as current_year,
    EXTRACT(MONTH FROM NOW()) as current_month,
    TO_CHAR(NOW(), 'YYYY-MM') as current_month_year;

-- 2. Check all data in presentation_usage table
SELECT 'All presentation usage data:' as status;
SELECT 
    club_id, 
    user_id, 
    month_year, 
    usage_count, 
    created_at, 
    updated_at
FROM presentation_usage 
ORDER BY created_at DESC;

-- 3. Check current month data specifically
SELECT 'Current month data:' as status;
SELECT 
    club_id, 
    user_id, 
    month_year, 
    usage_count, 
    created_at, 
    updated_at
FROM presentation_usage 
WHERE month_year = TO_CHAR(NOW(), 'YYYY-MM')
ORDER BY created_at DESC;

-- 4. Check if there are any records for August 2025
SELECT 'August 2025 data:' as status;
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
