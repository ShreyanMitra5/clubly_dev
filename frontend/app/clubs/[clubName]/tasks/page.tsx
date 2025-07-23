'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Task, TaskFormData, TaskPriority, TaskStatus } from '../../../types/task';
import ClubLayout from '../../../components/ClubLayout';
import { taskService } from './taskService';
import { ProductionClubManager } from '../../../utils/productionClubManager';

export default function TaskManager() {
  const { clubName } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);
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

  // Get club ID when component mounts
  useEffect(() => {
    if (!user || !clubName) return;
    getClubId();
  }, [user, clubName]);

  // Fetch tasks when clubId is available
  useEffect(() => {
    if (clubId) {
      fetchTasks();
    }
  }, [clubId]);

  const getClubId = async () => {
    try {
      const clubs = await ProductionClubManager.getUserClubs(user!.id);
      const club = clubs.find(c => c.clubName === decodeURIComponent(clubName as string));
      if (club) {
        setClubId(club.clubId);
      } else {
        setError('Club not found');
      }
    } catch (err) {
      setError('Failed to load club data');
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    if (!clubId) return;
    try {
      const data = await taskService.getTasks(clubId);
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
    if (!clubId) return;
    
    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = await taskService.updateTask(editingTask.id, formData);
        setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      } else {
        // Create new task
        const newTask = await taskService.createTask(clubId, formData);
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
      const updatedTask = await taskService.updateTask(taskId, updates);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
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

  // Sort tasks by priority
  const highPriority = tasks.filter(t => t.priority === TaskPriority.HIGH);
  const mediumPriority = tasks.filter(t => t.priority === TaskPriority.MEDIUM);
  const lowPriority = tasks.filter(t => t.priority === TaskPriority.LOW);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <ClubLayout>
      <div className="relative min-h-screen bg-gradient-to-br from-white via-orange-50 to-orange-100 p-0">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-orange-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-black/10 to-orange-200/10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extralight text-gray-900 mb-2 tracking-tight">Quick Tasks</h1>
              <p className="text-gray-500 font-light">Assign and track tasks for officers and members</p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Task
            </button>
          </div>

          {/* Task Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* High Priority */}
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> High Urgency
              </h2>
              <div className="space-y-6">
                {highPriority.length === 0 && <div className="text-gray-400 text-sm font-light">No high urgency tasks</div>}
                {highPriority.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleUpdateTask} />
                ))}
              </div>
            </div>
            {/* Medium Priority */}
            <div>
              <h2 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Medium Urgency
              </h2>
              <div className="space-y-6">
                {mediumPriority.length === 0 && <div className="text-gray-400 text-sm font-light">No medium urgency tasks</div>}
                {mediumPriority.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleUpdateTask} />
                ))}
              </div>
            </div>
            {/* Low Priority */}
            <div>
              <h2 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Low Urgency
              </h2>
              <div className="space-y-6">
                {lowPriority.length === 0 && <div className="text-gray-400 text-sm font-light">No low urgency tasks</div>}
                {lowPriority.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleUpdateTask} />
                ))}
              </div>
            </div>
          </div>

          {/* Task Form Modal (unchanged) */}
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* High Priority */}
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> High Urgency
              </h2>
              <div className="space-y-6">
                {highPriority.length === 0 && <div className="text-gray-400 text-sm font-light">No high urgency tasks</div>}
                {highPriority.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleUpdateTask} />
                ))}
              </div>
            </div>
            {/* Medium Priority */}
            <div>
              <h2 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Medium Urgency
              </h2>
              <div className="space-y-6">
                {mediumPriority.length === 0 && <div className="text-gray-400 text-sm font-light">No medium urgency tasks</div>}
                {mediumPriority.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleUpdateTask} />
                ))}
              </div>
            </div>
            {/* Low Priority */}
            <div>
              <h2 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Low Urgency
              </h2>
              <div className="space-y-6">
                {lowPriority.length === 0 && <div className="text-gray-400 text-sm font-light">No low urgency tasks</div>}
                {lowPriority.map(task => (
                  <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleUpdateTask} />
                ))}
              </div>
            </div>
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
      </div>
    </ClubLayout>
  );
}

// TaskCard component for visual polish
function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-100 text-red-700';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-700';
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-700';
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-600';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-700';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-700';
    }
  };
  return (
    <div className="rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 p-6 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-light text-gray-900 truncate">{task.title}</h3>
        <div className="flex gap-2">
          <button onClick={() => onEdit(task)} className="text-gray-400 hover:text-orange-500 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
          </button>
          <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 font-light line-clamp-2 mb-2">{task.description}</p>
      <div className="flex flex-wrap gap-2 items-center mt-auto">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()} Priority</span>
        <select
          value={task.status}
          onChange={e => onStatusChange(task.id, { status: e.target.value })}
          className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${getStatusColor(task.status)}`}
        >
          {Object.values(TaskStatus).map(status => (
            <option key={status} value={status}>{status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ')}</option>
          ))}
        </select>
        {task.dueDate && (
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
} 