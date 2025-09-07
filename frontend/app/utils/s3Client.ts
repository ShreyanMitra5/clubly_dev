import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Centralized S3 client configuration
const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'clubly-prod-2';

export interface S3FileMetadata {
  s3_key: string;
  content_type: string;
  size?: number;
  created_at: string;
  club_id: string;
  user_id: string;
}

export interface PresignedUploadRequest {
  filename: string;
  contentType: string;
  clubId: string;
  userId: string;
  schoolId?: string;
}

export interface PresignedUploadResponse {
  url: string;
  key: string;
}

export interface PresignedDownloadRequest {
  key: string;
}

export interface PresignedDownloadResponse {
  url: string;
}

/**
 * Generate a deterministic S3 key with proper prefixing for authorization
 */
export function generateS3Key(
  type: 'presentations' | 'notes' | 'summaries' | 'thumbnails',
  clubId: string,
  userId: string,
  filename: string,
  schoolId?: string
): string {
  const uuid = crypto.randomUUID();
  const extension = filename.split('.').pop() || 'bin';
  
  // Base structure: clubs/{clubId}/{type}/{uuid}.{ext}
  let key = `clubs/${clubId}/${type}/${uuid}.${extension}`;
  
  // Optionally include user/date segments for organization
  if (schoolId) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    key = `clubs/${clubId}/users/${userId}/${year}/${month}/${day}/${type}/${uuid}.${extension}`;
  }
  
  return key;
}

/**
 * Extract club ID from S3 key for authorization
 */
export function extractClubIdFromKey(key: string): string | null {
  const match = key.match(/^clubs\/([^\/]+)\//);
  return match ? match[1] : null;
}

/**
 * Generate presigned PUT URL for file upload
 */
export async function generatePresignedUploadUrl(
  request: PresignedUploadRequest
): Promise<PresignedUploadResponse> {
  const key = generateS3Key(
    'presentations', // Default type, can be overridden
    request.clubId,
    request.userId,
    request.filename,
    request.schoolId
  );

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: request.contentType,
    // Server-side encryption is handled by bucket default encryption (SSE-KMS)
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

  return { url, key };
}

/**
 * Generate presigned GET URL for file download
 */
export async function generatePresignedDownloadUrl(
  request: PresignedDownloadRequest
): Promise<PresignedDownloadResponse> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: request.key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

  return { url };
}

/**
 * Upload file directly to S3 (server-side only)
 */
export async function uploadFileToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  
  // Return the S3 key (not a public URL)
  return key;
}

/**
 * Download file from S3 (server-side only)
 */
export async function downloadFileFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);
  const chunks: Uint8Array[] = [];
  
  if (response.Body) {
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
  }
  
  return Buffer.concat(chunks);
}

export { s3Client, BUCKET_NAME };
