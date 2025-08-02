import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

// Helper function to transform database fields to frontend format
function transformTaskFromDB(dbTask: any) {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status,
    priority: dbTask.priority,
    dueDate: dbTask.due_date,
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    // Get tasks from Supabase
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // Transform tasks to frontend format
    const transformedTasks = (tasks || []).map(transformTaskFromDB);
    return NextResponse.json(transformedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clubId, task } = body;

    if (!clubId || !task) {
      return NextResponse.json({ error: 'Club ID and task data are required' }, { status: 400 });
    }

    // Create task in Supabase
    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert([{
        club_id: clubId,
        title: task.title,
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.dueDate || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    // Transform task to frontend format
    return NextResponse.json(transformTaskFromDB(newTask));
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  console.log('PUT /api/tasks - Starting request processing...');
  
  try {
    console.log('PUT /api/tasks - Parsing request body...');
    const body = await request.json();
    const { clubId, taskId, task } = body;

    console.log('PUT /api/tasks - Request body:', JSON.stringify({ clubId, taskId, task }, null, 2));

    if (!clubId || !taskId || !task) {
      console.error('Missing required fields:', { clubId, taskId, task });
      return NextResponse.json({ error: 'Club ID, task ID, and task data are required' }, { status: 400 });
    }

    // Simplify the update - remove all the extra checks for now
    console.log('PUT /api/tasks - Attempting direct update...');
    
    const updateData = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate || null,
      updated_at: new Date().toISOString()
    };
    
    console.log('PUT /api/tasks - Update data:', JSON.stringify(updateData, null, 2));

    // Try updating with just the task ID first (remove club_id filter temporarily)
    console.log('PUT /api/tasks - Trying update with task ID only...');
    
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();
      
    // If that works, let's also check what the actual club_id is
    if (updatedTask) {
      console.log('PUT /api/tasks - Update successful! Task club_id is:', updatedTask.club_id);
      console.log('PUT /api/tasks - Frontend sent club_id:', clubId);
      console.log('PUT /api/tasks - Club IDs match:', updatedTask.club_id === clubId);
    }

    console.log('PUT /api/tasks - Supabase response:', { data: updatedTask, error });

    if (error) {
      console.error('PUT /api/tasks - Supabase error:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Database update failed',
        supabaseError: error,
        details: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        }
      }, { status: 500 });
    }

    if (!updatedTask) {
      console.error('PUT /api/tasks - No task returned after update');
      return NextResponse.json({ 
        error: 'Task update succeeded but no data returned. Task may not exist.',
        searchParams: { taskId, clubId }
      }, { status: 404 });
    }

    console.log('PUT /api/tasks - Task updated successfully:', updatedTask);

    // Transform task to frontend format
    const transformedTask = transformTaskFromDB(updatedTask);
    console.log('PUT /api/tasks - Transformed task:', transformedTask);
    
    return NextResponse.json(transformedTask);
  } catch (error: any) {
    console.error('PUT /api/tasks - Caught exception:', error);
    console.error('PUT /api/tasks - Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const taskId = searchParams.get('taskId');

    if (!clubId || !taskId) {
      return NextResponse.json({ error: 'Club ID and task ID are required' }, { status: 400 });
    }

    // Delete task from Supabase
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('club_id', clubId);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 