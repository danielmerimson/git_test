const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('./database');

function createApp(testDb = null) {
  const app = express();
  
  // Use test database if provided, otherwise create new one
  const db = testDb || new Database();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Routes

  // Get all tasks
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await db.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  // Get tasks by date
  app.get('/api/tasks/date/:date', async (req, res) => {
    try {
      const { date } = req.params;
      const tasks = await db.getTasksByDate(date);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks by date:', error);
      res.status(500).json({ error: 'Failed to fetch tasks for date' });
    }
  });

  // Create a new task
  app.post('/api/tasks', async (req, res) => {
    try {
      const { text, completed = false, date } = req.body;
      
      if (!text || !date) {
        return res.status(400).json({ error: 'Text and date are required' });
      }

      const trimmedText = text.trim();
      if (!trimmedText) {
        return res.status(400).json({ error: 'Text and date are required' });
      }

      const task = {
        id: Date.now().toString(),
        text: trimmedText,
        completed,
        date
      };

      const createdTask = await db.createTask(task);
      res.status(201).json(createdTask);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // Update a task
  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedTask = await db.updateTask(id, updates);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      if (error.message === 'Task not found') {
        res.status(404).json({ error: 'Task not found' });
      } else {
        res.status(500).json({ error: 'Failed to update task' });
      }
    }
  });

  // Toggle task completion
  app.patch('/api/tasks/:id/toggle', async (req, res) => {
    try {
      const { id } = req.params;
      
      // First get the current task to know its completion status
      const tasks = await db.getAllTasks();
      const currentTask = tasks.find(task => task.id === id);
      
      if (!currentTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updatedTask = await db.updateTask(id, { completed: !currentTask.completed });
      res.json(updatedTask);
    } catch (error) {
      console.error('Error toggling task:', error);
      res.status(500).json({ error: 'Failed to toggle task' });
    }
  });

  // Delete a task
  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.deleteTask(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.message === 'Task not found') {
        res.status(404).json({ error: 'Task not found' });
      } else {
        res.status(500).json({ error: 'Failed to delete task' });
      }
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Task Calendar API is running' });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Store database reference for testing
  app.db = db;

  return app;
}

module.exports = createApp;
