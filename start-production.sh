#!/bin/bash

echo "🎰 Starting Pokemon Slot Machine - Production Mode"
echo "📡 Configured for VPS hosting with reverse proxy support"

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping production servers..."
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
python3 -c "
import sys
sys.path.append('.')
from backend import *

# Modify for production
def main():
    print('🎰 Pokemon Slot Machine Backend - Production Mode')
    db = GameDatabase()
    
    # Bind to all interfaces for VPS
    server = HTTPServer(('0.0.0.0', 5001), create_handler(db))
    
    print('🔧 Backend API running on http://0.0.0.0:5001')
    print('🌐 Ready for reverse proxy configuration')
    print('📊 Database: SQLite with user stats and sessions')
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n👋 Backend server stopped!')
        server.shutdown()

if __name__ == '__main__':
    main()
" &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

echo "🌐 Starting frontend server on 0.0.0.0:5000..."
python3 -c "
import http.server
import socketserver
import os
import sys

PORT = 5000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)

def main():
    try:
        # Bind to all interfaces for VPS
        with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
            print(f'🎮 Frontend server running on http://0.0.0.0:{PORT}')
            print(f'📁 Serving files from: {os.getcwd()}')
            print(f'🔄 Ready for reverse proxy on port {PORT}')
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n👋 Frontend server stopped!')
        sys.exit(0)
    except OSError:
        print(f'❌ Port {PORT} is already in use.')
        sys.exit(1)

if __name__ == '__main__':
    main()
" &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running in production mode!"
echo "🌐 Frontend: http://0.0.0.0:5000"
echo "🔧 Backend API: http://0.0.0.0:5001"
echo ""
echo "🔄 Configure your reverse proxy to:"
echo "   - Route '/' to frontend (port 5000)" 
echo "   - Route '/api/*' to backend (port 5001)"
echo ""
echo "📱 Mobile-optimized features:"
echo "   - Responsive design for all screen sizes"
echo "   - Touch-friendly controls (44px+ buttons)"
echo "   - Optimized animations for mobile performance"
echo "   - Portrait & landscape orientation support"
echo ""
echo "🎮 Game features:"
echo "   - 5 rotating Gen 2 Pokemon backgrounds"
echo "   - Authentic Game Boy graphics & animations"
echo "   - User accounts with persistent coin saving"
echo "   - Live leaderboards and statistics"
echo "   - Guest mode for instant play"
echo ""
echo "🔒 Press Ctrl+C to stop both servers"

# Wait for background processes
wait