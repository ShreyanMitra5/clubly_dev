import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

// GET meeting notes usage for a club
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clubId } = await params;
    
    // Get current month in YYYY-MM format
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Get usage count for current month
    const { data: usageData, error: usageError } = await supabaseServer
      .from('meeting_notes_usage')
      .select('*')
      .eq('club_id', clubId)
      .eq('month_year', currentMonth)
      .order('generated_at', { ascending: false });

    if (usageError) {
      console.error('Error fetching meeting notes usage:', usageError);
      // If table doesn't exist or other error, return default values
      const usageCount = 0;
      const limit = 1;
      const remainingGenerations = limit;
      const canGenerate = true;

      return NextResponse.json({ 
        success: true, 
        data: {
          usageCount,
          limit,
          remainingGenerations,
          canGenerate,
          currentMonth,
          usageHistory: []
        }
      });
    }

    const usageCount = usageData?.length || 0;
    const limit = 1;
    const remainingGenerations = Math.max(0, limit - usageCount);
    const canGenerate = remainingGenerations > 0;

    return NextResponse.json({ 
      success: true, 
      data: {
        usageCount,
        limit,
        remainingGenerations,
        canGenerate,
        currentMonth,
        usageHistory: usageData || []
      }
    });
  } catch (error) {
    console.error('Meeting notes usage GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST to record a new meeting notes generation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clubId } = await params;
    const body = await request.json();
    const { meetingTitle, durationMinutes } = body;
    
    // Get current month in YYYY-MM format
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Check current usage count
    const { data: existingUsage, error: checkError } = await supabaseServer
      .from('meeting_notes_usage')
      .select('id')
      .eq('club_id', clubId)
      .eq('month_year', currentMonth);

    if (checkError) {
      console.error('Error checking meeting notes usage:', checkError);
      return NextResponse.json({ error: 'Failed to check usage limit' }, { status: 500 });
    }

    const currentUsageCount = existingUsage?.length || 0;
    const limit = 1;

    if (currentUsageCount >= limit) {
      return NextResponse.json({ 
        error: 'Monthly limit reached', 
        message: `You have reached the limit of ${limit} meeting note generation per month.`,
        usageCount: currentUsageCount,
        limit 
      }, { status: 429 });
    }

    // Record the new usage
    const { data, error } = await supabaseServer
      .from('meeting_notes_usage')
      .insert([
        {
          club_id: clubId,
          user_id: userId,
          month_year: currentMonth,
          generated_at: now.toISOString(),
          meeting_duration_minutes: durationMinutes || 0,
          meeting_title: meetingTitle || 'Meeting Notes'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error recording meeting notes usage:', error);
      return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
    }

    const newUsageCount = currentUsageCount + 1;
    const remainingGenerations = Math.max(0, limit - newUsageCount);

    return NextResponse.json({ 
      success: true, 
      data: {
        usageRecord: data,
        usageCount: newUsageCount,
        limit,
        remainingGenerations,
        canGenerate: remainingGenerations > 0
      }
    });
  } catch (error) {
    console.error('Meeting notes usage POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
