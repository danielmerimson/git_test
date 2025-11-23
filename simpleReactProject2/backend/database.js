const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.initializeDatabase();
      }
    });
  }

  initializeDatabase() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT 0,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Tasks table ready');
      }
    });
  }

  getAllTasks() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM tasks ORDER BY date DESC, created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Convert completed from 0/1 to boolean
          const tasks = rows.map(row => ({
            ...row,
            completed: Boolean(row.completed)
          }));
          resolve(tasks);
        }
      });
    });
  }

  getTasksByDate(date) {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM tasks WHERE date = ? ORDER BY created_at DESC', [date], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const tasks = rows.map(row => ({
            ...row,
            completed: Boolean(row.completed)
          }));
          resolve(tasks);
        }
      });
    });
  }

  createTask(task) {
    return new Promise((resolve, reject) => {
      const { id, text, completed, date } = task;
      const query = 'INSERT INTO tasks (id, text, completed, date) VALUES (?, ?, ?, ?)';
      
      this.db.run(query, [id, text, completed ? 1 : 0, date], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, text, completed, date });
        }
      });
    });
  }

  updateTask(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (updates.text !== undefined) {
        fields.push('text = ?');
        values.push(updates.text);
      }
      if (updates.completed !== undefined) {
        fields.push('completed = ?');
        values.push(updates.completed ? 1 : 0);
      }
      if (updates.date !== undefined) {
        fields.push('date = ?');
        values.push(updates.date);
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;

      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Task not found'));
        } else {
          resolve({ id, ...updates });
        }
      });
    });
  }

  deleteTask(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Task not found'));
        } else {
          resolve({ deleted: true, id });
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

module.exports = Database;
