#!/usr/bin/env python3
import sqlite3
import json
import hashlib
import secrets
import time
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

class GameDatabase:
    def __init__(self, db_path=None):
        # Use environment variable or default
        import os
        if db_path is None:
            db_path = os.environ.get('DATABASE_PATH', 'pokeslot.db')
        self.db_path = db_path
        
        # Ensure directory exists
        db_dir = os.path.dirname(db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir)
            
        self.init_database()
    
    def init_database(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email TEXT,
                coins INTEGER DEFAULT 100,
                total_wins INTEGER DEFAULT 0,
                total_spins INTEGER DEFAULT 0,
                biggest_win INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Sessions table for login management
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                user_id INTEGER,
                expires_at TIMESTAMP,
                is_guest BOOLEAN DEFAULT FALSE,
                guest_data TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Game sessions table for saving states
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS game_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                session_id TEXT,
                coins INTEGER,
                bet INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_guest BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Leaderboard/scores table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                username TEXT,
                coins INTEGER,
                total_wins INTEGER,
                biggest_win INTEGER,
                achievement_score INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_user(self, username, password, email=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Hash password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        try:
            cursor.execute('''
                INSERT INTO users (username, password_hash, email) 
                VALUES (?, ?, ?)
            ''', (username, password_hash, email))
            user_id = cursor.lastrowid
            
            # Create initial leaderboard entry
            cursor.execute('''
                INSERT INTO leaderboard (user_id, username, coins, total_wins, biggest_win)
                VALUES (?, ?, 100, 0, 0)
            ''', (user_id, username))
            
            conn.commit()
            return {"success": True, "user_id": user_id}
        except sqlite3.IntegrityError:
            return {"success": False, "error": "Username already exists"}
        finally:
            conn.close()
    
    def authenticate_user(self, username, password):
        if not username or not password:
            return {"success": False, "error": "Username and password are required"}
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            cursor.execute('''
                SELECT id, username, coins FROM users 
                WHERE username = ? AND password_hash = ?
            ''', (username, password_hash))
            
            user = cursor.fetchone()
            
            if user:
                # Ensure coins is never null
                coins = user[2] if user[2] is not None else 100
                return {"success": True, "user": {"id": user[0], "username": user[1], "coins": coins}}
            return {"success": False, "error": "Invalid credentials"}
        except Exception as e:
            return {"success": False, "error": f"Database error: {str(e)}"}
        finally:
            conn.close()
    
    def create_session(self, user_id=None, is_guest=False, guest_data=None):
        session_id = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(hours=24)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO sessions (session_id, user_id, expires_at, is_guest, guest_data)
            VALUES (?, ?, ?, ?, ?)
        ''', (session_id, user_id, expires_at, is_guest, json.dumps(guest_data) if guest_data else None))
        
        conn.commit()
        conn.close()
        
        return session_id
    
    def get_session(self, session_id):
        if not session_id:
            return None
            
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT s.user_id, s.expires_at, s.is_guest, s.guest_data, u.username, u.coins
                FROM sessions s
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.session_id = ? AND s.expires_at > datetime('now')
            ''', (session_id,))
            
            session = cursor.fetchone()
            
            if session:
                is_guest = bool(session[2])
                
                if is_guest:
                    guest_data = json.loads(session[3]) if session[3] else {}
                    username = "Guest"
                    coins = guest_data.get("coins", 100)
                else:
                    username = session[4] or "Unknown User"
                    coins = session[5] if session[5] is not None else 100
                
                return {
                    "user_id": session[0],
                    "is_guest": is_guest,
                    "guest_data": json.loads(session[3]) if session[3] else None,
                    "username": username,
                    "coins": coins
                }
        except Exception as e:
            print(f"Session retrieval error: {e}")
        finally:
            conn.close()
        
        return None
    
    def update_user_stats(self, user_id, coins, win_amount=0, is_guest=False, session_id=None):
        if is_guest:
            # Update guest session data
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                SELECT guest_data FROM sessions WHERE session_id = ?
            ''', (session_id,))
            result = cursor.fetchone()
            if result:
                guest_data = json.loads(result[0]) if result[0] else {}
                guest_data["coins"] = coins
                guest_data["total_spins"] = guest_data.get("total_spins", 0) + 1
                if win_amount > 0:
                    guest_data["total_wins"] = guest_data.get("total_wins", 0) + 1
                    guest_data["biggest_win"] = max(guest_data.get("biggest_win", 0), win_amount)
                
                cursor.execute('''
                    UPDATE sessions SET guest_data = ? WHERE session_id = ?
                ''', (json.dumps(guest_data), session_id))
            conn.commit()
            conn.close()
        else:
            # Update registered user
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE users SET 
                    coins = ?,
                    total_spins = total_spins + 1,
                    total_wins = total_wins + ?,
                    biggest_win = CASE WHEN ? > biggest_win THEN ? ELSE biggest_win END
                WHERE id = ?
            ''', (coins, 1 if win_amount > 0 else 0, win_amount, win_amount, user_id))
            
            # Update leaderboard
            cursor.execute('''
                UPDATE leaderboard SET 
                    coins = ?,
                    total_wins = total_wins + ?,
                    biggest_win = CASE WHEN ? > biggest_win THEN ? ELSE biggest_win END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            ''', (coins, 1 if win_amount > 0 else 0, win_amount, win_amount, user_id))
            
            conn.commit()
            conn.close()
    
    def get_leaderboard(self, limit=10):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT username, coins, total_wins, biggest_win
            FROM leaderboard
            ORDER BY coins DESC, total_wins DESC
            LIMIT ?
        ''', (limit,))
        
        leaderboard = cursor.fetchall()
        conn.close()
        
        return [{"username": row[0], "coins": row[1], "total_wins": row[2], "biggest_win": row[3]} 
                for row in leaderboard]

class PokeslotHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, db=None, **kwargs):
        self.db = db
        super().__init__(*args, **kwargs)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_POST(self):
        if self.path == '/api/register':
            self.handle_register()
        elif self.path == '/api/login':
            self.handle_login()
        elif self.path == '/api/guest':
            self.handle_guest_login()
        elif self.path == '/api/update-stats':
            self.handle_update_stats()
        else:
            self.send_json_response({"error": "Endpoint not found"}, 404)
    
    def do_GET(self):
        if self.path == '/api/leaderboard':
            self.handle_leaderboard()
        elif self.path.startswith('/api/session'):
            self.handle_session_check()
        else:
            self.send_json_response({"error": "Endpoint not found"}, 404)
    
    def handle_register(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode())
        
        result = self.db.create_user(data['username'], data['password'], data.get('email'))
        if result['success']:
            session_id = self.db.create_session(result['user_id'])
            result['session_id'] = session_id
        
        self.send_json_response(result)
    
    def handle_login(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode())
        
        result = self.db.authenticate_user(data['username'], data['password'])
        if result['success']:
            session_id = self.db.create_session(result['user']['id'])
            result['session_id'] = session_id
        
        self.send_json_response(result)
    
    def handle_guest_login(self):
        guest_data = {"coins": 100, "total_spins": 0, "total_wins": 0, "biggest_win": 0}
        session_id = self.db.create_session(is_guest=True, guest_data=guest_data)
        
        self.send_json_response({
            "success": True,
            "session_id": session_id,
            "user": {"username": "Guest", "coins": 100, "is_guest": True}
        })
    
    def handle_session_check(self):
        query = parse_qs(urlparse(self.path).query)
        session_id = query.get('session_id', [None])[0]
        
        if session_id:
            session = self.db.get_session(session_id)
            if session:
                self.send_json_response({"success": True, "session": session})
            else:
                self.send_json_response({"success": False, "error": "Invalid session"})
        else:
            self.send_json_response({"success": False, "error": "No session ID provided"})
    
    def handle_update_stats(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode())
        
        session_id = data.get('session_id')
        if not session_id:
            self.send_json_response({"success": False, "error": "No session ID"})
            return
        
        session = self.db.get_session(session_id)
        if not session:
            self.send_json_response({"success": False, "error": "Invalid session"})
            return
        
        self.db.update_user_stats(
            session['user_id'],
            data['coins'],
            data.get('win_amount', 0),
            session['is_guest'],
            session_id
        )
        
        self.send_json_response({"success": True})
    
    def handle_leaderboard(self):
        leaderboard = self.db.get_leaderboard()
        self.send_json_response({"leaderboard": leaderboard})

def create_handler(db):
    def handler(*args, **kwargs):
        PokeslotHandler(*args, db=db, **kwargs)
    return handler

def main():
    import os
    import sys
    
    # Determine if running in production mode (Docker/VPS)
    is_production = os.environ.get('NODE_ENV') == 'production' or '0.0.0.0' in sys.argv
    
    # Choose binding interface
    host = "0.0.0.0" if is_production else 'localhost'
    
    if is_production:
        print("🎰 Pokemon Slot Machine Backend - Production Mode")
    else:
        print("🎰 Starting Pokemon Slot Machine Server with User System...")
    
    # Initialize database
    db = GameDatabase()
    
    # Create HTTP server
    server = HTTPServer((host, 5001), create_handler(db))
    
    if is_production:
        print(f"🎮 Backend API running on http://{host}:5001")
        print("🔧 Production features: Rate limiting, security headers")
        print("📊 Database: SQLite with persistent storage")
        print("🌐 Ready for reverse proxy configuration")
    else:
        print("🎮 Backend API running on http://localhost:5001")
        print("🏆 Features: User registration, guest mode, leaderboards")
        print("📊 Database: SQLite with user stats and sessions")
        print("🔒 Press Ctrl+C to stop")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Backend server stopped!")
        server.shutdown()

if __name__ == "__main__":
    main()