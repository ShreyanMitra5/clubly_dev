# Debugging Presentation Limits System

## 🚨 Current Issues
1. **Database table may not exist** - `presentation_usage` table needs to be created
2. **API endpoint errors** - `supabase.sql` function doesn't exist
3. **Frontend not showing usage** - Counter not incrementing

## 🔧 Step-by-Step Fix

### 1. **Create the Database Table**
Run this in your Supabase SQL Editor:
```sql
-- Copy and paste the contents of test_database_setup.sql
-- This will create the table if it doesn't exist
```

### 2. **Verify Table Exists**
Run this query:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'presentation_usage';
```

### 3. **Test the API Endpoint**
Open your browser console and run:
```javascript
// Test the usage check endpoint
fetch('/api/presentations/check-usage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ clubId: 'your-club-id-here' })
})
.then(res => res.json())
.then(data => console.log('Usage data:', data))
.catch(err => console.error('Error:', err));
```

### 4. **Check Browser Console**
Look for these debug messages:
- `PresentationUsageManager: Checking usage for clubId: ...`
- `PresentationUsageManager: API URL: ...`
- `PresentationUsageManager: Response status: ...`
- `PresentationUsageManager: Response data: ...`

### 5. **Check Server Logs**
Look for these debug messages in your terminal:
- `Checking usage for clubId: ...`
- `Current month/year: ...`
- `Querying presentation_usage table...`
- `Usage data: ...`

## 🐛 Common Issues & Solutions

### Issue: "Table doesn't exist"
**Solution**: Run the SQL script in Supabase

### Issue: "supabase.sql is not a function"
**Solution**: ✅ Fixed - Changed to proper increment logic

### Issue: "Club not found"
**Solution**: Check if the clubId being sent matches your database

### Issue: "No usage data showing"
**Solution**: Check browser console and server logs for errors

## 🧪 Testing Steps

1. **Generate a presentation** - Should work normally
2. **Check browser console** - Look for usage check logs
3. **Check server logs** - Look for API endpoint logs
4. **Verify database** - Check if usage record was created

## 📊 Expected Behavior

### After generating a presentation:
1. Usage should increment from 0/5 to 1/5
2. Progress bar should fill by 20%
3. Status should show "4 presentations remaining"
4. Button should remain enabled

### After 5 presentations:
1. Usage should show 5/5
2. Progress bar should be full (red)
3. Status should show "Monthly limit reached"
4. Button should be disabled

## 🔍 Debug Commands

### Check current usage in database:
```sql
SELECT * FROM presentation_usage ORDER BY created_at DESC;
```

### Check specific club usage:
```sql
SELECT * FROM presentation_usage WHERE club_id = 'your-club-id';
```

### Reset usage for testing:
```sql
UPDATE presentation_usage SET usage_count = 0 WHERE club_id = 'your-club-id';
```

## 📞 Next Steps

1. **Run the database setup script**
2. **Generate a presentation** to test
3. **Check all console logs** for errors
4. **Verify database records** are being created
5. **Test the usage display** in the UI

Let me know what you see in the logs and I'll help debug further!
