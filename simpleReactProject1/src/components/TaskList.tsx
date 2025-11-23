import React, { useState } from 'react';
import './TaskList.css';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD format
}

interface TaskListProps {
  selectedDate: Date;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  selectedDate,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask
}) => {
  const [newTaskText, setNewTaskText] = useState('');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const selectedDateString = getDateString(selectedDate);
  const tasksForSelectedDate = tasks.filter(task => task.date === selectedDateString);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask({
        text: newTaskText.trim(),
        completed: false,
        date: selectedDateString
      });
      setNewTaskText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask(e);
    }
  };

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>Tasks for {formatDate(selectedDate)}</h2>
        <p className="task-count">
          {tasksForSelectedDate.length} task{tasksForSelectedDate.length !== 1 ? 's' : ''}
        </p>
      </div>

      <form onSubmit={handleAddTask} className="add-task-form">
        <div className="input-group">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className="task-input"
          />
          <button type="submit" className="add-button" disabled={!newTaskText.trim()}>
            Add
          </button>
        </div>
      </form>

      <div className="tasks-container">
        {tasksForSelectedDate.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks for this day</p>
            <p className="no-tasks-subtitle">Add a task to get started!</p>
          </div>
        ) : (
          <ul className="tasks-list">
            {tasksForSelectedDate.map(task => (
              <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="task-checkbox"
                  />
                  <span className="task-text">{task.text}</span>
                </div>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="delete-button"
                  title="Delete task"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {tasksForSelectedDate.length > 0 && (
        <div className="task-summary">
          <p>
            {tasksForSelectedDate.filter(task => task.completed).length} of {tasksForSelectedDate.length} completed
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
