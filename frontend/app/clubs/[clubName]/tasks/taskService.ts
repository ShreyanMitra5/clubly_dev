import { supabase } from '../../../../utils/supabaseClient';
import { Task, TaskFormData } from '../../../types/task';

export const taskService = {
  async getTasks(clubId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    return data || [];
  },

  async createTask(clubId: string, taskData: TaskFormData): Promise<Task> {
    const taskToCreate = {
      club_id: clubId,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      due_date: taskData.dueDate || null
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskToCreate])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned after creating task');
    }
    
    return data;
  },

  async updateTask(taskId: string, taskData: Partial<TaskFormData>): Promise<Task> {
    const updateData = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      due_date: taskData.dueDate
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
    return data;
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}; 