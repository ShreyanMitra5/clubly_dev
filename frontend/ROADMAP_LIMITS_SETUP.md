# Roadmap Generation Limits System Setup

## 🎯 Overview

The roadmap feature now has a **2 roadmap generation limit per club per month**. Each club has its own independent limit, and users cannot generate more than 2 roadmaps per month for any specific club.

## 🗄️ Database Setup

### 1. **Create the roadmap_usage table**

Run this SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of create_roadmap_limits_table.sql
```

### 2. **Verify the table was created**

Check that the table exists and has the correct structure:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'roadmap_usage';

-- Check if table has data
SELECT COUNT(*) FROM roadmap_usage;
```

## 🔧 API Endpoints

### 1. **Check Usage** (`/api/roadmaps/check-usage`)

**POST** - Check current usage for a club
```json
{
  "clubId": "club-name-or-id"
}
```

**Response:**
```json
{
  "canGenerate": true,
  "currentUsage": 0,
  "remainingSlots": 2,
  "monthYear": "2025-08",
  "monthlyLimit": 2
}
```

**PUT** - Increment usage count after successful generation
```json
{
  "clubId": "club-name-or-id",
  "userId": "user-id"
}
```

## 🎨 Frontend Integration

### 1. **Usage Display**

The system shows usage information in two locations:

- **Above the roadmap generation form** - Shows current usage and progress
- **In the main roadmap view** - Shows usage status and remaining slots

### 2. **Visual Indicators**

- **Blue**: Normal usage (0-1 roadmaps)
- **Orange**: Warning (1 roadmap, 1 remaining)
- **Red**: Limit reached (2 roadmaps)

### 3. **Button States**

- **Enabled**: When usage is under the limit
- **Disabled**: When monthly limit is reached
- **Text changes**: Shows "Monthly Limit Reached" when disabled

## 🧪 Testing the System

### 1. **Start Your Development Server**
```bash
cd frontend
npm run dev
```

### 2. **Navigate to Roadmap Page**
Go to any club's roadmap page: `http://localhost:3000/clubs/[clubName]/semester-roadmap`

### 3. **Check Usage Display**
- You should see a blue usage tracker box
- It should show "0/2 roadmaps used this month"
- The progress bar should be at 0%

### 4. **Generate a Roadmap**
- Fill in the form and click "Generate Smart Roadmap"
- Verify it works and usage updates to "1/2"

### 5. **Test Limit Enforcement**
- Generate a second roadmap
- After 2 roadmaps, buttons should be disabled
- Status should show "Monthly limit reached"

## 🔍 Expected Behavior

### **Normal Operation:**
- ✅ Usage display shows current count
- ✅ Progress bar fills as you generate roadmaps
- ✅ Button is enabled when under limit
- ✅ Button is disabled when limit reached

### **Limit Enforcement:**
- ✅ After 2 roadmaps, button shows "Monthly Limit Reached"
- ✅ Button is disabled and grayed out
- ✅ Setup button also shows "Limit Reached"

### **Monthly Reset:**
- ✅ Usage resets each month (e.g., 2025-08 vs 2025-09)
- ✅ Each month starts with 0 usage

## 🚀 How It Works

### 1. **Usage Check**
Before generating a roadmap:
- System checks current month's usage for the selected club
- If limit reached, generation is blocked
- If under limit, generation proceeds

### 2. **Usage Update**
After successful generation:
- Usage count is incremented for the current month
- New record created if none exists for current month
- Existing record updated if month already has usage

### 3. **Monthly Reset**
Usage automatically resets each month:
- August usage: `2025-08`
- September usage: `2025-09`
- Each month starts fresh with 0 usage

## 📊 Database Verification

Run these queries in your Supabase SQL Editor:

```sql
-- Check if the table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'roadmap_usage';

-- Check current usage
SELECT * FROM roadmap_usage ORDER BY created_at DESC;

-- Check specific club usage
SELECT * FROM roadmap_usage WHERE club_id = 'your-club-name';
```

## 🐛 Troubleshooting

### **If you see "Table doesn't exist":**
1. Run the SQL script in Supabase
2. Verify the table was created

### **If usage is not updating:**
1. Check browser console for errors
2. Check server logs for API endpoint activity
3. Verify the clubId being sent matches your data

### **If buttons are not being disabled:**
1. Check if usageInfo state is being set
2. Verify the canGenerate property is working
3. Check browser console for errors

## 📝 Notes

- The system is **fail-safe** - if usage tracking fails, generation still works
- Usage is tracked **per club per month**
- Each club has its own independent limit
- The limit automatically resets each month
- **2 roadmaps per month per club** (different from presentations which is 5)

## 🎉 Success Indicators

Once working correctly, you should see:
1. **Usage tracker** displaying current count (0/2, 1/2, 2/2)
2. **Progress bar** filling up as you generate roadmaps
3. **Button states** changing based on usage
4. **Monthly reset** when the month changes

The system is now ready to enforce the 2 roadmap per club per month limit! 🚀
