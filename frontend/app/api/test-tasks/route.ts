import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  console.log('TEST: GET /api/test-tasks called');
  
  try {
    // Test basic Supabase connection
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(3);
    
    console.log('TEST: Supabase query result:', { data, error });
    
    return NextResponse.json({
      status: 'success',
      message: 'Test endpoint working',
      tasksCount: data?.length || 0,
      tasks: data,
      error: error
    });
  } catch (error) {
    console.error('TEST: Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Test endpoint failed',
      error: error
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  console.log('TEST: PUT /api/test-tasks called');
  
  try {
    const body = await request.json();
    console.log('TEST: Request body:', body);
    
    return NextResponse.json({
      status: 'success',
      message: 'Test PUT endpoint received data',
      receivedData: body
    });
  } catch (error) {
    console.error('TEST: PUT Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Test PUT endpoint failed',
      error: error
    }, { status: 500 });
  }
}