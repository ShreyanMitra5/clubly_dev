import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if required environment variables are set
    const requiredVars = {
      'AWS_REGION': process.env.AWS_REGION,
      'S3_BUCKET': process.env.S3_BUCKET,
      'AWS_ACCESS_KEY_ID': process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing',
      'AWS_SECRET_ACCESS_KEY': process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing',
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    };

    const missingVars = Object.entries(requiredVars)
      .filter(([key, value]) => !value || value === '❌ Missing')
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing required environment variables',
        missing: missingVars,
        config: requiredVars,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Secure storage configuration is valid',
      config: {
        ...requiredVars,
        'AWS_SECRET_ACCESS_KEY': '✅ Set (hidden for security)',
        'SUPABASE_SERVICE_ROLE_KEY': '✅ Set (hidden for security)',
      },
      endpoints: {
        'upload-url': '/api/storage/upload-url',
        'download-url': '/api/storage/download-url',
      },
      features: [
        'Pre-signed URLs for secure uploads/downloads',
        'Tenant isolation with deterministic paths',
        'Server-side authorization checks',
        'Audit logging for compliance',
        'No AWS credentials exposed to clients',
      ],
    });

  } catch (error) {
    console.error('Storage test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
