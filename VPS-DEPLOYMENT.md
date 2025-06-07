# 🚀 VPS Deployment Guide

## 🎯 **The Issue You're Experiencing**

When accessing your VPS game at `http://your-vps-ip:5000`, the browser tries to make API calls to `localhost:5001` from **your local machine**, not the VPS. This causes 501 errors because your local machine doesn't have the backend running.

## ✅ **Solution Options**

### **Option 1: Nginx Reverse Proxy (Recommended)**

This approach only exposes port 80 and handles all routing internally.

#### **Setup Steps:**
```bash
# 1. Stop current deployment
docker-compose down

# 2. Use nginx configuration
cp docker-compose-nginx.yml docker-compose.yml

# 3. Open only port 80
sudo ufw allow 80
sudo ufw deny 5001  # Ensure 5001 is not exposed

# 4. Start with nginx
docker-compose up -d

# 5. Access at: http://your-vps-ip (port 80)
```

#### **What this does:**
- ✅ Nginx receives all requests on port 80
- ✅ Routes `/` to frontend (port 5000 internally)
- ✅ Routes `/api/*` to backend (port 5001 internally)
- ✅ No ports need to be exposed except 80

---

### **Option 2: Expose Both Ports (Quick Fix)**

If you want to keep using port 5000 directly:

```bash
# Open both ports on VPS
sudo ufw allow 5000
sudo ufw allow 5001

# Restart firewall
sudo ufw reload

# Access at: http://your-vps-ip:5000
```

#### **Security note:** This exposes your backend API directly to the internet.

---

## 🔧 **Current Configuration Matrix**

| Access Method | URL | API Base | Status |
|---------------|-----|----------|---------|
| **Local Docker** | `http://localhost:5000` | `http://localhost:5001/api` | ✅ Works |
| **VPS Direct** | `http://vps-ip:5000` | `http://vps-ip:5001/api` | ❌ Port 5001 blocked |
| **VPS + Nginx** | `http://vps-ip` | `/api` | ✅ Will work |

## 🐳 **Docker Compose Files**

### **For Direct Port Access:**
```yaml
# docker-compose.yml (current)
ports:
  - "5000:5000"  # Frontend
  - "5001:5001"  # Backend - NEEDS firewall open
```

### **For Nginx Reverse Proxy:**
```yaml
# docker-compose-nginx.yml (recommended)
expose:
  - "5000"  # Internal only
  - "5001"  # Internal only
nginx:
  ports:
    - "80:80"  # Only port exposed
```

## 🔍 **Debugging Your Current Setup**

### **Check if ports are open:**
```bash
# On your VPS
sudo ufw status

# Should show:
# 5000                       ALLOW       Anywhere
# 5001                       ALLOW       Anywhere  # <- This might be missing
```

### **Test backend directly:**
```bash
# From your VPS
curl http://localhost:5001/api/leaderboard

# From outside (should work if firewall allows)
curl http://your-vps-ip:5001/api/leaderboard
```

### **Check container logs:**
```bash
docker-compose logs pokeslot
```

## ⚡ **Quick Fix Commands**

### **Option A: Enable port 5001**
```bash
sudo ufw allow 5001
sudo ufw reload
# Now access http://your-vps-ip:5000
```

### **Option B: Switch to nginx**
```bash
docker-compose down
cp docker-compose-nginx.yml docker-compose.yml
sudo ufw allow 80
sudo ufw deny 5001
docker-compose up -d
# Now access http://your-vps-ip
```

## 🛡️ **Security Recommendations**

### **Best Practice (Nginx):**
- ✅ Only port 80/443 exposed
- ✅ Backend API internal only  
- ✅ Rate limiting enabled
- ✅ Security headers
- ✅ SSL ready

### **Quick Fix (Both Ports):**
- ⚠️ Backend API exposed to internet
- ⚠️ More attack surface
- ✅ Simpler setup
- ✅ Works immediately

## 🎮 **Expected Behavior After Fix**

### **With Nginx (Recommended):**
```
Browser → http://your-vps-ip → Nginx → Frontend (5000)
Browser → http://your-vps-ip/api → Nginx → Backend (5001)
```

### **With Both Ports:**
```
Browser → http://your-vps-ip:5000 → Frontend
Browser → http://your-vps-ip:5001/api → Backend  
```

## 🔧 **Configuration Detection**

The game will automatically detect your setup:

```javascript
// Browser console will show:
🔧 Pokemon Slot Machine Config:
   Environment: production
   API Base: /api                    // <- Nginx mode
   API Base: http://vps-ip:5001/api  // <- Direct mode
   Location: http://your-vps-ip/
```

---

**Choose Option 1 (Nginx) for production or Option 2 (Both Ports) for quick testing!** 🎰🚀