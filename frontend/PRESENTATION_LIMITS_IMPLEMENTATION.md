# Presentation Generation Limits Implementation

This document explains how the 5 presentation per club per month limit system works and how to set it up.

## Overview

The system enforces a limit of 5 presentations per club per month. Once a club reaches this limit, users cannot generate any more presentations for that specific club until the next month.

## Database Setup

### 1. Create the presentation_usage table

Run the SQL script `create_presentation_limits_table.sql` in your Supabase SQL Editor:

```sql
-- This creates the table to track monthly usage per club
CREATE TABLE IF NOT EXISTS presentation_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g., '2024-01')
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, month_year)
);
```

### 2. Verify the table was created

Check that the table exists and has the correct structure:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'presentation_usage';

-- Check if table has data
SELECT COUNT(*) FROM presentation_usage;
```

## API Endpoints

### 1. Check Usage (`/api/presentations/check-usage`)

**POST** - Check current usage for a club
```json
{
  "clubId": "club-uuid-here"
}
```

**Response:**
```json
{
  "canGenerate": true,
  "currentUsage": 2,
  "remainingSlots": 3,
  "monthYear": "2024-01",
  "monthlyLimit": 5
}
```

**PUT** - Increment usage count after successful generation
```json
{
  "clubId": "club-uuid-here",
  "userId": "user-uuid-here"
}
```

## Frontend Integration

### 1. Usage Display

The system shows usage information above the presentation generation form:

- **Blue**: Normal usage (0-3 presentations used)
- **Orange**: Warning (4 presentations used, 1 remaining)
- **Red**: Limit reached (5 presentations used)

### 2. Button States

- **Enabled**: When usage is under the limit
- **Disabled**: When monthly limit is reached
- **Text changes**: Shows "Monthly Limit Reached" when disabled

### 3. Progress Bar

Visual indicator showing current usage as a percentage of the monthly limit.

## How It Works

### 1. Usage Check

Before generating a presentation:
1. System checks current month's usage for the selected club
2. If limit reached, generation is blocked
3. If under limit, generation proceeds

### 2. Usage Update

After successful generation:
1. Usage count is incremented for the current month
2. New record created if none exists for current month
3. Existing record updated if month already has usage

### 3. Monthly Reset

Usage automatically resets each month:
- January usage: `2024-01`
- February usage: `2024-02`
- Each month starts fresh with 0 usage

## Error Handling

### 1. API Failures

If the usage check API fails:
- Generation is allowed to proceed (fail-safe)
- Error is logged for debugging
- User experience is not blocked

### 2. Database Issues

If database operations fail:
- Error is logged
- Generation continues (fail-safe approach)
- Usage tracking may be incomplete

## Security Considerations

### 1. Row Level Security (RLS)

Currently disabled for simplicity. Can be enabled later with policies:

```sql
-- Example RLS policy
CREATE POLICY "Users can only view their own club usage" ON presentation_usage
  FOR SELECT USING (club_id IN (
    SELECT club_id FROM memberships WHERE user_id = auth.uid()
  ));
```

### 2. Rate Limiting

Consider adding rate limiting to prevent abuse:
- Per-user limits
- Per-IP limits
- Time-based throttling

## Monitoring and Analytics

### 1. Usage Tracking

Monitor usage patterns:
```sql
-- Monthly usage summary
SELECT 
  month_year,
  COUNT(*) as clubs_with_usage,
  SUM(usage_count) as total_presentations
FROM presentation_usage 
GROUP BY month_year 
ORDER BY month_year DESC;

-- Top clubs by usage
SELECT 
  club_id,
  month_year,
  usage_count
FROM presentation_usage 
WHERE month_year = '2024-01'
ORDER BY usage_count DESC;
```

### 2. Alerting

Set up alerts for:
- Clubs approaching limits
- Unusual usage patterns
- System failures

## Testing

### 1. Manual Testing

1. Generate presentations for a club
2. Verify usage count increases
3. Test limit enforcement
4. Verify monthly reset

### 2. Automated Testing

Create tests for:
- Usage limit enforcement
- Monthly reset functionality
- Error handling
- Edge cases

## Troubleshooting

### Common Issues

1. **Usage not updating**: Check database permissions and triggers
2. **Limit not enforced**: Verify API endpoint is working
3. **Monthly reset issues**: Check date formatting and timezone

### Debug Commands

```sql
-- Check current usage for a specific club
SELECT * FROM presentation_usage 
WHERE club_id = 'your-club-id' 
AND month_year = '2024-01';

-- Reset usage for testing
UPDATE presentation_usage 
SET usage_count = 0 
WHERE club_id = 'your-club-id' 
AND month_year = '2024-01';
```

## Future Enhancements

### 1. Flexible Limits

- Different limits for different club types
- Premium tiers with higher limits
- Admin override capabilities

### 2. Usage Analytics

- Detailed usage reports
- Trend analysis
- Predictive analytics

### 3. Notifications

- Email alerts when approaching limits
- In-app notifications
- Usage summaries

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify database table structure
3. Test API endpoints manually
4. Review this documentation
