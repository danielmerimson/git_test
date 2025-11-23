import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import TaskList, { Task } from './components/TaskList';
import { apiService } from './services/api';
import './App.css';

function App() {
  const [appSelectedDate, setAppSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const allTasks = await apiService.getAllTasks();
      setTasks(allTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setAppSelectedDate(date);
  };

  const handleAddTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      setError(null);
      const createdTask = await apiService.createTask(newTask);
      setTasks(prev => [...prev, createdTask]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
      console.error('Error adding task:', err);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      setError(null);
      const updatedTask = await apiService.toggleTask(taskId);
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, completed: updatedTask.completed }
            : task
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setError(null);
      await apiService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Task Calendar</h1>
          <p>Loading tasks...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Calendar</h1>
        <p>Select a date and manage your tasks</p>
        {error && (
          <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
            Error: {error}
            <button 
              onClick={loadTasks} 
              style={{ marginLeft: '10px', padding: '5px 10px' }}
            >
              Retry
            </button>
          </div>
        )}
      </header>
      
      <main className="App-main">
        <div className="panels-container">
          <div className="left-panel">
            <Calendar 
              calendarSelectedDate={appSelectedDate}
              onDateSelect={handleDateSelect}
            />
          </div>
          
          <div className="right-panel">
            <TaskList
              selectedDate={appSelectedDate}
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
