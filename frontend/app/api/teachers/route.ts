import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import { Teacher, TeacherWithAvailability, TeacherSearchFilters } from '../../../types/teacher';

// GET /api/teachers - List all teachers with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active_only = searchParams.get('active_only') === 'true';
    const has_availability = searchParams.get('has_availability') === 'true';
    const max_clubs_available = searchParams.get('max_clubs_available');
    const room_number = searchParams.get('room_number');

    let query = supabase
      .from('teachers')
      .select(`
        *,
        teacher_availability(*)
      `);

    // Apply filters
    if (active_only) {
      query = query.eq('active', true);
    }

    if (room_number) {
      query = query.eq('room_number', room_number);
    }

    if (max_clubs_available) {
      const maxClubs = parseInt(max_clubs_available);
      query = query.lt('current_clubs_count', maxClubs);
    }

    const { data: teachers, error } = await query;

    if (error) {
      console.error('Error fetching teachers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch teachers' },
        { status: 500 }
      );
    }

    // Filter by availability if requested
    let filteredTeachers = teachers as TeacherWithAvailability[];
    if (has_availability) {
      filteredTeachers = filteredTeachers.filter(teacher => 
        teacher.teacher_availability && teacher.teacher_availability.length > 0
      );
    }

    return NextResponse.json({
      teachers: filteredTeachers,
      total: filteredTeachers.length
    });

  } catch (error) {
    console.error('Error in teachers GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teachers - Register a new teacher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, school_email, room_number, max_clubs, user_id } = body;

    // Validate required fields
    if (!name || !email || !user_id) {
      return NextResponse.json(
        { error: 'Name, email, and user_id are required' },
        { status: 400 }
      );
    }

    // Check if teacher already exists
    const { data: existingTeacher, error: checkError } = await supabase
      .from('teachers')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing teacher:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing teacher' },
        { status: 500 }
      );
    }

    if (existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher already registered with this user ID' },
        { status: 409 }
      );
    }

    // Insert new teacher
    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert([{
        user_id,
        name,
        email,
        school_email,
        room_number,
        max_clubs: max_clubs || 3,
        current_clubs_count: 0,
        active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating teacher:', error);
      return NextResponse.json(
        { error: 'Failed to create teacher' },
        { status: 500 }
      );
    }

    return NextResponse.json(teacher, { status: 201 });

  } catch (error) {
    console.error('Error in teachers POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/teachers - Update teacher information
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, ...updateData } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Update teacher
    const { data: teacher, error } = await supabase
      .from('teachers')
      .update(updateData)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating teacher:', error);
      return NextResponse.json(
        { error: 'Failed to update teacher' },
        { status: 500 }
      );
    }

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);

  } catch (error) {
    console.error('Error in teachers PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 