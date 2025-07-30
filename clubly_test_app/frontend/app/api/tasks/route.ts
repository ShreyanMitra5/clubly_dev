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
  try {
    const body = await request.json();
    const { clubId, taskId, task } = body;

    if (!clubId || !taskId || !task) {
      return NextResponse.json({ error: 'Club ID, task ID, and task data are required' }, { status: 400 });
    }

    // Update task in Supabase
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('club_id', clubId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    // Transform task to frontend format
    return NextResponse.json(transformTaskFromDB(updatedTask));
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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