# Debugging Presentation Usage Limits

## Issue Description
The presentation usage counter is not updating after generation. It stays at 1/5 even after generating multiple presentations.

## Debugging Steps

### 1. Check Browser Console
Open your browser's developer tools (F12) and check the Console tab when generating a presentation. Look for:

- "Updating presentation usage for clubId: ..."
- "Update usage response status: ..."
- "Presentation usage updated successfully: ..."
- Any error messages

### 2. Check Network Tab
In the Network tab of developer tools, look for:
- API calls to `/api/presentations/check-usage` (PUT method)
- Response status codes
- Response body content

### 3. Check Database
Run this SQL in Supabase to see current data:
```sql
-- Check current month and all data
SELECT 
    club_id, 
    user_id, 
    month_year, 
    usage_count, 
    created_at, 
    updated_at
FROM presentation_usage 
ORDER BY created_at DESC;

-- Check current month specifically
SELECT 
    club_id, 
    user_id, 
    month_year, 
    usage_count
FROM presentation_usage 
WHERE month_year = TO_CHAR(NOW(), 'YYYY-MM');
```

### 4. Test API Endpoint Directly
Test the usage update endpoint directly:

```bash
curl -X PUT http://localhost:3000/api/presentations/check-usage \
  -H "Content-Type: application/json" \
  -d '{"clubId": "your-club-id", "userId": "your-user-id"}'
```

### 5. Common Issues to Check

#### Month Mismatch
- The API might be using a different month format than expected
- Check if `getCurrentMonthYear()` returns the correct format (YYYY-MM)

#### Database Constraints
- The `upsert` operation might be failing due to constraint violations
- Check if the unique constraint on `(club_id, month_year)` is working

#### User ID Mismatch
- The `userId` being passed might not match what's expected
- Check if `clubData.owner_id || clubData.userId` is correct

#### API Response Handling
- The frontend might not be properly handling the API response
- Check if `updatePresentationUsage` is actually being called

## Expected Behavior

1. **Before Generation**: Usage shows current count (e.g., 1/5)
2. **During Generation**: API calls `updatePresentationUsage`
3. **After Generation**: Usage increments (e.g., 2/5)
4. **Frontend Refresh**: Calls `checkClubUsage` to update display

## Debug Commands

### Check Current Month
```javascript
// In browser console
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
console.log(`${year}-${month}`);
```

### Test Usage Check
```javascript
// In browser console
fetch('/api/presentations/check-usage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ clubId: 'your-club-id' })
}).then(r => r.json()).then(console.log);
```

## Next Steps
1. Run the SQL check to see current database state
2. Check browser console for any error messages
3. Verify the month format being used
4. Test the API endpoint directly
5. Report back with any error messages or unexpected behavior
