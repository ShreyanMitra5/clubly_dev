import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import { AdvisorRequest, AdvisorRequestData } from '../../../types/teacher';

// GET /api/advisor-requests - List advisor requests with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacher_id = searchParams.get('teacher_id');
    const club_id = searchParams.get('club_id');
    const student_id = searchParams.get('student_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('advisor_requests')
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

    const { data: requests, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching advisor requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch advisor requests' },
        { status: 500 }
      );
    }

    // Transform data to include joined information
    const transformedRequests = requests?.map(request => ({
      ...request,
      club_name: request.clubs?.name,
      teacher_name: request.teachers?.name,
      teacher_email: request.teachers?.email
    })) || [];

    return NextResponse.json({
      requests: transformedRequests,
      total: transformedRequests.length
    });

  } catch (error) {
    console.error('Error in advisor-requests GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/advisor-requests - Create new advisor request
export async function POST(request: NextRequest) {
  try {
    const body: AdvisorRequestData = await request.json();
    const { club_id, teacher_id, student_id, message } = body;

    // Validate required fields
    if (!club_id || !teacher_id || !student_id) {
      return NextResponse.json(
        { error: 'club_id, teacher_id, and student_id are required' },
        { status: 400 }
      );
    }

    // Check if request already exists
    const { data: existingRequest, error: checkError } = await supabase
      .from('advisor_requests')
      .select('id')
      .eq('club_id', club_id)
      .eq('teacher_id', teacher_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing request:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing request' },
        { status: 500 }
      );
    }

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Advisor request already exists for this club and teacher' },
        { status: 409 }
      );
    }

    // Validate teacher exists and has capacity
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('id, current_clubs_count, max_clubs, active')
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

    if (teacher.current_clubs_count >= teacher.max_clubs) {
      return NextResponse.json(
        { error: 'Teacher has reached maximum number of clubs' },
        { status: 400 }
      );
    }

    // Validate club exists
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id')
      .eq('id', club_id)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Create advisor request
    const { data: advisorRequest, error } = await supabase
      .from('advisor_requests')
      .insert([{
        club_id,
        teacher_id,
        student_id,
        message,
        status: 'pending'
      }])
      .select(`
        *,
        clubs(name),
        teachers(name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating advisor request:', error);
      return NextResponse.json(
        { error: 'Failed to create advisor request' },
        { status: 500 }
      );
    }

    // Create notification for teacher
    await supabase
      .from('notifications')
      .insert([{
        user_id: teacher.user_id,
        type: 'advisor_request',
        title: 'New Advisor Request',
        message: `You have a new advisor request for ${advisorRequest.clubs?.name}`,
        related_id: advisorRequest.id
      }]);

    return NextResponse.json(advisorRequest, { status: 201 });

  } catch (error) {
    console.error('Error in advisor-requests POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/advisor-requests - Update advisor request status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { request_id, status, teacher_id } = body;

    if (!request_id || !status) {
      return NextResponse.json(
        { error: 'request_id and status are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'denied'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "approved" or "denied"' },
        { status: 400 }
      );
    }

    // Get the request with related data
    const { data: advisorRequest, error: fetchError } = await supabase
      .from('advisor_requests')
      .select(`
        *,
        clubs(name),
        teachers(name, email, user_id)
      `)
      .eq('id', request_id)
      .single();

    if (fetchError || !advisorRequest) {
      return NextResponse.json(
        { error: 'Advisor request not found' },
        { status: 404 }
      );
    }

    // Update the request status
    const { data: updatedRequest, error } = await supabase
      .from('advisor_requests')
      .update({ status })
      .eq('id', request_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating advisor request:', error);
      return NextResponse.json(
        { error: 'Failed to update advisor request' },
        { status: 500 }
      );
    }

    // Create notification for student
    await supabase
      .from('notifications')
      .insert([{
        user_id: advisorRequest.student_id,
        type: status === 'approved' ? 'request_approved' : 'request_denied',
        title: `Advisor Request ${status === 'approved' ? 'Approved' : 'Denied'}`,
        message: `Your advisor request for ${advisorRequest.clubs?.name} has been ${status}`,
        related_id: request_id
      }]);

    return NextResponse.json(updatedRequest);

  } catch (error) {
    console.error('Error in advisor-requests PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 