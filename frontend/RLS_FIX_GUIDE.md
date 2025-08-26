# RLS Security Fix Guide

## Problem
Your Supabase database has Row Level Security (RLS) disabled on all public tables, which is causing security errors and preventing your app from working properly in production.

## Solution
I've created three SQL scripts to fix this issue:

### 1. `enable_rls_production.sql` (Recommended)
- **Use this for production** - comprehensive RLS setup with detailed policies
- Enables RLS on all tables
- Creates specific policies for each table based on user relationships
- Most secure and production-ready

### 2. `enable_rls_simple.sql` (Fallback)
- **Use this if the comprehensive version has issues**
- Simpler policies that allow authenticated users broader access
- Good for testing and if you need a quick fix

### 3. `verify_rls_setup.sql` (Verification)
- **Run this after applying either fix** to verify everything is working
- Shows RLS status for all tables
- Lists all policies
- Tests table access

## How to Apply the Fix

### Step 1: Choose Your Script
- For **production**: Use `enable_rls_production.sql`
- For **quick fix**: Use `enable_rls_simple.sql`

### Step 2: Run in Supabase
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the chosen script
4. Click "Run" to execute

### Step 3: Verify the Fix
1. Run `verify_rls_setup.sql` in the SQL Editor
2. Check that all tables show "✅ RLS Enabled"
3. Verify that policies are created

### Step 4: Test Your Application
1. Try logging in and using your app
2. Check that data loads properly
3. Verify that users can only see their own data

## What the Fix Does

### Enables RLS on These Tables:
- `advisor_chats`
- `club_emails`
- `clubs`
- `notifications`
- `teacher_availability`
- `teachers`
- `roadmaps`
- `users`
- `advisor_messages`
- `tasks`
- `messages`
- `advisor_requests`
- `memberships`
- `meeting_bookings`
- `roadmap_usage`
- `presentation_usage`
- `ai_assistant_usage`
- `meeting_notes_usage`

### Creates Security Policies:
- **Users**: Can only access their own data
- **Clubs**: Users can see clubs they're members of, owners can manage
- **Memberships**: Users can manage their own memberships
- **Tasks**: Users can manage tasks for their clubs
- **Teachers**: Teachers can manage their own data and availability
- **Messages**: Users can see messages they sent/received
- **Notifications**: Users can see their own notifications
- **Usage Tracking**: Users can see their own usage data

## Authentication Notes

Your app uses **Clerk** for authentication. The RLS policies are designed to work with:
- `auth.uid()` - Returns the Clerk user ID
- User IDs are stored as TEXT fields (Clerk format)
- Policies check `auth.uid()::text` for user identification

## Troubleshooting

### If the comprehensive script fails:
1. Try the simple script instead
2. Check for any syntax errors in the SQL
3. Ensure all tables exist before running

### If your app still doesn't work:
1. Check the browser console for errors
2. Verify that Clerk authentication is working
3. Make sure the Supabase client is properly configured
4. Check that `setSupabaseAuthToken()` is being called

### If you need to disable RLS temporarily:
- Use the existing `disable_all_rls.sql` script
- But remember to re-enable it for production security

## Production Checklist

- [ ] RLS enabled on all tables
- [ ] Policies created and working
- [ ] App functionality tested
- [ ] User data isolation verified
- [ ] No security errors in Supabase dashboard

## Support

If you encounter any issues:
1. Check the Supabase logs for errors
2. Verify your Clerk authentication setup
3. Test with the verification script
4. Consider using the simple RLS setup if needed

The fix should resolve your demo issues and make your app production-ready with proper security!
