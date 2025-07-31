import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserUsageSummary } from '../../../utils/userUsageManager';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usageSummary = await getUserUsageSummary(userId);
    
    return NextResponse.json({
      success: true,
      data: usageSummary
    });
  } catch (error) {
    console.error('Error getting user usage:', error);
    return NextResponse.json(
      { error: 'Failed to get usage statistics' },
      { status: 500 }
    );
  }
} 