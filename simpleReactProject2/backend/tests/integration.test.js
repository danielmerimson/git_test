const request = require('supertest');
const createApp = require('../app');
const MockDatabase = require('./mockDatabase');

describe('Task Calendar API - Integration Tests', () => {
  let app;
  let mockDb;

  beforeEach(() => {
    mockDb = new MockDatabase();
    app = createApp(mockDb);
  });

  afterEach(() => {
    mockDb.reset();
  });

  describe('Complete task workflow', () => {
    it('should create, read, update, and delete a task', async () => {
      // Create a task
      const newTask = {
        text: 'Integration test task',
        completed: false,
        date: '2025-11-06'
      };

      const createResponse = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      const taskId = createResponse.body.id;
      expect(createResponse.body).toMatchObject(newTask);

      // Read all tasks
      const getAllResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(getAllResponse.body).toHaveLength(1);
      expect(getAllResponse.body[0]).toMatchObject(newTask);

      // Read tasks by date
      const getByDateResponse = await request(app)
        .get('/api/tasks/date/2025-11-06')
        .expect(200);

      expect(getByDateResponse.body).toHaveLength(1);
      expect(getByDateResponse.body[0]).toMatchObject(newTask);

      // Update the task
      const updates = {
        text: 'Updated integration test task',
        completed: true
      };

      const updateResponse = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updates)
        .expect(200);

      expect(updateResponse.body).toMatchObject({
        ...newTask,
        ...updates,
        id: taskId
      });

      // Toggle the task
      const toggleResponse = await request(app)
        .patch(`/api/tasks/${taskId}/toggle`)
        .expect(200);

      expect(toggleResponse.body.completed).toBe(false);

      // Delete the task
      const deleteResponse = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(200);

      expect(deleteResponse.body).toEqual({ deleted: true, id: taskId });

      // Verify task is deleted
      const finalGetResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(finalGetResponse.body).toHaveLength(0);
    });
  });

  describe('Multiple tasks management', () => {
    it('should handle multiple tasks across different dates', async () => {
      const tasks = [
        { text: 'Task 1', completed: false, date: '2025-11-06' },
        { text: 'Task 2', completed: true, date: '2025-11-06' },
        { text: 'Task 3', completed: false, date: '2025-11-07' },
        { text: 'Task 4', completed: true, date: '2025-11-07' }
      ];

      // Create all tasks
      const createdTasks = [];
      for (const task of tasks) {
        const response = await request(app)
          .post('/api/tasks')
          .send(task)
          .expect(201);
        createdTasks.push(response.body);
      }

      // Get all tasks
      const allTasksResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(allTasksResponse.body).toHaveLength(4);

      // Get tasks for first date
      const firstDateResponse = await request(app)
        .get('/api/tasks/date/2025-11-06')
        .expect(200);

      expect(firstDateResponse.body).toHaveLength(2);
      expect(firstDateResponse.body.every(task => task.date === '2025-11-06')).toBe(true);

      // Get tasks for second date
      const secondDateResponse = await request(app)
        .get('/api/tasks/date/2025-11-07')
        .expect(200);

      expect(secondDateResponse.body).toHaveLength(2);
      expect(secondDateResponse.body.every(task => task.date === '2025-11-07')).toBe(true);

      // Toggle all tasks
      for (const task of createdTasks) {
        await request(app)
          .patch(`/api/tasks/${task.id}/toggle`)
          .expect(200);
      }

      // Verify all tasks are toggled
      const toggledTasksResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      const originallyCompleted = tasks.filter(t => t.completed).length;
      const originallyIncomplete = tasks.filter(t => !t.completed).length;
      
      const nowCompleted = toggledTasksResponse.body.filter(t => t.completed).length;
      const nowIncomplete = toggledTasksResponse.body.filter(t => !t.completed).length;

      expect(nowCompleted).toBe(originallyIncomplete);
      expect(nowIncomplete).toBe(originallyCompleted);
    });
  });

  describe('Data validation and edge cases', () => {
    it('should handle empty strings and whitespace', async () => {
      // Empty text should fail
      await request(app)
        .post('/api/tasks')
        .send({ text: '', date: '2025-11-06' })
        .expect(400);

      // Whitespace-only text should be trimmed and fail if empty
      await request(app)
        .post('/api/tasks')
        .send({ text: '   ', date: '2025-11-06' })
        .expect(400);

      // Valid text with whitespace should be trimmed
      const response = await request(app)
        .post('/api/tasks')
        .send({ text: '  Valid task  ', date: '2025-11-06' })
        .expect(201);

      expect(response.body.text).toBe('Valid task');
    });

    it('should handle special characters in task text', async () => {
      const specialText = 'Task with émojis 🚀 and spëcial chars & symbols!';
      
      const response = await request(app)
        .post('/api/tasks')
        .send({ text: specialText, date: '2025-11-06' })
        .expect(201);

      expect(response.body.text).toBe(specialText);
    });

    it('should handle different date formats consistently', async () => {
      const dates = ['2025-11-06', '2025-01-01', '2025-12-31'];
      
      for (const date of dates) {
        const response = await request(app)
          .post('/api/tasks')
          .send({ text: `Task for ${date}`, date })
          .expect(201);

        expect(response.body.date).toBe(date);

        // Verify we can retrieve by date
        const getResponse = await request(app)
          .get(`/api/tasks/date/${date}`)
          .expect(200);

        expect(getResponse.body).toHaveLength(1);
        expect(getResponse.body[0].date).toBe(date);
      }
    });
  });

  describe('Concurrent operations', () => {
    it('should handle multiple simultaneous requests', async () => {
      const tasks = Array.from({ length: 10 }, (_, i) => ({
        text: `Concurrent task ${i + 1}`,
        completed: i % 2 === 0,
        date: '2025-11-06'
      }));

      // Create all tasks concurrently
      const createPromises = tasks.map(task =>
        request(app).post('/api/tasks').send(task)
      );

      const responses = await Promise.all(createPromises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all tasks were created
      const getAllResponse = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(getAllResponse.body).toHaveLength(10);
    });
  });
});
