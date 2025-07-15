'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Task, TaskFormData, TaskPriority, TaskStatus } from '../../../types/task';

export default function TaskManager() {
  const { clubName } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: ''
  });

  // Reset form data when opening form
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: ''
      });
    }
  }, [editingTask]);

  // Fetch tasks when component mounts
  useEffect(() => {
    if (!clubName) return;
    fetchTasks();
  }, [clubName]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?clubId=${encodeURIComponent(clubName as string)}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        // Update existing task
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId: clubName,
            taskId: editingTask.id,
            task: formData
          })
        });

        if (!response.ok) throw new Error('Failed to update task');
        
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId: clubName,
            task: formData
          })
        });

        if (!response.ok) throw new Error('Failed to create task');
        
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
      }

      handleCloseForm();
    } catch (err) {
      setError(editingTask ? 'Failed to update task' : 'Failed to create task');
      console.error(err);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: ''
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubName,
          taskId,
          task: updates
        })
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?clubId=${encodeURIComponent(clubName as string)}&taskId=${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case TaskPriority.LOW:
        return 'bg-green-50 text-green-700 ring-green-600/20';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-50 text-gray-600 ring-gray-500/20';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case TaskStatus.COMPLETED:
        return 'bg-green-50 text-green-700 ring-green-600/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Club Features Button */}
      <button
        className="px-5 py-2 rounded-lg border border-blue-200 bg-white text-blue-700 font-medium shadow hover:bg-blue-50 transition mb-6 mt-2 self-start"
        onClick={() => router.push(`/clubs/${encodeURIComponent(Array.isArray(clubName) ? clubName[0] : clubName)}`)}
      >
        ← Back to Club Features
      </button>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Tasks</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your club's tasks and track their progress</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Add Task
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    {Object.values(TaskPriority).map(priority => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map(task => (
          <div
            key={task.id}
            className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition hover:shadow-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{task.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-gray-400 hover:text-indigo-500 transition-colors"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{task.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()} Priority
                </span>
                <select
                  value={task.status}
                  onChange={(e) => handleUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset cursor-pointer ${getStatusColor(task.status)}`}
                >
                  {Object.values(TaskStatus).map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {task.dueDate && (
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <svg className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="mt-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
        </div>
      )}
    </div>
  );
} 