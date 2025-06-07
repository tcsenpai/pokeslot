#!/bin/bash

echo "🎰 Pokemon Slot Machine - Docker (Fixed)"
echo "========================================="

# Set environment
export NODE_ENV=production
export PYTHONUNBUFFERED=1

# Ensure data directory exists
mkdir -p /app/data

echo "🔧 Starting backend server..."
python3 backend.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Check if backend process started
sleep 2
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start!"
    echo "Backend log:"
    cat /tmp/backend.log
    exit 1
fi

# Wait and test backend
sleep 3
echo "🔍 Testing backend..."
for i in {1..10}; do
    if curl -s http://localhost:5001/api/leaderboard >/dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    else
        echo "⏳ Waiting for backend... (attempt $i/10)"
        if [ $i -eq 10 ]; then
            echo "❌ Backend failed to respond after 10 attempts"
            echo "Backend log:"
            cat /tmp/backend.log
            exit 1
        fi
        sleep 2
    fi
done

echo "🌐 Starting frontend server..."
python3 server.py > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Check if frontend process started
sleep 2
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start!"
    echo "Frontend log:"
    cat /tmp/frontend.log
    exit 1
fi

# Wait and test frontend
sleep 3
echo "🔍 Testing frontend..."
if curl -s http://localhost:5000 >/dev/null 2>&1; then
    echo "✅ Frontend is ready!"
else
    echo "❌ Frontend failed to respond"
    echo "Frontend log:"
    cat /tmp/frontend.log
    exit 1
fi

echo ""
echo "✅ Both servers are running!"
echo "🌐 Frontend: http://0.0.0.0:5000"
echo "🔧 Backend API: http://0.0.0.0:5001"
echo ""
echo "📊 Server Status:"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "📋 Quick API Test:"
curl -s http://localhost:5001/api/leaderboard || echo "API test failed"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGTERM SIGINT

# Wait for processes
wait