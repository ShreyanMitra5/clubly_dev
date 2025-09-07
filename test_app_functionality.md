# App Functionality Test Checklist

## 🧪 Testing Your App Still Works

### 1. **Start Your App**
```bash
cd frontend
npm run dev
```

### 2. **Test Presentation Generation**
1. Go to any club
2. Click "Presentations" tab
3. Enter a topic (e.g., "Club Meeting Agenda")
4. Click "Generate Presentation"
5. **Expected**: Presentation generates and displays normally
6. **Check**: File should appear in `clubly-prod-2` bucket under `clubs/{clubId}/presentations/`

### 3. **Test Meeting Notes**
1. Go to "Attendance" tab
2. Click "Start Recording"
3. Record for a few seconds
4. Click "Stop Recording"
5. **Expected**: Recording processes and shows summary
6. **Check**: Audio file should be in S3 under proper club structure

### 4. **Test File Downloads**
1. Try downloading a presentation
2. Try viewing a presentation
3. **Expected**: Files open/download normally
4. **Note**: URLs will be presigned (long, temporary URLs)

### 5. **Test Authorization**
1. Try accessing a club you're not a member of
2. **Expected**: Should be denied access to files
3. **Check**: No unauthorized S3 access

## 🔍 What to Look For

### ✅ **Signs Everything Works:**
- Presentations generate successfully
- Meeting notes record and process
- Files download/open normally
- No error messages in browser console
- No 403/401 errors in network tab

### ⚠️ **Potential Issues to Watch:**
- CORS errors (check browser console)
- "Access Denied" errors (check S3 permissions)
- Files not appearing (check S3 bucket)
- Slow loading (presigned URLs take a moment to generate)

## 🛠️ **If Something Breaks**

### Common Issues & Fixes:

#### 1. **CORS Errors**
```
Error: CORS policy blocks request
Fix: Check S3 bucket CORS configuration
```

#### 2. **Access Denied**
```
Error: AccessDenied when accessing S3
Fix: Check IAM permissions for clubly-app-user
```

#### 3. **Environment Variables**
```
Error: S3 bucket not configured
Fix: Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME
```

#### 4. **File Not Found**
```
Error: File doesn't exist
Fix: Check if file was uploaded to correct bucket/location
```

## 📊 **Monitoring**

### Check These Logs:
1. **Browser Console**: Look for JavaScript errors
2. **Network Tab**: Check for failed requests
3. **Server Logs**: Look for S3 operation errors
4. **S3 Bucket**: Verify files are being created

### Success Indicators:
- Files appear in `clubly-prod-2` bucket
- S3 keys follow pattern: `clubs/{clubId}/{type}/{uuid}.{ext}`
- Presigned URLs work (long URLs that expire)
- No public access to files (direct S3 URLs should fail)
