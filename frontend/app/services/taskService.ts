import { Task, TaskFormData, TaskStatus, TaskPriority } from '../types/task';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

export class TaskService {
  private static readonly TASKS_DIR = 'data/tasks';

  static async createTask(clubId: string, taskData: TaskFormData): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || TaskStatus.TODO,
      priority: taskData.priority || TaskPriority.MEDIUM,
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.saveTask(clubId, task);
    return task;
  }

  static async updateTask(clubId: string, taskId: string, taskData: Partial<Task>): Promise<Task> {
    const tasks = await this.getTasks(clubId);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...taskData,
      updatedAt: new Date().toISOString()
    };

    tasks[taskIndex] = updatedTask;
    await this.saveTasks(clubId, tasks);
    return updatedTask;
  }

  static async deleteTask(clubId: string, taskId: string): Promise<void> {
    const tasks = await this.getTasks(clubId);
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    await this.saveTasks(clubId, updatedTasks);
  }

  static async getTasks(clubId: string): Promise<Task[]> {
    try {
      const filePath = this.getTaskFilePath(clubId);
      const fileContent = await readFile(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      // If file doesn't exist, return empty array
      return [];
    }
  }

  private static async saveTask(clubId: string, task: Task): Promise<void> {
    const tasks = await this.getTasks(clubId);
    tasks.push(task);
    await this.saveTasks(clubId, tasks);
  }

  private static async saveTasks(clubId: string, tasks: Task[]): Promise<void> {
    const filePath = this.getTaskFilePath(clubId);
    const dirPath = join(process.cwd(), this.TASKS_DIR);
    
    // Ensure directory exists
    await mkdir(dirPath, { recursive: true });
    
    // Save tasks to file
    await writeFile(filePath, JSON.stringify(tasks, null, 2));
  }

  private static getTaskFilePath(clubId: string): string {
    return join(process.cwd(), this.TASKS_DIR, `${clubId}_tasks.json`);
  }
} 