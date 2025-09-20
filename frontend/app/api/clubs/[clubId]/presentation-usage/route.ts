import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

// GET presentation usage for a club
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
      .from('presentation_usage')
      .select('*')
      .eq('club_id', clubId)
      .eq('month_year', currentMonth)
      .order('generated_at', { ascending: false });

    if (usageError) {
      console.error('Error fetching presentation usage:', usageError);
      // If table doesn't exist or other error, return default values
      const usageCount = 0;
      const limit = 5;
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
    const limit = 999999; // Effectively unlimited
    const remainingGenerations = 999999; // Effectively unlimited
    const canGenerate = true; // Always allow generation

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
    console.error('Presentation usage GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST to record a new presentation generation
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
    const { topic } = body;
    
    // Get current month in YYYY-MM format
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Usage limits disabled - unlimited presentations
    const currentUsageCount = 0; // Always allow generation
    const limit = 999999; // Effectively unlimited

    // Record the new usage
    const { data, error } = await supabaseServer
      .from('presentation_usage')
      .insert([
        {
          club_id: clubId,
          user_id: userId,
          month_year: currentMonth,
          generated_at: now.toISOString(),
          presentation_topic: topic || 'Untitled Presentation'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error recording presentation usage:', error);
      return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
    }

    const newUsageCount = currentUsageCount + 1;
    const remainingGenerations = 999999; // Effectively unlimited

    return NextResponse.json({ 
      success: true, 
      data: {
        usageRecord: data,
        usageCount: newUsageCount,
        limit,
        remainingGenerations,
        canGenerate: true // Always allow generation
      }
    });
  } catch (error) {
    console.error('Presentation usage POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
