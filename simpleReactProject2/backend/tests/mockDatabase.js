// Mock Database for testing
class MockDatabase {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  async getAllTasks() {
    return Promise.resolve([...this.tasks]);
  }

  async getTasksByDate(date) {
    const filteredTasks = this.tasks.filter(task => task.date === date);
    return Promise.resolve(filteredTasks);
  }

  async createTask(task) {
    const newTask = {
      ...task,
      id: task.id || this.nextId.toString()
    };
    this.tasks.push(newTask);
    this.nextId++;
    return Promise.resolve(newTask);
  }

  async updateTask(id, updates) {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    return Promise.resolve(this.tasks[taskIndex]);
  }

  async deleteTask(id) {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    this.tasks.splice(taskIndex, 1);
    return Promise.resolve({ deleted: true, id });
  }

  async close() {
    // Mock close - no actual database to close
    return Promise.resolve();
  }

  // Helper methods for testing
  reset() {
    this.tasks = [];
    this.nextId = 1;
  }

  seedData(tasks) {
    this.tasks = [...tasks];
    this.nextId = Math.max(...tasks.map(t => parseInt(t.id)), 0) + 1;
  }
}

module.exports = MockDatabase;
