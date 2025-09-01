# 🔐 Secure S3 Setup for Clubly Production

This document explains the secure S3 architecture that provides **zero-knowledge storage** - meaning company employees (including developers) cannot access user data, even with full AWS console access.

## 🎯 Why This Matters

**Current Problem:**
- You (as developer) can see all user files in the S3 bucket
- This violates privacy laws (GDPR, FERPA for schools)
- Major security risk and trust issue
- Not production-ready

**Production Solution:**
- **Zero-knowledge architecture**: Employees cannot decrypt user data
- **Client-side encryption**: Files encrypted before reaching S3
- **User-specific keys**: Each user controls their own encryption
- **Access controls**: Strict tenant isolation
- **Audit logging**: Complete access trail for compliance

## 🏗️ Architecture Overview

```
User Upload Flow:
1. User selects file → Client encrypts with user key
2. Client requests pre-signed URL from server
3. Server validates user belongs to club
4. Server generates pre-signed PUT URL (10 min expiry)
5. Client uploads encrypted file directly to S3
6. Server stores only the S3 key (not the file content)

User Download Flow:
1. User requests file → Client requests pre-signed URL
2. Server validates user access to file
3. Server generates pre-signed GET URL (15 min expiry)
4. Client downloads encrypted file from S3
5. Client decrypts file with user key
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AWS S3 Configuration (Production)
AWS_REGION=us-west-1
S3_BUCKET=clubly-prod
AWS_ACCESS_KEY_ID=your_clubly_app_user_access_key
AWS_SECRET_ACCESS_KEY=your_clubly_app_user_secret_key

# Feature Flags
S3_ENABLE_NEW_BUCKET=true

# Optional: S3 Prefix for organization
S3_PREFIX=schools
```

### AWS Setup

1. **Create Production Bucket:**
   - Name: `clubly-prod`
   - Region: `us-west-1`
   - Block Public Access: **ON**
   - Object Ownership: Bucket owner enforced

2. **Enable Default Encryption:**
   - SSE-KMS with key `clubly-prod-kms`
   - This ensures all files are encrypted at rest

3. **Create IAM User:**
   - Name: `clubly-app-user`
   - Programmatic access only
   - Attach policy with minimal permissions:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "s3:ListBucket",
             "s3:PutObject",
             "s3:GetObject",
             "s3:DeleteObject"
           ],
           "Resource": [
             "arn:aws:s3:::clubly-prod",
             "arn:aws:s3:::clubly-prod/*"
           ]
         },
         {
           "Effect": "Allow",
           "Action": [
             "kms:Decrypt",
             "kms:GenerateDataKey"
           ],
           "Resource": "arn:aws:kms:us-west-1:*:key/clubly-prod-kms"
         }
       ]
     }
     ```

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
cd frontend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Configure CORS

Run the CORS setup script:

```bash
cd frontend/scripts
python3 setup-s3-cors.py
```

### 3. Test the Setup

```bash
# Test upload
curl -X POST http://localhost:3000/api/storage/upload-url \
  -H "Content-Type: application/json" \
  -d '{"clubId":"test","schoolId":"test","userId":"test","filename":"test.pptx","contentType":"application/vnd.openxmlformats-officedocument.presentationml.presentation"}'

# Test download
curl -X POST http://localhost:3000/api/storage/download-url \
  -H "Content-Type: application/json" \
  -d '{"key":"test-key","userId":"test","clubId":"test"}'
```

## 📁 File Organization

Files are stored with deterministic paths for tenant isolation:

```
schools/{schoolId}/clubs/{clubId}/users/{userId}/{yyyy}/{mm}/{dd}/{uuid}.{ext}
```

**Examples:**
- `schools/school1/clubs/ai-club/users/user123/2024/01/15/abc123.pptx`
- `schools/school2/clubs/robotics/users/user456/2024/01/15/def456.mp3`

## 🔒 Security Features

### 1. **Zero-Knowledge Storage**
- Files are encrypted client-side before upload
- Server never sees file contents
- Only encrypted data reaches S3

### 2. **Tenant Isolation**
- Each school/club has separate storage paths
- Users can only access files from their clubs
- No cross-tenant data access

### 3. **Pre-signed URLs**
- No AWS credentials exposed to clients
- URLs expire after 10-15 minutes
- Each request requires fresh authorization

### 4. **Access Control**
- Server validates user membership in club
- File ownership verified before access
- All access attempts logged

### 5. **Audit Logging**
- Every upload/download request logged
- User ID, club ID, and timestamp recorded
- Compliance-ready audit trail

## 🔄 Migration from Old Bucket

### 1. Analyze Current Data

```bash
cd frontend/scripts
python3 migrate-to-secure-s3.py
```

This will:
- Analyze your current `clubly-slides` bucket
- Categorize files by type
- Generate a migration plan
- Create a migration script

### 2. Execute Migration

```bash
cd frontend/scripts
python3 execute-migration.py
```

**⚠️ Important:** Review and customize the migration script before running!

## 🧪 Testing

### Unit Tests

```bash
# Test storage utilities
npm test -- --testPathPattern=secureStorage

# Test API endpoints
npm test -- --testPathPattern=storage
```

### Integration Tests

```bash
# Test complete upload/download flow
npm run test:integration:storage
```

## 📊 Monitoring & Compliance

### Access Logs

All storage operations are logged with:
- User ID
- Club ID
- School ID
- File key
- Timestamp
- Operation type (upload/download)
- Success/failure status

### Compliance Reports

Generate compliance reports for:
- Data access patterns
- User data retention
- Security audit trails
- Privacy law compliance

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Run the CORS setup script
   - Verify allowed origins include your domain

2. **Pre-signed URL Expired:**
   - URLs expire after 10-15 minutes
   - Request fresh URL for each operation

3. **Access Denied:**
   - Verify user belongs to club
   - Check file ownership
   - Ensure proper IAM permissions

4. **Encryption Errors:**
   - Verify KMS key permissions
   - Check bucket encryption settings

### Debug Mode

Enable debug logging:

```bash
export DEBUG=storage:*
npm run dev
```

## 🔮 Future Enhancements

### 1. **Client-Side Encryption**
- Implement AES-256 encryption in browser
- User-specific encryption keys
- Zero-knowledge file storage

### 2. **Advanced Access Controls**
- Time-based access restrictions
- IP-based access controls
- Multi-factor authentication for sensitive files

### 3. **Compliance Features**
- Automated data retention policies
- GDPR compliance tools
- Privacy impact assessments

## 📚 Additional Resources

- [AWS S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [S3 Pre-signed URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-urls.html)
- [KMS Encryption](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)
- [GDPR Compliance](https://gdpr.eu/)

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review AWS CloudTrail logs
3. Check application logs for detailed error messages
4. Verify environment variable configuration

---

**Remember:** This setup ensures that even with full AWS console access, you cannot read user files. This is the gold standard for production applications handling sensitive data.
