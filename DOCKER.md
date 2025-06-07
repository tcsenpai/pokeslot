# 🐳 Pokemon Game Corner - Docker Deployment

## 🚀 Quick Start with Docker

### Simple Docker Run
```bash
# Build and run directly
docker build -t pokeslot .
docker run -p 5000:5000 -p 5001:5001 -e NODE_ENV=production pokeslot
```

### Docker Compose (Recommended)
```bash
# Start the game with persistent database
docker-compose up -d

# Or with nginx reverse proxy
docker-compose --profile with-nginx up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🎯 Access the Game
- **Direct Access:** http://localhost:5000
- **With Nginx:** http://localhost (port 80)
- **API Endpoint:** http://localhost:5001/api

## 📁 What's Included

### Docker Configuration
- **Dockerfile**: Production-ready Python 3.9 slim image
- **docker-compose.yml**: Multi-service orchestration
- **nginx.conf**: Reverse proxy with security headers
- **.dockerignore**: Optimized build context

### Features
- ✅ **Persistent Database**: SQLite data survives container restarts
- ✅ **Health Checks**: Automatic service monitoring
- ✅ **Security**: Non-root user, security headers
- ✅ **Performance**: Gzip compression, caching, rate limiting
- ✅ **Scalability**: Ready for production deployment

## 🔧 Configuration Options

### Environment Variables
```yaml
environment:
  - NODE_ENV=production
  - DATABASE_PATH=/app/data/pokeslot.db
  - SESSION_SECRET=your-secret-key
  - LOG_LEVEL=info
```

### Volume Mounts
```yaml
volumes:
  - pokeslot_data:/app/data  # Persistent database
  - ./ssl:/etc/nginx/ssl:ro  # SSL certificates
```

## 🛡️ Production Security

### Built-in Security Features
- **Rate Limiting**: API (10 req/s), Login (5 req/min)
- **Security Headers**: XSS protection, CSRF prevention
- **Non-root Container**: Runs as user `pokeslot` (UID 1000)
- **Health Monitoring**: Automatic restart on failures

### SSL Configuration
1. Place certificates in `./ssl/` directory
2. Uncomment HTTPS server block in `nginx.conf`
3. Update server_name to your domain
4. Run with nginx profile

## 📊 Monitoring & Logs

### View Application Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f pokeslot
docker-compose logs -f nginx
```

### Health Check Status
```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost/health
```

## 🔄 Updates & Maintenance

### Update Application
```bash
# Rebuild with latest code
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Backup
```bash
# Backup database
docker-compose exec pokeslot cp /app/data/pokeslot.db /app/backup.db

# Copy to host
docker cp $(docker-compose ps -q pokeslot):/app/backup.db ./pokeslot_backup.db
```

### Database Reset
```bash
# Reset database (careful - loses all data!)
docker-compose down
docker volume rm pokeslot_pokeslot_data
docker-compose up -d
```

## 🎮 Development vs Production

### Development (start-full-game.sh)
- Runs on `localhost` (127.0.0.1)
- Debug logging enabled
- Hot reloading for development
- Direct port access (5000, 5001)

### Production (Docker/start-production.sh)
- Runs on `0.0.0.0` (all interfaces)
- Optimized for VPS/cloud deployment
- Reverse proxy ready
- Security headers and rate limiting
- Persistent data volumes

## 🌐 Deployment Examples

### Local Development
```bash
./start-full-game.sh
# Game: http://localhost:5000
```

### Docker Local
```bash
docker-compose up
# Game: http://localhost:5000
```

### Production VPS
```bash
# With nginx reverse proxy
docker-compose --profile with-nginx up -d
# Game: http://your-domain.com
```

## 🛠️ Troubleshooting

### Port Conflicts
```bash
# Check if ports are in use
netstat -tulpn | grep :5000
netstat -tulpn | grep :5001

# Use different ports
docker-compose -f docker-compose.yml up --scale pokeslot=1 -p 8000:5000 -p 8001:5001
```

### Database Issues
```bash
# Check database file permissions
docker-compose exec pokeslot ls -la /app/data/

# Reset if corrupted
docker-compose down
docker volume rm pokeslot_pokeslot_data
docker-compose up -d
```

### Memory Issues
```bash
# Monitor container resources
docker stats

# Limit memory usage
docker-compose up -m 512m
```

---

**🎰 Your Pokemon Game Corner is now containerized and production-ready! 🐳**