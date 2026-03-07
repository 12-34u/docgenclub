#!/bin/bash

# DocGen Club - Quick Start Script
# This script helps you quickly start both frontend and backend

echo "🚀 Starting DocGen Club v1.0..."

# Check if running in correct directory
if [ ! -d "my-app" ] || [ ! -d "server" ]; then
    echo "❌ Error: Please run this script from the docgenclub root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Check for environment files
echo "🔍 Checking environment configuration..."

if [ ! -f "server/.env" ]; then
    echo "⚠️  Warning: server/.env not found"
    echo "   Creating from .env.example..."
    if [ -f "server/.env.example" ]; then
        cp server/.env.example server/.env
        echo "   ⚠️  Please edit server/.env and add your GEMINI_API_KEY"
        echo "   Press Enter after you've updated the API key..."
        read
    else
        echo "❌ Error: server/.env.example not found"
        exit 1
    fi
fi

if [ ! -f "my-app/.env" ]; then
    echo "⚠️  Warning: my-app/.env not found"
    echo "   Creating from .env.example..."
    if [ -f "my-app/.env.example" ]; then
        cp my-app/.env.example my-app/.env
        echo "   ✅ Created my-app/.env"
    fi
fi

# Setup backend
echo ""
echo "🐍 Setting up backend..."
cd server

if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

echo "   Activating virtual environment..."
source venv/bin/activate

echo "   Installing dependencies..."
pip install -q -r requirements.txt

echo "   ✅ Backend setup complete!"

# Start backend in background
echo "   Starting backend server..."
python main.py &
BACKEND_PID=$!

echo "   ✅ Backend running on http://localhost:3001 (PID: $BACKEND_PID)"

# Setup and start frontend
cd ../my-app

echo ""
echo "⚛️  Setting up frontend..."

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

echo "   ✅ Frontend setup complete!"
echo "   Starting frontend server..."

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "   🎉 DocGen Club v1.0 is starting!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "   📱 Frontend: http://localhost:5173"
echo "   🔌 Backend:  http://localhost:3001"
echo "   📊 Health:   http://localhost:3001/health"
echo ""
echo "   Press Ctrl+C to stop both servers"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Trap Ctrl+C to kill both processes
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID 2>/dev/null; exit 0" INT TERM

# Start frontend (this will keep the script running)
npm run dev

# If we get here, npm dev exited, so clean up backend
kill $BACKEND_PID 2>/dev/null
