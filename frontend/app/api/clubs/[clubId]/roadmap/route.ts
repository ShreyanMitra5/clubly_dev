import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../utils/supabaseServer';

// GET roadmap data for a club
export async function GET(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const { clubId } = params;
    
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
  { params }: { params: { clubId: string } }
) {
  try {
    const { clubId } = params;
    const body = await request.json();
    const { config, events } = body;

    const now = new Date().toISOString();
    
    const { data, error } = await supabaseServer
      .from('roadmaps')
      .upsert([{
        club_id: clubId,
        data: {
          config: config,
          events: events
        },
        created_at: now,
        updated_at: now
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving roadmap:', error);
      return NextResponse.json({ error: 'Failed to save roadmap data' }, { status: 500 });
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
  { params }: { params: { clubId: string } }
) {
  try {
    const { clubId } = params;
    const body = await request.json();
    const { config, events } = body;

    const now = new Date().toISOString();
    
    const { data, error } = await supabaseServer
      .from('roadmaps')
      .update({
        data: {
          config: config,
          events: events
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