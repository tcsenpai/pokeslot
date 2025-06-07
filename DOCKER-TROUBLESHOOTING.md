# 🔧 Docker Troubleshooting Guide

## 🚨 Common Issue: API POST 501 Errors

### **Problem**:
```
code 501, message Unsupported method ('POST')
"POST /api/guest HTTP/1.1" 501 -
Auto-guest failed: SyntaxError: JSON.parse: unexpected character
```

### **Root Cause**:
API requests are hitting the frontend server (port 5000) instead of the backend server (port 5001).

### **Solutions**:

#### **Option 1: Rebuild with Fixed Configuration**
```bash
# Stop current containers
docker-compose down

# Rebuild with latest fixes
docker-compose build --no-cache

# Start with proper configuration
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### **Option 2: Direct Port Access (Testing)**
```bash
# Access the game directly on port 5000
http://localhost:5000

# API should auto-detect and use port 5001
# Check browser console for config logs
```

#### **Option 3: With Nginx Reverse Proxy**
```bash
# Start with nginx profile for proper routing
docker-compose --profile with-nginx up -d

# Access via port 80
http://localhost
```

## 🔍 Diagnostic Steps

### **1. Check Container Status**
```bash
docker-compose ps
docker-compose logs pokeslot
```

### **2. Test API Endpoints Manually**
```bash
# Test backend directly
curl http://localhost:5001/api/leaderboard

# Test frontend
curl http://localhost:5000
```

### **3. Execute Diagnostic Script**
```bash
docker-compose exec pokeslot bash /app/diagnose-docker.sh
```

### **4. Check Environment Variables**
```bash
docker-compose exec pokeslot env | grep -E "(NODE_ENV|DATABASE)"
```

## 🐛 Debug Mode

### **Enable Debug Logging**
Open browser console and run:
```javascript
window.gameConfig.set('enableConsoleLogging', true);
window.gameConfig.set('debug', true);
location.reload();
```

### **Check API Detection**
Look for logs like:
```
🔧 Pokemon Slot Machine Config:
   Environment: production
   API Base: http://localhost:5001/api
   Location: http://localhost:5000/
```

## 🔧 Configuration Matrix

| Scenario | Frontend URL | Backend URL | API Base |
|----------|-------------|-------------|----------|
| Docker Direct | `http://localhost:5000` | `http://localhost:5001` | `http://localhost:5001/api` |
| Nginx Proxy | `http://localhost` | Internal routing | `/api` |
| Development | `http://localhost:5000` | `http://localhost:5001` | `http://localhost:5001/api` |

## 🚀 Quick Fixes

### **Fix 1: Restart with Clean State**
```bash
docker-compose down
docker volume prune -f
docker-compose up --build -d
```

### **Fix 2: Manual Server Test**
```bash
# Enter container
docker-compose exec pokeslot bash

# Start backend manually
NODE_ENV=production python3 backend.py &

# Test it
curl http://localhost:5001/api/leaderboard

# Start frontend
NODE_ENV=production python3 server.py &
```

### **Fix 3: Check Database Setup**
```bash
# Check database location
docker-compose exec pokeslot ls -la /app/data/

# Check database file
docker-compose exec pokeslot sqlite3 /app/data/pokeslot.db ".tables"
```

## 📊 Health Check Commands

### **Container Health**
```bash
# Overall health
docker-compose ps

# Individual service health
docker-compose exec pokeslot curl -f http://localhost:5000
docker-compose exec pokeslot curl -f http://localhost:5001/api/leaderboard
```

### **Network Connectivity**
```bash
# Check internal networking
docker network ls
docker network inspect pokeslot_pokeslot_network
```

## 🔄 Complete Reset

If all else fails, complete reset:
```bash
# Stop everything
docker-compose down

# Remove volumes and images
docker volume rm pokeslot_pokeslot_data
docker rmi pokeslot_pokeslot

# Clean rebuild
docker-compose build --no-cache
docker-compose up -d

# Monitor startup
docker-compose logs -f
```

## ✅ Success Indicators

When working correctly, you should see:
```
✅ Backend is ready!
✅ Frontend is ready!
🎮 Game accessible at http://localhost:5000
🔧 API responding at http://localhost:5001/api
```

## 🆘 Still Not Working?

1. **Check Browser Console**: Look for API detection logs
2. **Verify Network**: Ensure both ports 5000/5001 are accessible
3. **Test Direct Backend**: `curl http://localhost:5001/api/leaderboard`
4. **Check Docker Logs**: `docker-compose logs pokeslot`
5. **Try Development Mode**: `./start-full-game.sh` to isolate Docker issues

---

**🎰 Your Pokemon Game Corner should now work perfectly in Docker! 🐳**