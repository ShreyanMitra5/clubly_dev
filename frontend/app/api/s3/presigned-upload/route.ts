import { NextRequest, NextResponse } from 'next/server';
import { 
  generatePresignedUploadUrl, 
  generateS3Key,
  PresignedUploadRequest 
} from '../../../utils/s3Client';
import { 
  getAuthenticatedUser, 
  authorizeS3Operation 
} from '../../../utils/clubAuthorization';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId, error: authError } = await getAuthenticatedUser();
    if (!userId || authError) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: PresignedUploadRequest = await request.json();
    const { filename, contentType, clubId, userId: requestUserId, schoolId } = body;

    // Validate required fields
    if (!filename || !contentType || !clubId) {
      return NextResponse.json({ 
        error: 'Missing required fields: filename, contentType, clubId' 
      }, { status: 400 });
    }

    // Ensure the authenticated user matches the request user
    if (requestUserId && requestUserId !== userId) {
      return NextResponse.json({ 
        error: 'User ID mismatch' 
      }, { status: 403 });
    }

    // Authorize the operation
    const { authorized, error: authzError } = await authorizeS3Operation(
      userId, 
      clubId, 
      'upload'
    );

    if (!authorized) {
      return NextResponse.json({ 
        error: authzError || 'Not authorized to upload to this club' 
      }, { status: 403 });
    }

    // Generate presigned upload URL
    const uploadRequest: PresignedUploadRequest = {
      filename,
      contentType,
      clubId,
      userId,
      schoolId
    };

    const { url, key } = await generatePresignedUploadUrl(uploadRequest);

    // Log the upload request
    console.log(`[S3 Upload] User ${userId} requesting upload to club ${clubId}, key: ${key}`);

    return NextResponse.json({
      success: true,
      url,
      key,
      metadata: {
        filename,
        contentType,
        clubId,
        userId,
        schoolId,
        expiresIn: 3600 // 1 hour
      }
    });

  } catch (error: any) {
    console.error('Error generating presigned upload URL:', error);
    return NextResponse.json({ 
      error: 'Failed to generate upload URL' 
    }, { status: 500 });
  }
}
