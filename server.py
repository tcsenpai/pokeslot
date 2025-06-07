#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 5000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.realpath(__file__)), **kwargs)

def main():
    # Determine if running in production mode (Docker/VPS)
    is_production = os.environ.get('NODE_ENV') == 'production' or '0.0.0.0' in sys.argv
    
    # Choose binding interface
    host = "0.0.0.0" if is_production else ""
    
    try:
        with socketserver.TCPServer((host, PORT), Handler) as httpd:
            if is_production:
                print(f"🎰 Pokemon Slot Machine Frontend - Production Mode")
                print(f"🌐 Serving on: http://{host}:{PORT}")
                print(f"📁 Files from: {os.getcwd()}")
                print(f"🔄 Ready for reverse proxy configuration")
            else:
                print(f"🎰 Pokemon Slot Machine Server starting...")
                print(f"🌐 Open your browser to: http://localhost:{PORT}")
                print(f"🎮 Press Ctrl+C to stop the server")
                print(f"📁 Serving files from: {os.path.dirname(os.path.realpath(__file__))}")
                
                # Try to open browser automatically (development only)
                try:
                    webbrowser.open(f'http://localhost:{PORT}')
                    print("🚀 Browser should open automatically!")
                except:
                    print("💡 Please open the URL manually in your browser")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Thanks for playing!")
        sys.exit(0)
    except OSError:
        print(f"❌ Port {PORT} is already in use. Try a different port or kill the existing process.")
        sys.exit(1)

if __name__ == "__main__":
    main()
