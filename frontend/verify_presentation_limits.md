# Manual Verification of Presentation Limits System

Since the automated test needs real club IDs, here's how to manually verify the system works:

## 🧪 Quick Manual Test

### 1. **Start Your Development Server**
```bash
cd frontend
npm run dev
```

### 2. **Open the Generate Page**
Navigate to `http://localhost:3000/generate` in your browser

### 3. **Check Usage Display**
- You should see a usage information box above the form
- It should show "0/5 presentations used this month"
- The progress bar should be at 0%

### 4. **Generate a Presentation**
- Fill in the description field
- Click "Generate Presentation"
- Verify it works and usage updates to "1/5"

### 5. **Check Database**
Run this in your Supabase SQL Editor:
```sql
-- Check if the table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'presentation_usage';

-- Check current usage
SELECT * FROM presentation_usage ORDER BY created_at DESC;
```

## 🔍 Troubleshooting

### If you see "Club not found" errors:

1. **Check your club data structure**:
   ```bash
   ls frontend/data/clubs/
   ```

2. **Look at a club JSON file**:
   ```bash
   cat frontend/data/clubs/user_*/AI_Club_*.json | head -20
   ```

3. **Verify the club ID format** in your database:
   ```sql
   SELECT id, name FROM clubs LIMIT 5;
   ```

### If the usage table doesn't exist:

1. **Run the SQL script** in Supabase:
   ```sql
   -- Copy and paste the contents of create_presentation_limits_table.sql
   ```

2. **Verify the table was created**:
   ```sql
   SELECT * FROM presentation_usage;
   ```

## 📊 Expected Behavior

### Normal Operation:
- ✅ Usage display shows current count
- ✅ Progress bar fills as you generate presentations
- ✅ Button is enabled when under limit
- ✅ Button is disabled when limit reached

### Limit Enforcement:
- ✅ After 5 presentations, button shows "Monthly Limit Reached"
- ✅ Button is disabled and grayed out
- ✅ Error message explains the limit

### Monthly Reset:
- ✅ Usage resets each month (e.g., 2025-08 vs 2025-09)
- ✅ Each month starts with 0 usage

## 🚀 Next Steps

Once you've verified the basic functionality:

1. **Test with real data** - Generate actual presentations
2. **Check error handling** - Try generating when limit is reached
3. **Verify monthly reset** - Test across month boundaries
4. **Monitor database** - Check usage tracking accuracy

## 📝 Notes

- The system is **fail-safe** - if usage tracking fails, generation still works
- Usage is tracked **per club per month**
- Each club has its own independent limit
- The limit automatically resets each month
