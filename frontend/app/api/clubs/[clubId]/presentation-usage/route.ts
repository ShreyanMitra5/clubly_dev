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
      const limit = Infinity; // Unlimited presentations
      const remainingGenerations = Infinity; // Unlimited
      const canGenerate = true; // Always allow generation

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
    const limit = Infinity; // Unlimited presentations
    const remainingGenerations = Infinity; // Unlimited
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
    
    // Check current usage count
    const { data: existingUsage, error: checkError } = await supabaseServer
      .from('presentation_usage')
      .select('id')
      .eq('club_id', clubId)
      .eq('month_year', currentMonth);

    if (checkError) {
      console.error('Error checking presentation usage:', checkError);
      return NextResponse.json({ error: 'Failed to check usage limit' }, { status: 500 });
    }

    const currentUsageCount = existingUsage?.length || 0;
    const limit = Infinity; // Unlimited presentations
    // Remove limit check - always allow generation

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
    const remainingGenerations = Infinity; // Unlimited

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
    console.error('Presentation usage POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
