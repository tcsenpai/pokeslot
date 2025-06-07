#!/bin/bash

echo "🎰 Starting Pokemon Slot Machine with Full User System..."
echo "🎮 This will start both frontend and backend servers"

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping servers..."
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

echo "🚀 Starting backend server (API + Database)..."
python3 backend.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

echo "🌐 Starting frontend server..."
python3 server.py &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "🎮 Game URL: http://localhost:5000"
echo "🔧 Backend API: http://localhost:5001"
echo ""
echo "🎰 Features Available:"
echo "   - User registration and login"
echo "   - Guest mode for quick play"
echo "   - Persistent coin saving"
echo "   - Live leaderboards"
echo "   - Achievement tracking"
echo ""
echo "🎯 Pokemon-themed symbols:"
echo "   🔥 Fire Type    💧 Water Type    🌿 Grass Type"
echo "   ⚡ Electric     ⚪ Pokeball      7️⃣ Lucky Seven"
echo ""
echo "🏆 Balanced Payouts:"
echo "   Triple 7️⃣ = 500 coins (MEGA JACKPOT!)"
echo "   Triple ⚡ = 200 coins (LEGENDARY!)"
echo "   Triple 🌿💧🔥 = 40-80 coins each"
echo "   Starting coins: 100 (challenging but fair!)"
echo ""
echo "📊 To view database:"
echo "   sqlite3 pokeslot.db"
echo ""
echo "🔒 Press Ctrl+C to stop both servers"

# Wait for background processes
wait