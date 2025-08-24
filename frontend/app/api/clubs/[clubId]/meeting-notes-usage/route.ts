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
    
    // Get usage data for current month
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
      const totalMinutesUsed = 0;
      const limit = 30; // 30 minutes per month
      const remainingMinutes = limit;
      const canGenerate = true;

      return NextResponse.json({ 
        success: true, 
        data: {
          usageCount,
          totalMinutesUsed,
          limit,
          remainingMinutes,
          canGenerate,
          currentMonth,
          usageHistory: []
        }
      });
    }

    // Calculate total minutes used from all recordings (only 2+ min recordings count)
    const totalMinutesUsed = usageData
      ?.filter(usage => (usage.meeting_duration_minutes || 0) >= 2)
      ?.reduce((total, usage) => total + (usage.meeting_duration_minutes || 0), 0) || 0;
    
    const usageCount = usageData?.length || 0;
    const limit = 30; // 30 minutes per month
    const remainingMinutes = Math.max(0, limit - totalMinutesUsed);
    const canGenerate = remainingMinutes >= 2; // Need at least 2 minutes to generate

    return NextResponse.json({ 
      success: true, 
      data: {
        usageCount,
        totalMinutesUsed,
        limit,
        remainingMinutes,
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
    
    // Check current usage and calculate total minutes used
    const { data: existingUsage, error: checkError } = await supabaseServer
      .from('meeting_notes_usage')
      .select('*')
      .eq('club_id', clubId)
      .eq('month_year', currentMonth);

    if (checkError) {
      console.error('Error checking meeting notes usage:', checkError);
      return NextResponse.json({ error: 'Failed to check usage limit' }, { status: 500 });
    }

    // Calculate total minutes used from existing recordings (only 2+ min recordings count)
    const totalMinutesUsed = existingUsage
      ?.filter(usage => (usage.meeting_duration_minutes || 0) >= 2)
      ?.reduce((total, usage) => total + (usage.meeting_duration_minutes || 0), 0) || 0;
    
    const limit = 30; // 30 minutes per month
    const requestedMinutes = durationMinutes || 0;
    
    // Check if this recording would exceed the monthly limit
    if (requestedMinutes >= 2 && (totalMinutesUsed + requestedMinutes) > limit) {
      return NextResponse.json({ 
        error: 'Monthly limit exceeded', 
        message: `This recording (${requestedMinutes} minutes) would exceed your monthly limit of ${limit} minutes. You have ${limit - totalMinutesUsed} minutes remaining.`,
        totalMinutesUsed,
        requestedMinutes,
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

    // Calculate new totals
    const newTotalMinutesUsed = totalMinutesUsed + (requestedMinutes >= 2 ? requestedMinutes : 0);
    const remainingMinutes = Math.max(0, limit - newTotalMinutesUsed);

    return NextResponse.json({ 
      success: true, 
      data: {
        usageRecord: data,
        totalMinutesUsed: newTotalMinutesUsed,
        limit,
        remainingMinutes,
        canGenerate: remainingMinutes >= 2
      }
    });
  } catch (error) {
    console.error('Meeting notes usage POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
