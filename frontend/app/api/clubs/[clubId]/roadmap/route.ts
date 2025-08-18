import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

// GET roadmap data for a club
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params;
    
    const { data, error } = await supabaseServer
      .from('roadmaps')
      .select('*')
      .eq('club_id', clubId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching roadmap:', error);
      return NextResponse.json({ error: 'Failed to fetch roadmap data' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data || { data: { config: null, events: [] } }
    });
  } catch (error) {
    console.error('Roadmap GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST new roadmap data
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
    const { config, events, skipUsageCheck } = body;
    
    console.log('Received roadmap POST payload:', body);
    if (!events || !Array.isArray(events) || events.length === 0) {
      console.warn('No events provided in roadmap POST payload:', body);
    }

    // Skip usage tracking here - it's handled in generate-topics endpoint
    // This endpoint is mainly for saving/updating roadmap data

    const now = new Date().toISOString();
    // Use upsert with conflict target on club_id to update if exists
    const { data, error } = await supabaseServer
      .from('roadmaps')
      .upsert([
        {
          club_id: clubId,
          events: events ?? [],
          data: {
            config: config ?? {},
            events: events ?? []
          },
          created_at: now,
          updated_at: now
        }
      ], { onConflict: 'club_id' })
      .select()
      .single();
    if (error) {
      console.error('Error saving roadmap:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A roadmap for this club already exists. Use PATCH to update.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to save roadmap data', details: error }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Roadmap POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH update roadmap data
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params;
    const body = await request.json();
    const { config, events } = body;

    const now = new Date().toISOString();
    
    const { data, error } = await supabaseServer
      .from('roadmaps')
      .update({
        events: events ?? [],
        data: {
          config: config ?? {},
          events: events ?? []
        },
        updated_at: now
      })
      .eq('club_id', clubId)
      .select()
      .single();

    if (error) {
      console.error('Error updating roadmap:', error);
      return NextResponse.json({ error: 'Failed to update roadmap data' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Roadmap PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 