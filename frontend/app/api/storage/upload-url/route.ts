import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for authorization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { clubId, schoolId, userId, filename, contentType } = await request.json();
    
    // Validate required fields
    if (!clubId || !schoolId || !userId || !filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Authorize the user belongs to the club
    const { data: membership, error: membershipError } = await supabase
      .from('club_members')
      .select('*')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Unauthorized: User not a member of this club' },
        { status: 403 }
      );
    }

    // Generate deterministic S3 key with tenant isolation
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const month = String(timestamp.getMonth() + 1).padStart(2, '0');
    const day = String(timestamp.getDate()).padStart(2, '0');
    const uuid = crypto.randomUUID();
    const extension = filename.split('.').pop();
    
    const s3Key = `schools/${schoolId}/clubs/${clubId}/users/${userId}/${year}/${month}/${day}/${uuid}.${extension}`;

    // Create the S3 command
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || 'clubly-prod',
      Key: s3Key,
      ContentType: contentType,
      // Server-side encryption will be handled by bucket defaults
      // Metadata for tracking
      Metadata: {
        'club-id': clubId,
        'school-id': schoolId,
        'user-id': userId,
        'original-filename': filename,
        'upload-timestamp': timestamp.toISOString(),
      },
    });

    // Generate pre-signed URL (10 minute expiry)
    const signedUrl = await getSignedUrl(s3, putObjectCommand, { expiresIn: 600 });

    // Log the upload request for audit purposes
    console.log(`[STORAGE] Upload URL generated for user ${userId} in club ${clubId}, key: ${s3Key}`);

    return NextResponse.json({
      url: signedUrl,
      key: s3Key,
      expiresIn: 600, // 10 minutes
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
