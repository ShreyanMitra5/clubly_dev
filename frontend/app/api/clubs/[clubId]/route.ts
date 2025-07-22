import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../utils/supabaseServer';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await context.params;

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    // Get user ID from request headers (you might need to adjust this based on your auth setup)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 });
    }

    // First, verify that the user is the owner of the club
    const { data: club, error: clubError } = await supabaseServer
      .from('clubs')
      .select('owner_id')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    if (club.owner_id !== userId) {
      return NextResponse.json({ error: 'You are not authorized to delete this club' }, { status: 403 });
    }

    // Delete the club (this will cascade delete related data due to foreign key constraints)
    const { error: deleteError } = await supabaseServer
      .from('clubs')
      .delete()
      .eq('id', clubId);

    if (deleteError) {
      console.error('Error deleting club:', deleteError);
      return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Club deleted successfully' 
    });

  } catch (error) {
    console.error('Error in DELETE /api/clubs/[clubId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await context.params;
    const body = await request.json();

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    // Get user ID from request headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 });
    }

    // Verify that the user is the owner of the club
    const { data: club, error: clubError } = await supabaseServer
      .from('clubs')
      .select('owner_id')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    if (club.owner_id !== userId) {
      return NextResponse.json({ error: 'You are not authorized to update this club' }, { status: 403 });
    }

    // Update the club
    const { data: updatedClub, error: updateError } = await supabaseServer
      .from('clubs')
      .update({
        description: body.description,
        mission: body.mission,
        goals: body.goals,
        audience: body.audience,
        updated_at: new Date().toISOString()
      })
      .eq('id', clubId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating club:', updateError);
      return NextResponse.json({ error: 'Failed to update club' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      club: updatedClub,
      message: 'Club updated successfully' 
    });

  } catch (error) {
    console.error('Error in PATCH /api/clubs/[clubId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await context.params;

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    // Get the club data
    const { data: club, error: clubError } = await supabaseServer
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      club 
    });

  } catch (error) {
    console.error('Error in GET /api/clubs/[clubId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 