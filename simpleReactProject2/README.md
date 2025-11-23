# Task Calendar Application

A full-stack task management application with a calendar interface built with React (frontend) and Node.js/Express (backend).

## Features

- 📅 Interactive calendar interface
- ✅ Task management (add, toggle, delete)
- 📊 Date-specific task organization
- 💾 Persistent data storage with SQLite
- 🔄 Real-time updates between frontend and backend

## Project Structure

```
simpleReactProject/
├── src/                    # React frontend
│   ├── components/
│   │   ├── Calendar.tsx
│   │   └── TaskList.tsx
│   ├── services/
│   │   └── api.ts         # API service layer
│   └── App.tsx
├── backend/               # Node.js/Express backend
│   ├── server.js         # Main server file
│   ├── database.js       # SQLite database layer
│   └── package.json      # Backend dependencies
└── package.json          # Frontend dependencies
```

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:3002`

### 4. Start the Frontend Development Server

In a new terminal, from the project root:

```bash
npm start
```

The frontend will start on `http://localhost:8080`

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/health` - Health check
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/date/:date` - Get tasks for a specific date
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion
- `DELETE /api/tasks/:id` - Delete a task

## Database

The application uses SQLite for data persistence. The database file (`tasks.db`) is automatically created in the `backend/` directory when you first start the server.

### Task Schema

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Technologies Used

### Frontend
- React 18
- TypeScript
- Webpack
- CSS3

### Backend
- Node.js
- Express.js
- SQLite3
- CORS

## Development

### Frontend Development
```bash
npm run dev    # Start with auto-open browser
npm start      # Start development server
npm run build  # Build for production
```

### Backend Development
```bash
cd backend
npm run dev    # Start with nodemon (auto-restart)
npm start      # Start production server
```

## Error Handling

The application includes comprehensive error handling:
- API request failures are caught and displayed to users
- Database errors are logged and handled gracefully
- Network connectivity issues show retry options
- Loading states provide user feedback

## Future Enhancements

- User authentication and authorization
- Task categories and tags
- Recurring tasks
- Task reminders and notifications
- Export/import functionality
- Mobile responsive design improvements
