#!/bin/bash

# BookIt Platform - Quick Start Script

echo "🚀 Starting BookIt Platform..."
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Start backend
echo "📦 Starting Backend Server..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

echo "🔧 Starting FastAPI server on http://localhost:8000"
uvicorn app.main:app --reload &
BACKEND_PID=$!

# Start frontend
echo ""
echo "📦 Starting Frontend Server..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
fi

echo "🔧 Starting Vite dev server on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "📝 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🧪 Test the authentication:"
echo "   1. Register: http://localhost:5173/register"
echo "   2. Login: http://localhost:5173/login"
echo "   3. Dashboard: http://localhost:5173/dashboard (protected)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
