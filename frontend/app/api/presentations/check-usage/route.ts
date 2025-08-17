import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

console.log('Supabase client initialized with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

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
    console.log('Query parameters:', { clubId, currentMonthYear });
    
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
    console.log('Current date:', new Date().toISOString());

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
    
    console.log('Current usage count:', currentCount, 'New count will be:', newCount);

    // Try to update existing usage record
    console.log('Attempting upsert with data:', {
      club_id: clubId,
      user_id: userId,
      month_year: currentMonthYear,
      usage_count: newCount,
      updated_at: new Date().toISOString()
    });
    
    // First try to update the existing record
    let updateData: any;
    const { data: updateResult, error: updateError } = await supabase
      .from('presentation_usage')
      .update({
        usage_count: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('club_id', clubId)
      .eq('month_year', currentMonthYear)
      .select()
      .single();

    if (updateError) {
      console.log('Update failed, trying insert...');
      
      // If update fails, try to insert a new record
      const { data: insertData, error: insertError } = await supabase
        .from('presentation_usage')
        .insert({
          club_id: clubId,
          user_id: userId,
          month_year: currentMonthYear,
          usage_count: newCount,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Both update and insert failed:', insertError);
        return NextResponse.json({ error: 'Failed to update usage data' }, { status: 500 });
      }
      
      console.log('✅ Successfully inserted new usage record:', insertData);
      updateData = insertData;
    } else {
      console.log('✅ Successfully updated existing usage record:', updateResult);
      updateData = updateResult;
    }

    console.log('✅ Successfully updated usage in database:', updateData);
    
    // Verify the update by reading it back
    const { data: verifyData, error: verifyError } = await supabase
      .from('presentation_usage')
      .select('usage_count, updated_at')
      .eq('club_id', clubId)
      .eq('month_year', currentMonthYear)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
    } else {
      console.log('🔍 Verification read from database:', verifyData);
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
