import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFileToS3(localFilePath: string, bucket: string, objectName: string) {
  const fileStream = fs.createReadStream(localFilePath);
  const uploadParams = {
    Bucket: bucket,
    Key: objectName,
    Body: fileStream,
    ContentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };

  await s3.send(new PutObjectCommand(uploadParams));
  const publicUrl = `https://${bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${objectName}`;
  const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(publicUrl)}`;
  return { publicUrl, viewerUrl };
} 