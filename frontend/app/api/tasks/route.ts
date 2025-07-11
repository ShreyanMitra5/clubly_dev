import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '../../services/taskService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    const tasks = await TaskService.getTasks(clubId);
    return NextResponse.json(tasks);
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

    const newTask = await TaskService.createTask(clubId, task);
    return NextResponse.json(newTask);
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

    const updatedTask = await TaskService.updateTask(clubId, taskId, task);
    return NextResponse.json(updatedTask);
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

    await TaskService.deleteTask(clubId, taskId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 