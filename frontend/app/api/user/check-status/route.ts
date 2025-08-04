import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has clubs (memberships)
    const { data: memberships, error } = await supabaseServer
      .from('memberships')
      .select('user_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking user status:', error);
      return NextResponse.json({ error: 'Failed to check user status' }, { status: 500 });
    }

    return NextResponse.json({ 
      hasClubs: !!(memberships && memberships.length > 0),
      clubCount: memberships?.length || 0
    });

  } catch (error) {
    console.error('Error in user status check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 