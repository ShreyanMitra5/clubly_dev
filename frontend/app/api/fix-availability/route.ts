import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherName } = body;

    if (!teacherName) {
      return NextResponse.json(
        { error: 'Teacher name is required' },
        { status: 400 }
      );
    }

    // Get teacher ID
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id')
      .eq('name', teacherName)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Get current availability data
    const { data: currentAvailability, error: currentError } = await supabase
      .from('teacher_availability')
      .select('*')
      .eq('teacher_id', teacher.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (currentError) {
      console.error('Error fetching current availability:', currentError);
      return NextResponse.json(
        { error: 'Failed to fetch current availability' },
        { status: 500 }
      );
    }

    // Remove duplicate entries (keep the oldest one)
    const uniqueAvailability = currentAvailability?.reduce((acc: any[], current: any) => {
      const exists = acc.find(item => 
        item.day_of_week === current.day_of_week &&
        item.start_time === current.start_time &&
        item.end_time === current.end_time
      );
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Delete all current availability for this teacher
    const { error: deleteError } = await supabase
      .from('teacher_availability')
      .delete()
      .eq('teacher_id', teacher.id);

    if (deleteError) {
      console.error('Error deleting availability:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete availability' },
        { status: 500 }
      );
    }

    // Insert cleaned up availability
    if (uniqueAvailability && uniqueAvailability.length > 0) {
      const { error: insertError } = await supabase
        .from('teacher_availability')
        .insert(uniqueAvailability);

      if (insertError) {
        console.error('Error inserting cleaned availability:', insertError);
        return NextResponse.json(
          { error: 'Failed to insert cleaned availability' },
          { status: 500 }
        );
      }
    }

    // Get updated availability data
    const { data: updatedAvailability, error: updatedError } = await supabase
      .from('teacher_availability')
      .select('*')
      .eq('teacher_id', teacher.id)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (updatedError) {
      console.error('Error fetching updated availability:', updatedError);
      return NextResponse.json(
        { error: 'Failed to fetch updated availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Availability data cleaned successfully',
      teacherName,
      before: currentAvailability?.length || 0,
      after: updatedAvailability?.length || 0,
      removed: (currentAvailability?.length || 0) - (updatedAvailability?.length || 0),
      availability: updatedAvailability
    });

  } catch (error) {
    console.error('Error in fix-availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherName = searchParams.get('teacher');

    if (!teacherName) {
      return NextResponse.json(
        { error: 'Teacher name is required' },
        { status: 400 }
      );
    }

    // Get teacher availability data
    const { data: availability, error } = await supabase
      .from('teachers')
      .select(`
        id,
        name,
        teacher_availability (
          id,
          day_of_week,
          start_time,
          end_time,
          room_number,
          is_active,
          created_at
        )
      `)
      .eq('name', teacherName)
      .single();

    if (error || !availability) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Check for duplicates
    const availabilitySlots = availability.teacher_availability || [];
    const duplicates = availabilitySlots.reduce((acc: any[], slot: any, index: number) => {
      const duplicateIndex = availabilitySlots.findIndex((s: any, i: number) => 
        i !== index && 
        s.day_of_week === slot.day_of_week &&
        s.start_time === slot.start_time &&
        s.end_time === slot.end_time
      );
      if (duplicateIndex !== -1) {
        acc.push({
          slot,
          duplicateIndex,
          duplicateSlot: availabilitySlots[duplicateIndex]
        });
      }
      return acc;
    }, []);

    return NextResponse.json({
      teacher: availability.name,
      totalSlots: availabilitySlots.length,
      duplicates: duplicates.length,
      duplicateDetails: duplicates,
      availability: availabilitySlots.sort((a: any, b: any) => {
        if (a.day_of_week !== b.day_of_week) {
          return a.day_of_week - b.day_of_week;
        }
        return a.start_time.localeCompare(b.start_time);
      })
    });

  } catch (error) {
    console.error('Error in fix-availability GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 