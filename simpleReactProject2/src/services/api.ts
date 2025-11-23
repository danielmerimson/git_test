import { Task } from '../components/TaskList';

const API_BASE_URL = 'http://localhost:3002/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all tasks
  async getAllTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks');
  }

  // Get tasks by date
  async getTasksByDate(date: string): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/date/${date}`);
  }

  // Create a new task
  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  // Update a task
  async updateTask(id: string, updates: Partial<Omit<Task, 'id'>>): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Toggle task completion
  async toggleTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // Delete a task
  async deleteTask(id: string): Promise<{ deleted: boolean; id: string }> {
    return this.request<{ deleted: boolean; id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
