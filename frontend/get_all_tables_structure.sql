-- Comprehensive Database Structure Report
-- This script shows all tables, columns, and their properties in the Supabase database

-- 1. List all tables in the database
SELECT '=== ALL TABLES IN DATABASE ===' AS section;
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Get detailed column information for each table
SELECT '=== DETAILED TABLE STRUCTURES ===' AS section;

-- Function to get table structure
CREATE OR REPLACE FUNCTION get_table_structure()
RETURNS TABLE (
    table_name TEXT,
    column_name TEXT,
    data_type TEXT,
    is_nullable TEXT,
    column_default TEXT,
    character_maximum_length INTEGER,
    ordinal_position INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        c.column_name::TEXT,
        c.data_type::TEXT,
        c.is_nullable::TEXT,
        c.column_default::TEXT,
        c.character_maximum_length,
        c.ordinal_position
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND c.table_schema = 'public'
    ORDER BY t.table_name, c.ordinal_position;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to get all table structures
SELECT * FROM get_table_structure();

-- 3. Get primary keys for each table
SELECT '=== PRIMARY KEYS ===' AS section;
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- 4. Get foreign keys
SELECT '=== FOREIGN KEYS ===' AS section;
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 5. Get indexes
SELECT '=== INDEXES ===' AS section;
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6. Get triggers
SELECT '=== TRIGGERS ===' AS section;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 7. Get row counts for each table
SELECT '=== ROW COUNTS ===' AS section;
DO $$
DECLARE
    table_record RECORD;
    row_count BIGINT;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_record.tablename) INTO row_count;
        RAISE NOTICE 'Table: %, Rows: %', table_record.tablename, row_count;
    END LOOP;
END $$;

-- Clean up
DROP FUNCTION IF EXISTS get_table_structure(); 