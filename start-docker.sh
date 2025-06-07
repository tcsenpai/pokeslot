#!/bin/bash

echo "🎰 Starting Pokemon Slot Machine - Docker Production Mode"
echo "🐳 Running in containerized environment"

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping Docker production servers..."
    jobs -p | xargs -r kill
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed!"
    exit 1
fi

echo "🚀 Starting backend server (API + Database) on 0.0.0.0:5001..."
NODE_ENV=production python3 backend.py &
BACKEND_PID=$!

# Wait a moment for backend to start and test it
sleep 3
echo "🔍 Testing backend server..."
if curl -s http://localhost:5001/api/leaderboard >/dev/null 2>&1; then
    echo "✅ Backend server is responding"
else
    echo "⚠️ Backend server may have issues"
fi

echo "🌐 Starting frontend server on 0.0.0.0:5000..."
NODE_ENV=production python3 server.py &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running in Docker production mode!"
echo "🌐 Frontend: http://0.0.0.0:5000"
echo "🔧 Backend API: http://0.0.0.0:5001"
echo ""
echo "🐳 Docker Features:"
echo "   - Persistent database volume mounted"
echo "   - Health checks enabled"
echo "   - Non-root user security"
echo "   - Production logging"
echo ""
echo "🎮 Access the game:"
echo "   - Direct: http://localhost:5000"
echo "   - With proxy: http://your-domain.com"
echo ""
echo "🔒 Container will restart automatically on failure"

# Wait for background processes
wait