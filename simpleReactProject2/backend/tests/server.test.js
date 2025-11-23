const request = require('supertest');
const createApp = require('../app');
const MockDatabase = require('./mockDatabase');

describe('Task Calendar API', () => {
  let app;
  let mockDb;

  beforeEach(() => {
    mockDb = new MockDatabase();
    app = createApp(mockDb);
  });

  afterEach(() => {
    mockDb.reset();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        message: 'Task Calendar API is running'
      });
    });
  });

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all tasks', async () => {
      const testTasks = [
        { id: '1', text: 'Task 1', completed: false, date: '2025-11-06' },
        { id: '2', text: 'Task 2', completed: true, date: '2025-11-07' }
      ];
      mockDb.seedData(testTasks);

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toEqual(testTasks);
    });

    it('should handle database errors', async () => {
      mockDb.getAllTasks = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/tasks')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch tasks' });
    });
  });

  describe('GET /api/tasks/date/:date', () => {
    beforeEach(() => {
      const testTasks = [
        { id: '1', text: 'Task for today', completed: false, date: '2025-11-06' },
        { id: '2', text: 'Another task for today', completed: true, date: '2025-11-06' },
        { id: '3', text: 'Task for tomorrow', completed: false, date: '2025-11-07' }
      ];
      mockDb.seedData(testTasks);
    });

    it('should return tasks for specific date', async () => {
      const response = await request(app)
        .get('/api/tasks/date/2025-11-06')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(task => task.date === '2025-11-06')).toBe(true);
    });

    it('should return empty array for date with no tasks', async () => {
      const response = await request(app)
        .get('/api/tasks/date/2025-12-25')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockDb.getTasksByDate = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/tasks/date/2025-11-06')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch tasks for date' });
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        text: 'New test task',
        completed: false,
        date: '2025-11-06'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body).toMatchObject({
        text: 'New test task',
        completed: false,
        date: '2025-11-06'
      });
      expect(response.body.id).toBeDefined();
    });

    it('should trim whitespace from task text', async () => {
      const newTask = {
        text: '  Task with spaces  ',
        completed: false,
        date: '2025-11-06'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body.text).toBe('Task with spaces');
    });

    it('should default completed to false if not provided', async () => {
      const newTask = {
        text: 'Task without completed field',
        date: '2025-11-06'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body.completed).toBe(false);
    });

    it('should return 400 if text is missing', async () => {
      const newTask = {
        completed: false,
        date: '2025-11-06'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(400);

      expect(response.body).toEqual({ error: 'Text and date are required' });
    });

    it('should return 400 if date is missing', async () => {
      const newTask = {
        text: 'Task without date',
        completed: false
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(400);

      expect(response.body).toEqual({ error: 'Text and date are required' });
    });

    it('should handle database errors', async () => {
      mockDb.createTask = jest.fn().mockRejectedValue(new Error('Database error'));

      const newTask = {
        text: 'Test task',
        completed: false,
        date: '2025-11-06'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create task' });
    });
  });

  describe('PUT /api/tasks/:id', () => {
    beforeEach(() => {
      const testTasks = [
        { id: '1', text: 'Original task', completed: false, date: '2025-11-06' }
      ];
      mockDb.seedData(testTasks);
    });

    it('should update a task', async () => {
      const updates = {
        text: 'Updated task',
        completed: true
      };

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject({
        id: '1',
        text: 'Updated task',
        completed: true,
        date: '2025-11-06'
      });
    });

    it('should return 404 for non-existent task', async () => {
      const updates = { text: 'Updated task' };

      const response = await request(app)
        .put('/api/tasks/999')
        .send(updates)
        .expect(404);

      expect(response.body).toEqual({ error: 'Task not found' });
    });

    it('should handle database errors', async () => {
      mockDb.updateTask = jest.fn().mockRejectedValue(new Error('Database error'));

      const updates = { text: 'Updated task' };

      const response = await request(app)
        .put('/api/tasks/1')
        .send(updates)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to update task' });
    });
  });

  describe('PATCH /api/tasks/:id/toggle', () => {
    beforeEach(() => {
      const testTasks = [
        { id: '1', text: 'Task to toggle', completed: false, date: '2025-11-06' },
        { id: '2', text: 'Completed task', completed: true, date: '2025-11-06' }
      ];
      mockDb.seedData(testTasks);
    });

    it('should toggle task from false to true', async () => {
      const response = await request(app)
        .patch('/api/tasks/1/toggle')
        .expect(200);

      expect(response.body.completed).toBe(true);
    });

    it('should toggle task from true to false', async () => {
      const response = await request(app)
        .patch('/api/tasks/2/toggle')
        .expect(200);

      expect(response.body.completed).toBe(false);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .patch('/api/tasks/999/toggle')
        .expect(404);

      expect(response.body).toEqual({ error: 'Task not found' });
    });

    it('should handle database errors', async () => {
      mockDb.getAllTasks = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch('/api/tasks/1/toggle')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to toggle task' });
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    beforeEach(() => {
      const testTasks = [
        { id: '1', text: 'Task to delete', completed: false, date: '2025-11-06' }
      ];
      mockDb.seedData(testTasks);
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete('/api/tasks/1')
        .expect(200);

      expect(response.body).toEqual({ deleted: true, id: '1' });
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Task not found' });
    });

    it('should handle database errors', async () => {
      mockDb.deleteTask = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/tasks/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to delete task' });
    });
  });

  describe('404 handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Route not found' });
    });
  });

  describe('Error handling middleware', () => {
    it('should handle unexpected errors', async () => {
      // Mock the database to throw an error to trigger error middleware
      mockDb.getAllTasks = jest.fn().mockImplementation(() => {
        throw new Error('Synchronous test error');
      });

      const response = await request(app)
        .get('/api/tasks')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch tasks' });
    });
  });
});
