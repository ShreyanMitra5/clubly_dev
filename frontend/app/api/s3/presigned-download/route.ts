import { NextRequest, NextResponse } from 'next/server';
import { 
  generatePresignedDownloadUrl, 
  extractClubIdFromKey,
  PresignedDownloadRequest 
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
    const body: PresignedDownloadRequest = await request.json();
    const { key } = body;

    // Validate required fields
    if (!key) {
      return NextResponse.json({ 
        error: 'Missing required field: key' 
      }, { status: 400 });
    }

    // Extract club ID from S3 key for authorization
    const clubId = extractClubIdFromKey(key);
    if (!clubId) {
      return NextResponse.json({ 
        error: 'Invalid S3 key format' 
      }, { status: 400 });
    }

    // Authorize the operation
    const { authorized, error: authzError } = await authorizeS3Operation(
      userId, 
      clubId, 
      'download'
    );

    if (!authorized) {
      return NextResponse.json({ 
        error: authzError || 'Not authorized to download from this club' 
      }, { status: 403 });
    }

    // Generate presigned download URL
    const downloadRequest: PresignedDownloadRequest = { key };
    const { url } = await generatePresignedDownloadUrl(downloadRequest);

    // Log the download request
    console.log(`[S3 Download] User ${userId} requesting download from club ${clubId}, key: ${key}`);

    return NextResponse.json({
      success: true,
      url,
      metadata: {
        key,
        clubId,
        userId,
        expiresIn: 3600 // 1 hour
      }
    });

  } catch (error: any) {
    console.error('Error generating presigned download URL:', error);
    return NextResponse.json({ 
      error: 'Failed to generate download URL' 
    }, { status: 500 });
  }
}
