# Task Calendar Development Makefile

.PHONY: help install dev dev-full backend frontend test clean setup

# Default target
help:
	@echo "🚀 Task Calendar Development Commands"
	@echo "===================================="
	@echo "make install     - Install all dependencies"
	@echo "make dev-full    - Run start-dev.sh script (full development)"
	@echo "make dev         - Start both frontend and backend separately"
	@echo "make backend     - Start backend only"
	@echo "make frontend    - Start frontend only"
	@echo "make test        - Run all tests"
	@echo "make test-backend - Run backend tests only"
	@echo "make clean       - Clean all dependencies and build files"
	@echo "make setup       - Initial project setup"
	@echo "make health      - Check if services are running"

# Install dependencies
install:
	@echo "📦 Installing frontend dependencies..."
	npm install
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "✅ All dependencies installed!"

# Run the start-dev.sh script
dev-full:
	@echo "🚀 Starting full development environment..."
	chmod +x start-dev.sh
	./start-dev.sh

# Start development servers separately
dev: install
	@echo "🔧 Starting backend server..."
	cd backend && npm run dev &
	@echo "⏳ Waiting for backend to start..."
	sleep 3
	@echo "🎨 Starting frontend development server..."
	npm start

# Start backend only
backend:
	@echo "🔧 Starting backend server..."
	cd backend && npm run dev

# Start frontend only
frontend:
	@echo "🎨 Starting frontend development server..."
	npm start

# Run tests
test:
	@echo "🧪 Running backend tests..."
	cd backend && npm test
	@echo "✅ All tests passed!"

test-backend:
	@echo "🧪 Running backend tests..."
	cd backend && npm test

# Clean everything
clean:
	@echo "🧹 Cleaning dependencies and build files..."
	rm -rf node_modules
	rm -rf backend/node_modules
	rm -rf dist
	rm -f backend/tasks.db
	@echo "✅ Cleanup complete!"

# Initial setup
setup: clean install
	@echo "🔧 Setting up development environment..."
	chmod +x start-dev.sh
	@echo "✅ Setup complete! Run 'make dev-full' to start development."

# Health check
health:
	@echo "🏥 Checking service health..."
	@curl -f http://localhost:3002/api/health 2>/dev/null && echo "✅ Backend is running" || echo "❌ Backend is not running"
	@curl -f http://localhost:8080 2>/dev/null && echo "✅ Frontend is running" || echo "❌ Frontend is not running"

# Build for production
build: install
	@echo "🏗️ Building for production..."
	npm run build
	@echo "✅ Build complete!"

# Development with logs
dev-logs: install
	@echo "🚀 Starting development with logs..."
	cd backend && npm run dev > ../backend.log 2>&1 &
	npm start > frontend.log 2>&1 &
	@echo "📝 Logs are being written to backend.log and frontend.log"
	@echo "Press Ctrl+C to stop all services"
