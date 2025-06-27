import boto3
import urllib.parse
import os
from dotenv import load_dotenv

load_dotenv()

def upload_to_s3(file_path, bucket, object_name, region='us-west-1'):
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    if not aws_access_key or not aws_secret_key:
        raise EnvironmentError("AWS credentials not found in environment variables.")
    s3 = boto3.client('s3',
                      aws_access_key_id=aws_access_key,
                      aws_secret_access_key=aws_secret_key,
                      region_name=region)
    s3.upload_file(file_path, bucket, object_name)
    url = f"https://{bucket}.s3.{region}.amazonaws.com/{object_name}"
    return url

# --- Fill in your details below ---
file_path = "/Users/kanishk/Desktop/clubly_test_app/upload_to_s3/test-presentation.pptx" # Path to your test file
bucket = "clubly-slides" # Your S3 bucket name
object_name = "test-presentation.pptx" # Name for the file in S3
region = "us-west-1" # Or your chosen region

public_url = upload_to_s3(file_path, bucket, object_name, region)
print("Public URL:", public_url)

# --- Add this to generate the Office Online Viewer link ---
viewer_url = f"https://view.officeapps.live.com/op/view.aspx?src={urllib.parse.quote(public_url, safe='')}"
print("Office Online Viewer URL:", viewer_url)