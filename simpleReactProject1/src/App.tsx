import React, { useState } from 'react';
import Calendar from './components/Calendar';
import TaskList, { Task } from './components/TaskList';
import './App.css';

function App() {
  const [appSelectedDate, setAppSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      text: 'Sample task for today',
      completed: false,
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '2',
      text: 'Another task',
      completed: true,
      date: new Date().toISOString().split('T')[0]
    }
  ]);

  const handleDateSelect = (date: Date) => {
    setAppSelectedDate(date);
  };

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString()
    };
    setTasks(prev => [...prev, task]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Calendar</h1>
        <p>Select a date and manage your tasks</p>
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
