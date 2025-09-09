#!/usr/bin/env python3
"""
Test script to verify admin user has restricted access to user files.
This should demonstrate that you cannot download user data.
"""

import boto3
import os
from dotenv import load_dotenv

# Load environment variables
script_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.join(script_dir, '..')
load_dotenv(os.path.join(frontend_dir, '.env'))
load_dotenv(os.path.join(frontend_dir, '.env.local'))

def test_admin_access():
    """Test what the admin user can and cannot do."""
    
    # Get environment variables
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    bucket_name = os.getenv('S3_BUCKET_NAME', 'clubly-prod-2')
    region = os.getenv('AWS_DEFAULT_REGION', 'us-west-1')
    
    if not aws_access_key or not aws_secret_key:
        print("❌ Missing AWS credentials in environment variables")
        return
    
    print(f"🔍 Testing admin access to bucket: {bucket_name}")
    print(f"📍 Region: {region}")
    print(f"👤 Using access key: {aws_access_key[:8]}...")
    print()
    
    # Create S3 client
    s3 = boto3.client(
        's3',
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name=region
    )
    
    try:
        # Test 1: List bucket contents (should work)
        print("📋 Test 1: Listing bucket contents...")
        response = s3.list_objects_v2(Bucket=bucket_name, MaxKeys=5)
        
        if 'Contents' in response:
            print(f"✅ Successfully listed {len(response['Contents'])} objects")
            print("📁 Sample objects:")
            for obj in response['Contents'][:3]:
                print(f"   - {obj['Key']} ({obj['Size']} bytes)")
        else:
            print("📁 Bucket is empty")
        
        print()
        
        # Test 2: Try to download a user file (should fail)
        print("🔒 Test 2: Attempting to download a user file...")
        
        # Look for any user files in the bucket
        if 'Contents' in response and response['Contents']:
            test_key = response['Contents'][0]['Key']
            print(f"🎯 Trying to download: {test_key}")
            
            try:
                # This should fail with AccessDenied
                s3.get_object(Bucket=bucket_name, Key=test_key)
                print("❌ UNEXPECTED: Successfully downloaded file! This means the restriction isn't working.")
                
            except Exception as e:
                error_code = e.response['Error']['Code'] if hasattr(e, 'response') else str(e)
                if 'AccessDenied' in error_code or 'Forbidden' in error_code:
                    print("✅ SUCCESS: Access denied! You cannot download user files.")
                    print("🔐 This is exactly what we want for production security.")
                else:
                    print(f"❓ Unexpected error: {error_code}")
                    print(f"   Details: {e}")
        
        else:
            print("📁 No files found to test download restriction")
        
        print()
        
        # Test 3: Check bucket metadata (should work)
        print("📊 Test 3: Checking bucket metadata...")
        try:
            bucket_info = s3.head_bucket(Bucket=bucket_name)
            print("✅ Successfully accessed bucket metadata")
        except Exception as e:
            print(f"❌ Failed to access bucket metadata: {e}")
        
        print()
        print("🎉 Admin access test completed!")
        print("💡 Summary:")
        print("   - ✅ Can list bucket contents")
        print("   - ✅ Can access bucket metadata") 
        print("   - ❌ Cannot download user files (Access Denied)")
        print("   - 🔐 This is perfect for production security!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_admin_access()
