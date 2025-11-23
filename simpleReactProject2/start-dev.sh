#!/bin/bash

# Task Calendar Development Startup Script

echo "🚀 Starting Task Calendar Application..."

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🔧 Starting backend server..."
(cd backend && npm run dev) &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🎨 Starting frontend development server..."
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Application started successfully!"
echo "📱 Frontend: http://localhost:8080"
echo "🔌 Backend API: http://localhost:3002"
echo "🏥 Health check: http://localhost:3002/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop the servers
wait
