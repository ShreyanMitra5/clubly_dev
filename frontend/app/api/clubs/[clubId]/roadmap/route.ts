import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../utils/supabaseServer';

export async function GET(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const { clubId } = await params;

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    // Fetch roadmap data from Supabase
    const { data, error } = await supabaseServer
      .from('roadmaps')
      .select('*')
      .eq('club_id', clubId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No roadmap found
        return NextResponse.json({ roadmap: null });
      }
      console.error('Error fetching roadmap:', error);
      return NextResponse.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
    }

    return NextResponse.json({ roadmap: data });

  } catch (error) {
    console.error('Error in roadmap GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clubId: string } }
) {
  try {
    const { clubId } = await params;
    const body = await request.json();

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    if (!body.roadmap) {
      return NextResponse.json({ error: 'Roadmap data is required' }, { status: 400 });
    }

    // Upsert roadmap data to Supabase
    const { data, error } = await supabaseServer
      .from('roadmaps')
      .upsert({
        club_id: clubId,
        data: body.roadmap,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'club_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving roadmap:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ 
        error: 'Failed to save roadmap', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, roadmap: data });

  } catch (error) {
    console.error('Error in roadmap POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 