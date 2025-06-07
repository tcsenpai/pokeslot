#!/bin/bash

echo "🩺 Pokemon Slot Machine - Docker Diagnostics"
echo "============================================="

# Check if running in container
if [ -f /.dockerenv ]; then
    echo "✅ Running inside Docker container"
else
    echo "❌ Not running in Docker container"
fi

echo ""
echo "📊 Environment Variables:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "DATABASE_PATH: ${DATABASE_PATH:-'not set'}"

echo ""
echo "🔍 Process Check:"
ps aux | grep python | grep -v grep

echo ""
echo "🌐 Network Check:"
echo "Testing localhost:5000..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200"; then
    echo "✅ Frontend (5000) is responding"
else
    echo "❌ Frontend (5000) is not responding"
fi

echo "Testing localhost:5001..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/leaderboard | grep -q "200"; then
    echo "✅ Backend (5001) is responding"
else
    echo "❌ Backend (5001) is not responding"
fi

echo ""
echo "📁 File System Check:"
echo "Working directory: $(pwd)"
echo "Database file: ${DATABASE_PATH:-pokeslot.db}"
if [ -f "${DATABASE_PATH:-pokeslot.db}" ]; then
    echo "✅ Database file exists"
    ls -la "${DATABASE_PATH:-pokeslot.db}"
else
    echo "❌ Database file not found"
fi

echo ""
echo "🔧 Configuration Test:"
echo "Testing config.js API detection..."
node -e "
const fs = require('fs');
const configContent = fs.readFileSync('config.js', 'utf8');
console.log('Config file loaded successfully');
"

echo ""
echo "🚀 Ready for Pokemon Game Corner!"