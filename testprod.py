import os
import uuid
import boto3
from dotenv import load_dotenv

# 1) Load .env (adjust filename if yours is .env.local)
load_dotenv()

# 2) Read env and validate
required = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_DEFAULT_REGION", "S3_BUCKET_NAME"]
missing = [k for k in required if not os.getenv(k)]
if missing:
    raise SystemExit(f"Missing env vars: {missing}. Make sure they're in your .env and you're running from that folder.")

region = os.getenv("AWS_DEFAULT_REGION")
bucket = os.getenv("S3_BUCKET_NAME")

print("Using bucket:", bucket, "region:", region)

# 3) Create client and upload
s3 = boto3.client("s3", region_name=region)

key = f"test/{uuid.uuid4()}.txt"
s3.put_object(Bucket=bucket, Key=key, Body=b"hello from Clubly test upload", ContentType="text/plain")

print(f"✅ Uploaded to s3://{bucket}/{key}")