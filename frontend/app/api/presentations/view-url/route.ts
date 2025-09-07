import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedDownloadUrl } from '../../../utils/s3Client';
import { getAuthenticatedUser, authorizeS3Operation } from '../../../utils/clubAuthorization';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId, error: authError } = await getAuthenticatedUser();
    if (!userId || authError) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { s3Key } = body;

    // Validate required fields
    if (!s3Key) {
      return NextResponse.json({ 
        error: 'Missing required field: s3Key' 
      }, { status: 400 });
    }

    // Extract club ID from S3 key for authorization
    const clubIdMatch = s3Key.match(/^clubs\/([^\/]+)\//);
    if (!clubIdMatch) {
      return NextResponse.json({ 
        error: 'Invalid S3 key format' 
      }, { status: 400 });
    }

    const clubId = clubIdMatch[1];

    // Authorize the operation
    const { authorized, error: authzError } = await authorizeS3Operation(
      userId, 
      clubId, 
      'download'
    );

    if (!authorized) {
      return NextResponse.json({ 
        error: authzError || 'Not authorized to view this presentation' 
      }, { status: 403 });
    }

    // Generate presigned download URL
    const { url } = await generatePresignedDownloadUrl({ key: s3Key });

    // Create Office viewer URL
    const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;

    // Log the view request
    console.log(`[Presentation View] User ${userId} viewing presentation from club ${clubId}, key: ${s3Key}`);

    return NextResponse.json({
      success: true,
      viewerUrl,
      presignedUrl: url,
      metadata: {
        s3Key,
        clubId,
        userId,
        expiresIn: 3600 // 1 hour
      }
    });

  } catch (error: any) {
    console.error('Error generating presentation view URL:', error);
    return NextResponse.json({ 
      error: 'Failed to generate view URL' 
    }, { status: 500 });
  }
}
