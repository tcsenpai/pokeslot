# 🎰 Pokemon Game Corner - Slot Machine

A faithful recreation of the classic Pokemon Game Corner slot machine from Generation 2, featuring authentic Game Boy graphics, sound effects, user accounts, and modern web technologies.

![Pokemon Slot Machine](screenshot.png)

## ✨ Features

### 🎮 Authentic Game Experience
- **Gen 2 Pokemon-themed symbols** (Fire, Water, Grass, Electric types + Pokeball + Lucky 7)
- **Authentic Game Boy Color graphics** with pixel-perfect rendering
- **Classic 8-bit sound effects** generated via Web Audio API
- **5 rotating background themes** that change on each visit
- **Animated pixel sprites** including walking Pikachu and floating clouds

### 👤 User System
- **Guest mode** for instant play (100 starting coins)
- **User registration** with persistent accounts
- **Secure login system** with rate limiting
- **Automatic session management** (24-hour sessions)
- **Coin persistence** across sessions for registered users

### 🏆 Social Features
- **Live leaderboards** showing top players
- **Statistics tracking** (total wins, biggest win, total spins)
- **Achievement system** with coin rewards
- **Real-time score updates**

### 📱 Mobile-First Design
- **Responsive design** for all screen sizes (480px+)
- **Touch-optimized controls** (44px+ touch targets)
- **Portrait and landscape support**
- **Performance optimizations** for mobile devices
- **PWA-ready** (can be installed as app)

### 🎨 Game Boy Aesthetics
- **Authentic scanline effects** with realistic LCD flickering
- **Pixel-perfect sprite animations**
- **Classic Game Boy Color palettes**
- **8-bit particle effects** (clouds, sparkles, floating Pokemon)
- **Theme-based visual variations**

## 🚀 Quick Start

### Local Development
```bash
# Clone and navigate to directory
cd pokeslot

# Start the game (requires Python 3)
./start-full-game.sh

# Or manually:
python3 backend.py &    # API server on port 5001
python3 server.py       # Frontend on port 5000
```

Open `http://localhost:5000` in your browser.

### Production Deployment

#### Option 1: Docker (Recommended)
```bash
# Quick start with Docker Compose
docker-compose up -d

# With nginx reverse proxy (for production)
docker-compose --profile with-nginx up -d

# Access the game
# Direct: http://localhost:5000
# With nginx: http://localhost
```

#### Option 2: Direct VPS Deployment
```bash
# For VPS/server deployment
./start-production.sh

# Frontend: http://0.0.0.0:5000
# Backend:  http://0.0.0.0:5001
```

Configure your reverse proxy to route:
- `/` → Frontend (port 5000)
- `/api/*` → Backend (port 5001)

## 🏗️ Architecture

### Frontend Stack
- **Vanilla JavaScript** (ES6+) for maximum compatibility
- **CSS3** with responsive design and animations
- **Web Audio API** for real-time sound generation
- **LocalStorage** for client-side persistence
- **Fetch API** with retry logic and error handling

### Backend Stack
- **Python 3** with built-in HTTP server
- **SQLite** database for user data and sessions
- **RESTful API** with CORS support
- **Session-based authentication**
- **Comprehensive error handling**

### File Structure
```
pokeslot/
├── index.html              # Main HTML file
├── style.css               # Responsive CSS with Game Boy aesthetics
├── config.js               # Environment and feature configuration
├── error-handler.js        # Comprehensive error handling system
├── audio-effects.js        # Web Audio API sound generation
├── gameboy-effects.js      # Visual effects and theme management
├── user-system.js          # Authentication and user management
├── script.js               # Core game logic and slot machine
├── backend.py              # Python API server and database
├── server.py               # Static file server
├── reset-db.py             # Database reset utility
├── start-full-game.sh      # Development script (localhost)
├── start-production.sh     # Production script (VPS ready)
├── Dockerfile              # Docker container configuration
├── docker-compose.yml      # Docker orchestration
├── nginx.conf              # Reverse proxy configuration
├── DOCKER.md               # Docker deployment guide
├── PRODUCTION-CHECKLIST.md # Production deployment checklist
└── README.md               # This file
```

## 🎯 Game Mechanics

### Slot Machine Rules
- **Starting coins:** 100 (for all users)
- **Betting:** 1-3 coins per spin
- **Symbols:** 6 different Pokemon-themed symbols
- **Payouts:** Based on symbol rarity and combinations

### Payout Table
| Combination | Payout | Probability |
|-------------|--------|-------------|
| 🎰 7️⃣7️⃣7️⃣ | 500 coins | 1 in 1,000,000 |
| ⚡⚡⚡ | 200 coins | 1 in 15,625 |
| 🌿🌿🌿 | 80 coins | 1 in 1,000 |
| 💧💧💧 | 60 coins | 1 in 296 |
| 🔥🔥🔥 | 40 coins | 1 in 125 |
| ⚪⚪⚪ | 15 coins | 1 in 8 |

### Special Combinations
- **Any 2 7️⃣:** 25 coins
- **Any 2 ⚡:** 8 coins
- **Any 2 types:** 2-4 coins

## 🔧 Deployment Scripts Explained

### start-full-game.sh (Development)
**Purpose**: Local development and testing
```bash
./start-full-game.sh
```

**Features**:
- 🏠 **Localhost Binding**: Runs on `127.0.0.1` (localhost only)
- 🔍 **Debug Mode**: Detailed console logging and error messages  
- 📊 **Development Info**: Shows detailed startup information
- 🎮 **Feature Display**: Lists all game features and controls
- 🔧 **Hot Reload Friendly**: Easy to stop/restart during development

**Best For**: Developers working on the game locally

### start-production.sh (Production)
**Purpose**: VPS/server deployment
```bash
./start-production.sh
```

**Features**:
- 🌐 **All Interfaces**: Runs on `0.0.0.0` (accessible from any IP)
- 🔒 **Production Mode**: Optimized logging and error handling
- 🔄 **Reverse Proxy Ready**: Configured for nginx/apache frontend
- 📱 **Mobile Optimized**: Emphasizes responsive design features  
- 🚀 **Performance Focused**: Production-ready configuration

**Best For**: VPS hosting, cloud deployment, public servers

### Key Technical Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| **Binding** | `127.0.0.1` (localhost) | `0.0.0.0` (all interfaces) |
| **Access** | Local machine only | Internet accessible |
| **Logging** | Verbose debugging | Production optimized |
| **Use Case** | Development/testing | Live server deployment |
| **Proxy** | Direct access | Reverse proxy ready |

## 🎮 Controls & Easter Eggs

### Keyboard Controls
- **Space/Enter:** Spin the reels
- **B:** Increase bet
- **M:** Max bet
- **↑↑↓↓←→←→BA:** Konami code (+100 coins)
- **THEME:** Cycle through visual themes

### Mobile Controls
- **Touch optimized** buttons with visual feedback
- **Swipe gestures** for navigation
- **Haptic feedback** on supported devices

## 🔧 Configuration

### Environment Configuration
The game automatically detects development vs production environments:

**Development** (`localhost`):
- API Base: `http://localhost:5001/api`
- Debug logging enabled
- Detailed error messages

**Production** (any other domain):
- API Base: `/api` (assumes reverse proxy)
- Minimal logging
- User-friendly error messages

### Feature Flags
Available in `config.js`:
```javascript
enableLeaderboard: true,    // Show/hide leaderboard
enableGuest: true,          // Allow guest play
enableRegistration: true,   // Allow new registrations
audioEnabled: true,         // Enable sound effects
enableAnimations: true      // Enable visual effects
```

## 🛡️ Security Features

### Authentication Security
- **Password hashing** with SHA-256
- **Session-based authentication** with secure tokens
- **Rate limiting** (5 login attempts max)
- **Input validation** and sanitization
- **SQL injection protection**

### Client Security
- **XSS protection** with content sanitization
- **CSRF protection** for state-changing operations
- **Secure session management**
- **Privacy-friendly** (no tracking cookies)

## 📱 Mobile Optimization

### Performance Features
- **Reduced animations** on mobile for better battery life
- **Optimized asset loading** with preloading
- **Efficient DOM manipulation**
- **Hardware-accelerated CSS** animations
- **Memory leak prevention**

### UX Improvements
- **44px minimum** touch targets
- **Visual feedback** for all interactions
- **Loading states** for better perceived performance
- **Offline fallback** when backend unavailable
- **Responsive typography** scaling

## 🔧 Development

### Prerequisites
- **Python 3.7+** for backend
- **Modern web browser** with ES6+ support
- **Optional:** Reverse proxy (nginx/apache) for production

### Development Setup
```bash
# Install dependencies (none required - uses built-in Python)
# Database is auto-created on first run

# Development commands
./start-full-game.sh        # Start both servers
python3 reset-db.py         # Reset database
./start-production.sh       # Production mode
```

### Code Quality
- **ESLint-ready** JavaScript (ES6+ features)
- **Responsive design** with mobile-first approach
- **Accessible HTML** with semantic elements
- **Cross-browser compatibility** (Chrome, Firefox, Safari, Edge)
- **Progressive enhancement** (works without JavaScript for basic functionality)

## 🚀 Deployment

### Docker Deployment (Recommended)

#### Quick Start
```bash
# Clone the repository
git clone <your-repo-url>
cd pokeslot

# Start with Docker Compose
docker-compose up -d

# Access the game at http://localhost:5000
```

#### Production with Nginx
```bash
# For production VPS with reverse proxy
docker-compose --profile with-nginx up -d

# Access at http://your-domain.com (port 80)
# Backend API: http://your-domain.com/api
```

#### Docker Configuration Features
- ✅ **Persistent Database**: SQLite data survives restarts
- ✅ **Health Checks**: Automatic monitoring and restart
- ✅ **Security**: Non-root user, rate limiting, security headers
- ✅ **Performance**: Gzip compression, asset caching
- ✅ **SSL Ready**: Uncomment HTTPS block in nginx.conf

For complete Docker documentation, see [`DOCKER.md`](DOCKER.md)

### VPS/Cloud Deployment (Direct)
1. **Copy files** to your server
2. **Configure reverse proxy** (see `PRODUCTION-CHECKLIST.md`)
3. **Update API base URL** in `config.js` if needed
4. **Run** `./start-production.sh`
5. **Set up SSL** certificate (recommended)

### Systemd Service
```ini
[Unit]
Description=Pokemon Slot Machine
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/pokeslot
ExecStart=/path/to/pokeslot/start-production.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

## 🐛 Troubleshooting

### Common Issues

**🔊 No Sound:**
- Click anywhere to enable audio (browser requirement)
- Check browser audio permissions
- Verify `audioEnabled: true` in config

**📱 Mobile Issues:**
- Ensure viewport meta tag is present
- Check for 44px minimum touch targets
- Verify CSS `touch-action` properties

**🔌 Connection Errors:**
- Check backend server is running on port 5001
- Verify firewall allows ports 5000/5001
- Check API base URL in config

**💾 Database Issues:**
- Run `python3 reset-db.py` to reset database
- Check file permissions on `pokeslot.db`
- Ensure SQLite3 is available

### Debug Mode
Enable debug logging in browser console:
```javascript
window.gameConfig.set('enableConsoleLogging', true);
window.gameConfig.set('debug', true);
```

## 📊 Performance Metrics

### Lighthouse Scores (Target)
- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 90+
- **SEO:** 90+

### Loading Benchmarks
- **First Paint:** < 1.5s
- **Interactive:** < 3s
- **First Input Delay:** < 100ms

## 🤝 Contributing

### Code Style
- **2-space indentation** for JavaScript
- **camelCase** for variables and functions
- **PascalCase** for classes
- **Descriptive naming** for variables and functions

### Commit Messages
- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes
- **refactor:** Code refactoring
- **test:** Test additions
- **chore:** Maintenance tasks

## 📄 License

This project is for educational and entertainment purposes. Pokemon is a trademark of Nintendo/Game Freak/Creatures Inc. This project is not affiliated with or endorsed by Nintendo.

## 🎉 Acknowledgments

- **Nintendo/Game Freak** for the original Pokemon Game Corner
- **Game Boy Color** for the authentic retro aesthetic
- **Web Audio API** for real-time sound generation
- **Modern web standards** for making this possible

---

**Ready to become the ultimate Pokemon slot machine champion? Start spinning and catch 'em all! 🎰⚡**