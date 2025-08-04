import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is already a teacher
    const { data: teacher, error } = await supabaseServer
      .from('teachers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking teacher status:', error);
      return NextResponse.json({ error: 'Failed to check teacher status' }, { status: 500 });
    }

    return NextResponse.json({ 
      isTeacher: !!teacher,
      teacherId: teacher?.id || null
    });

  } catch (error) {
    console.error('Error in teacher status check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 