import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // First, let's see the current state
    const { data: currentState, error: currentError } = await supabase
      .from('teachers')
      .select(`
        id,
        name,
        current_clubs_count,
        max_clubs
      `);

    if (currentError) {
      console.error('Error fetching current state:', currentError);
      return NextResponse.json(
        { error: 'Failed to fetch current state' },
        { status: 500 }
      );
    }

    // Get actual approved requests count
    const { data: approvedRequests, error: requestsError } = await supabase
      .from('advisor_requests')
      .select('teacher_id, status')
      .eq('status', 'approved');

    if (requestsError) {
      console.error('Error fetching approved requests:', requestsError);
      return NextResponse.json(
        { error: 'Failed to fetch approved requests' },
        { status: 500 }
      );
    }

    // Count approved requests per teacher
    const teacherRequestCounts: { [key: string]: number } = {};
    approvedRequests?.forEach(request => {
      teacherRequestCounts[request.teacher_id] = (teacherRequestCounts[request.teacher_id] || 0) + 1;
    });

    // Update teacher counts to match actual approved requests
    const updatePromises = currentState?.map(teacher => {
      const actualCount = teacherRequestCounts[teacher.id] || 0;
      if (teacher.current_clubs_count !== actualCount) {
        return supabase
          .from('teachers')
          .update({ current_clubs_count: actualCount })
          .eq('id', teacher.id);
      }
      return Promise.resolve({ data: null, error: null });
    });

    const updateResults = await Promise.all(updatePromises || []);

    // Get updated state
    const { data: updatedState, error: updatedError } = await supabase
      .from('teachers')
      .select(`
        id,
        name,
        current_clubs_count,
        max_clubs
      `);

    if (updatedError) {
      console.error('Error fetching updated state:', updatedError);
      return NextResponse.json(
        { error: 'Failed to fetch updated state' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Teacher club counts fixed successfully',
      before: currentState,
      after: updatedState,
      approvedRequestsCount: approvedRequests?.length || 0,
      updatesApplied: updateResults.filter(result => result.data !== null).length
    });

  } catch (error) {
    console.error('Error in fix-teacher-counts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Show current state
    const { data: teachers, error: teachersError } = await supabase
      .from('teachers')
      .select(`
        id,
        name,
        current_clubs_count,
        max_clubs
      `);

    if (teachersError) {
      console.error('Error fetching teachers:', teachersError);
      return NextResponse.json(
        { error: 'Failed to fetch teachers' },
        { status: 500 }
      );
    }

    // Get approved requests
    const { data: approvedRequests, error: requestsError } = await supabase
      .from('advisor_requests')
      .select('teacher_id, status')
      .eq('status', 'approved');

    if (requestsError) {
      console.error('Error fetching approved requests:', requestsError);
      return NextResponse.json(
        { error: 'Failed to fetch approved requests' },
        { status: 500 }
      );
    }

    // Count approved requests per teacher
    const teacherRequestCounts: { [key: string]: number } = {};
    approvedRequests?.forEach(request => {
      teacherRequestCounts[request.teacher_id] = (teacherRequestCounts[request.teacher_id] || 0) + 1;
    });

    // Add actual count to each teacher
    const teachersWithActualCount = teachers?.map(teacher => ({
      ...teacher,
      actual_approved_requests: teacherRequestCounts[teacher.id] || 0,
      count_matches: teacher.current_clubs_count === (teacherRequestCounts[teacher.id] || 0)
    }));

    return NextResponse.json({
      teachers: teachersWithActualCount,
      totalApprovedRequests: approvedRequests?.length || 0,
      inconsistencies: teachersWithActualCount?.filter(t => !t.count_matches).length || 0
    });

  } catch (error) {
    console.error('Error in fix-teacher-counts GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 