import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const teacherId = searchParams.get('teacherId');
    const clubId = searchParams.get('clubId');
    const status = searchParams.get('status');

    if (!userId && !teacherId) {
      return NextResponse.json({ error: 'User ID or Teacher ID is required' }, { status: 400 });
    }

    let query = supabaseServer
      .from('meeting_bookings')
      .select(`
        *,
        clubs(name),
        teachers(name, email)
      `);

    // Filter by user role
    if (userId) {
      query = query.eq('student_id', userId);
    }
    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }
    if (clubId) {
      query = query.eq('club_id', clubId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Order by meeting date and time
    query = query.order('meeting_date', { ascending: true })
                 .order('start_time', { ascending: true });

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching meeting bookings:', error);
      return NextResponse.json({ error: 'Failed to fetch meeting bookings' }, { status: 500 });
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (error) {
    console.error('Error in meeting bookings GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id } = body; // Get student_id from request body instead of auth()
    
    if (!student_id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }
    const {
      club_id,
      teacher_id,
      meeting_date,
      start_time,
      end_time,
      room_number,
      purpose
    } = body;

    // Validate required fields
    if (!club_id || !teacher_id || !meeting_date || !start_time || !end_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if student has an approved advisor request for this club-teacher combination
    const { data: advisorRequest, error: advisorError } = await supabaseServer
      .from('advisor_requests')
      .select('*')
      .eq('club_id', club_id)
      .eq('teacher_id', teacher_id)
      .eq('student_id', student_id)
      .eq('status', 'approved')
      .single();

    if (advisorError || !advisorRequest) {
      return NextResponse.json({ 
        error: 'You must have an approved advisor request with this teacher before booking meetings' 
      }, { status: 403 });
    }

    // Check for time conflicts with existing bookings
    const { data: conflictingBookings, error: conflictError } = await supabaseServer
      .from('meeting_bookings')
      .select('*')
      .eq('teacher_id', teacher_id)
      .eq('meeting_date', meeting_date)
      .in('status', ['pending', 'approved'])
      .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time}),and(start_time.gte.${start_time},end_time.lte.${end_time})`);

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError);
      return NextResponse.json({ error: 'Failed to check time conflicts' }, { status: 500 });
    }

    if (conflictingBookings && conflictingBookings.length > 0) {
      return NextResponse.json({ 
        error: 'Time slot conflicts with existing booking',
        conflicts: conflictingBookings
      }, { status: 409 });
    }

    // Create the meeting booking
    const { data: newBooking, error: insertError } = await supabaseServer
      .from('meeting_bookings')
      .insert({
        club_id,
        teacher_id,
        student_id: student_id,
        meeting_date,
        start_time,
        end_time,
        room_number,
        purpose,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating meeting booking:', insertError);
      return NextResponse.json({ error: 'Failed to create meeting booking' }, { status: 500 });
    }

    // Create notification for teacher
    await supabaseServer
      .from('notifications')
      .insert({
        user_id: (await supabaseServer.from('teachers').select('user_id').eq('id', teacher_id).single()).data?.user_id || '',
        type: 'meeting_request',
        title: 'New Meeting Request',
        message: `New meeting request for ${meeting_date} from ${start_time} to ${end_time}`,
        related_id: newBooking.id
      });

    return NextResponse.json({ 
      message: 'Meeting booking created successfully',
      booking: newBooking
    });
  } catch (error) {
    console.error('Error in meeting bookings POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}