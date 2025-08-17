import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { clubId } = await request.json();

    if (!clubId) {
      return NextResponse.json({ error: 'Missing clubId' }, { status: 400 });
    }

    console.log('Checking usage for clubId:', clubId);
    const currentMonthYear = getCurrentMonthYear();
    console.log('Current month/year:', currentMonthYear);
    const monthlyLimit = 5;

    // Check current usage for this club this month
    console.log('Querying presentation_usage table...');
    const { data: usageData, error: fetchError } = await supabase
      .from('presentation_usage')
      .select('usage_count')
      .eq('club_id', clubId)
      .eq('month_year', currentMonthYear)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching usage data:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
    }

    console.log('Usage data:', usageData);
    const currentUsage = usageData?.usage_count || 0;
    const remainingSlots = Math.max(0, monthlyLimit - currentUsage);
    const canGenerate = remainingSlots > 0;
    
    console.log('Current usage:', currentUsage, 'Remaining slots:', remainingSlots, 'Can generate:', canGenerate);

    return NextResponse.json({
      canGenerate,
      currentUsage,
      remainingSlots,
      monthYear: currentMonthYear,
      monthlyLimit,
    });

  } catch (error) {
    console.error('Error checking presentation usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { clubId, userId } = await request.json();

    if (!clubId || !userId) {
      return NextResponse.json({ error: 'Missing clubId or userId' }, { status: 400 });
    }

    console.log('Updating usage for clubId:', clubId, 'userId:', userId);
    const currentMonthYear = getCurrentMonthYear();
    console.log('Current month/year:', currentMonthYear);

    // First, get the current usage count
    const { data: currentUsage, error: fetchError } = await supabase
      .from('presentation_usage')
      .select('usage_count')
      .eq('club_id', clubId)
      .eq('month_year', currentMonthYear)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching current usage:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch current usage' }, { status: 500 });
    }

    const currentCount = currentUsage?.usage_count || 0;
    const newCount = currentCount + 1;

    // Try to update existing usage record
    const { data: updateData, error: updateError } = await supabase
      .from('presentation_usage')
      .upsert({
        club_id: clubId,
        user_id: userId,
        month_year: currentMonthYear,
        usage_count: newCount,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (updateError) {
      console.error('Error updating usage data:', updateError);
      return NextResponse.json({ error: 'Failed to update usage data' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      usageCount: updateData.usage_count,
      monthYear: currentMonthYear
    });

  } catch (error) {
    console.error('Error updating presentation usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
