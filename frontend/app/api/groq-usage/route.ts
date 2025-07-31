import { NextRequest, NextResponse } from 'next/server';
import { getUsageStats } from '../../../utils/groqUsageManager';

export async function GET(request: NextRequest) {
  try {
    const stats = getUsageStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to get usage statistics' },
      { status: 500 }
    );
  }
} 