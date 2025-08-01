import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import { MeetingBooking, BookingRequest, BookingConflict } from '../../../types/teacher';

// GET /api/meeting-bookings - List meeting bookings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacher_id = searchParams.get('teacher_id');
    const club_id = searchParams.get('club_id');
    const student_id = searchParams.get('student_id');
    const status = searchParams.get('status');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    let query = supabase
      .from('meeting_bookings')
      .select(`
        *,
        clubs(name),
        teachers(name, email)
      `);

    // Apply filters
    if (teacher_id) {
      query = query.eq('teacher_id', teacher_id);
    }

    if (club_id) {
      query = query.eq('club_id', club_id);
    }

    if (student_id) {
      query = query.eq('student_id', student_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (date_from) {
      query = query.gte('meeting_date', date_from);
    }

    if (date_to) {
      query = query.lte('meeting_date', date_to);
    }

    const { data: bookings, error } = await query
      .order('meeting_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching meeting bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meeting bookings' },
        { status: 500 }
      );
    }

    // Transform data to include joined information
    const transformedBookings = bookings?.map(booking => ({
      ...booking,
      club_name: booking.clubs?.name,
      teacher_name: booking.teachers?.name,
      teacher_email: booking.teachers?.email
    })) || [];

    return NextResponse.json({
      bookings: transformedBookings,
      total: transformedBookings.length
    });

  } catch (error) {
    console.error('Error in meeting-bookings GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/meeting-bookings - Create new meeting booking
export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();
    const { club_id, teacher_id, student_id, meeting_date, start_time, end_time, room_number, purpose } = body;

    // Validate required fields
    if (!club_id || !teacher_id || !student_id || !meeting_date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'club_id, teacher_id, student_id, meeting_date, start_time, and end_time are required' },
        { status: 400 }
      );
    }

    // Validate teacher exists and is active
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, active, user_id')
      .eq('id', teacher_id)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    if (!teacher.active) {
      return NextResponse.json(
        { error: 'Teacher is not active' },
        { status: 400 }
      );
    }

    // Validate club exists
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, name')
      .eq('id', club_id)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Check if advisor request is approved
    const { data: advisorRequest, error: advisorError } = await supabase
      .from('advisor_requests')
      .select('status')
      .eq('club_id', club_id)
      .eq('teacher_id', teacher_id)
      .single();

    if (advisorError || !advisorRequest || advisorRequest.status !== 'approved') {
      return NextResponse.json(
        { error: 'Teacher must be an approved advisor for this club' },
        { status: 400 }
      );
    }

    // Check for booking conflicts
    const { data: conflictingBookings, error: conflictError } = await supabase
      .from('meeting_bookings')
      .select('*')
      .eq('teacher_id', teacher_id)
      .eq('meeting_date', meeting_date)
      .eq('status', 'confirmed')
      .or(`start_time.lt.${end_time},end_time.gt.${start_time}`);

    if (conflictError) {
      console.error('Error checking booking conflicts:', conflictError);
      return NextResponse.json(
        { error: 'Failed to check booking conflicts' },
        { status: 500 }
      );
    }

    if (conflictingBookings && conflictingBookings.length > 0) {
      return NextResponse.json({
        error: 'Booking conflict detected',
        has_conflict: true,
        conflicting_bookings: conflictingBookings
      }, { status: 409 });
    }

    // Create meeting booking
    const { data: booking, error } = await supabase
      .from('meeting_bookings')
      .insert([{
        club_id,
        teacher_id,
        student_id,
        meeting_date,
        start_time,
        end_time,
        room_number,
        purpose,
        status: 'confirmed'
      }])
      .select(`
        *,
        clubs(name),
        teachers(name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating meeting booking:', error);
      return NextResponse.json(
        { error: 'Failed to create meeting booking' },
        { status: 500 }
      );
    }

    // Create notification for teacher
    await supabase
      .from('notifications')
      .insert([{
        user_id: teacher.user_id,
        type: 'booking_confirmed',
        title: 'New Meeting Booking',
        message: `You have a new meeting booking for ${club.name} on ${meeting_date}`,
        related_id: booking.id
      }]);

    return NextResponse.json(booking, { status: 201 });

  } catch (error) {
    console.error('Error in meeting-bookings POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/meeting-bookings - Update booking status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, status } = body;

    if (!booking_id || !status) {
      return NextResponse.json(
        { error: 'booking_id and status are required' },
        { status: 400 }
      );
    }

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "confirmed", "cancelled", or "completed"' },
        { status: 400 }
      );
    }

    // Get the booking with related data
    const { data: booking, error: fetchError } = await supabase
      .from('meeting_bookings')
      .select(`
        *,
        clubs(name),
        teachers(name, email, user_id)
      `)
      .eq('id', booking_id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Meeting booking not found' },
        { status: 404 }
      );
    }

    // Update the booking status
    const { data: updatedBooking, error } = await supabase
      .from('meeting_bookings')
      .update({ status })
      .eq('id', booking_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating meeting booking:', error);
      return NextResponse.json(
        { error: 'Failed to update meeting booking' },
        { status: 500 }
      );
    }

    // Create notification for student
    await supabase
      .from('notifications')
      .insert([{
        user_id: booking.student_id,
        type: status === 'cancelled' ? 'booking_cancelled' : 'booking_confirmed',
        title: `Meeting ${status === 'cancelled' ? 'Cancelled' : 'Updated'}`,
        message: `Your meeting for ${booking.clubs?.name} has been ${status}`,
        related_id: booking_id
      }]);

    return NextResponse.json(updatedBooking);

  } catch (error) {
    console.error('Error in meeting-bookings PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/meeting-bookings/check-conflict - Check for booking conflicts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacher_id = searchParams.get('teacher_id');
    const meeting_date = searchParams.get('meeting_date');
    const start_time = searchParams.get('start_time');
    const end_time = searchParams.get('end_time');
    const exclude_booking_id = searchParams.get('exclude_booking_id');

    if (!teacher_id || !meeting_date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'teacher_id, meeting_date, start_time, and end_time are required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('meeting_bookings')
      .select('*')
      .eq('teacher_id', teacher_id)
      .eq('meeting_date', meeting_date)
      .eq('status', 'confirmed')
      .or(`start_time.lt.${end_time},end_time.gt.${start_time}`);

    if (exclude_booking_id) {
      query = query.neq('id', exclude_booking_id);
    }

    const { data: conflictingBookings, error } = await query;

    if (error) {
      console.error('Error checking booking conflicts:', error);
      return NextResponse.json(
        { error: 'Failed to check booking conflicts' },
        { status: 500 }
      );
    }

    const hasConflict = conflictingBookings && conflictingBookings.length > 0;

    return NextResponse.json({
      has_conflict: hasConflict,
      conflicting_bookings: conflictingBookings || []
    });

  } catch (error) {
    console.error('Error in check-conflict GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 