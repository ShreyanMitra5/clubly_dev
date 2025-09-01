import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
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
    const { key, userId, clubId } = await request.json();
    
    // Validate required fields
    if (!key || !userId || !clubId) {
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

    // Verify the file exists and belongs to the user's club
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET || 'clubly-prod',
        Key: key,
      });
      
      const headResult = await s3.send(headCommand);
      
      // Check if the file belongs to the user's club
      const fileClubId = headResult.Metadata?.['club-id'];
      if (fileClubId !== clubId) {
        return NextResponse.json(
          { error: 'Unauthorized: File does not belong to this club' },
          { status: 403 }
        );
      }
      
    } catch (headError: any) {
      if (headError.name === 'NotFound') {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      throw headError;
    }

    // Create the S3 command for download
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET || 'clubly-prod',
      Key: key,
    });

    // Generate pre-signed URL (15 minute expiry for downloads)
    const signedUrl = await getSignedUrl(s3, getObjectCommand, { expiresIn: 900 });

    // Log the download request for audit purposes
    console.log(`[STORAGE] Download URL generated for user ${userId} in club ${clubId}, key: ${key}`);

    return NextResponse.json({
      url: signedUrl,
      expiresIn: 900, // 15 minutes
    });

  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
