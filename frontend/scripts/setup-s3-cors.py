#!/usr/bin/env python3
"""
S3 CORS Configuration Script for Clubly Production

This script configures CORS settings on the clubly-prod S3 bucket to allow
secure file uploads and downloads from the application domains.
"""

import boto3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_s3_cors():
    """Configure CORS settings on the S3 bucket"""
    
    # Get configuration from environment
    bucket_name = os.getenv('S3_BUCKET', 'clubly-prod')
    region = os.getenv('AWS_REGION', 'us-west-1')
    
    # Production domain - replace with your actual domain
    production_domain = os.getenv('PRODUCTION_DOMAIN', 'your-production-domain.com')
    
    # CORS configuration
    cors_configuration = {
        'CORSRules': [
            {
                'AllowedHeaders': ['*'],
                'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE'],
                'AllowedOrigins': [
                    'http://localhost:3000',  # Development
                    f'https://{production_domain}',  # Production
                    f'https://www.{production_domain}',  # Production with www
                ],
                'ExposeHeaders': ['ETag', 'x-amz-version-id'],
                'MaxAgeSeconds': 300
            }
        ]
    }
    
    try:
        # Initialize S3 client
        s3 = boto3.client(
            's3',
            region_name=region,
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        
        # Apply CORS configuration
        s3.put_bucket_cors(
            Bucket=bucket_name,
            CORSConfiguration=cors_configuration
        )
        
        print(f"✅ Successfully configured CORS for bucket: {bucket_name}")
        print(f"   Allowed origins: {cors_configuration['CORSRules'][0]['AllowedOrigins']}")
        print(f"   Allowed methods: {cors_configuration['CORSRules'][0]['AllowedMethods']}")
        
    except Exception as e:
        print(f"❌ Error configuring CORS: {e}")
        return False
    
    return True

def verify_cors_configuration():
    """Verify the current CORS configuration"""
    
    bucket_name = os.getenv('S3_BUCKET', 'clubly-prod')
    region = os.getenv('AWS_REGION', 'us-west-1')
    
    try:
        s3 = boto3.client(
            's3',
            region_name=region,
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        
        response = s3.get_bucket_cors(Bucket=bucket_name)
        print(f"\n📋 Current CORS configuration for {bucket_name}:")
        print(response['CORSRules'])
        
    except Exception as e:
        print(f"❌ Error retrieving CORS configuration: {e}")

if __name__ == "__main__":
    print("🚀 Setting up S3 CORS configuration for Clubly Production...")
    
    # Check if required environment variables are set
    required_vars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {missing_vars}")
        print("Please set these variables in your .env file")
        exit(1)
    
    # Setup CORS
    if setup_s3_cors():
        # Verify configuration
        verify_cors_configuration()
        print("\n🎉 S3 CORS configuration completed successfully!")
    else:
        print("\n💥 Failed to configure S3 CORS")
        exit(1)
