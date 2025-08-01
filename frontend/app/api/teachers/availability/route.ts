import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';
import { TeacherAvailability, AvailabilityUpdate } from '../../../../types/teacher';

// GET /api/teachers/availability?teacher_id=xxx - Get teacher's availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacher_id = searchParams.get('teacher_id');

    if (!teacher_id) {
      return NextResponse.json(
        { error: 'teacher_id is required' },
        { status: 400 }
      );
    }

    const { data: availability, error } = await supabase
      .from('teacher_availability')
      .select('*')
      .eq('teacher_id', teacher_id)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching teacher availability:', error);
      return NextResponse.json(
        { error: 'Failed to fetch availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({ availability });

  } catch (error) {
    console.error('Error in availability GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teachers/availability - Set teacher availability
export async function POST(request: NextRequest) {
  try {
    const body: AvailabilityUpdate = await request.json();
    const { teacher_id, availability } = body;

    if (!teacher_id || !availability || !Array.isArray(availability)) {
      return NextResponse.json(
        { error: 'teacher_id and availability array are required' },
        { status: 400 }
      );
    }

    // Validate teacher exists
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id')
      .eq('id', teacher_id)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Prepare availability data
    const availabilityData = availability.map(slot => ({
      teacher_id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      room_number: slot.room_number,
      is_recurring: slot.is_recurring,
      is_active: slot.is_active
    }));

    // Delete existing availability for this teacher
    const { error: deleteError } = await supabase
      .from('teacher_availability')
      .delete()
      .eq('teacher_id', teacher_id);

    if (deleteError) {
      console.error('Error deleting existing availability:', deleteError);
      return NextResponse.json(
        { error: 'Failed to update availability' },
        { status: 500 }
      );
    }

    // Insert new availability
    const { data: newAvailability, error: insertError } = await supabase
      .from('teacher_availability')
      .insert(availabilityData)
      .select();

    if (insertError) {
      console.error('Error inserting availability:', insertError);
      return NextResponse.json(
        { error: 'Failed to save availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      availability: newAvailability,
      message: 'Availability updated successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in availability POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/teachers/availability - Update specific availability slot
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { availability_id, ...updateData } = body;

    if (!availability_id) {
      return NextResponse.json(
        { error: 'availability_id is required' },
        { status: 400 }
      );
    }

    const { data: availability, error } = await supabase
      .from('teacher_availability')
      .update(updateData)
      .eq('id', availability_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating availability:', error);
      return NextResponse.json(
        { error: 'Failed to update availability' },
        { status: 500 }
      );
    }

    if (!availability) {
      return NextResponse.json(
        { error: 'Availability slot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(availability);

  } catch (error) {
    console.error('Error in availability PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teachers/availability - Delete availability slot
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const availability_id = searchParams.get('availability_id');

    if (!availability_id) {
      return NextResponse.json(
        { error: 'availability_id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('teacher_availability')
      .delete()
      .eq('id', availability_id);

    if (error) {
      console.error('Error deleting availability:', error);
      return NextResponse.json(
        { error: 'Failed to delete availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Availability slot deleted successfully' 
    });

  } catch (error) {
    console.error('Error in availability DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 