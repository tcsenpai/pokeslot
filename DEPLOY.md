# 🚀 Pokemon Game Corner - Simple VPS Deployment

## ✅ **Ready for Your VPS (Port 5000)**

Your Pokemon Game Corner is now configured to run with **Nginx on port 5000** since your ports 80 and 443 are busy.

## 🎯 **Deploy on VPS**

### **Step 1: Upload files**
```bash
scp -r pokeslot/ user@your-vps-ip:/home/user/
```

### **Step 2: SSH and deploy**
```bash
ssh user@your-vps-ip
cd pokeslot
docker-compose up --build -d
```

### **Step 3: Access your game**
```
http://your-vps-ip:5000
```

## 🔧 **What happens**

- ✅ **Nginx** serves on port 5000
- ✅ **Frontend** at `http://your-vps-ip:5000/`
- ✅ **API** at `http://your-vps-ip:5000/api/`
- ✅ **Backend** stays internal (not exposed)
- ✅ **Only port 5000** needs to be open in firewall

## 📊 **Check if it's working**
```bash
# Container status
docker-compose ps

# Logs
docker-compose logs -f

# Health check
curl http://localhost:5000/health
```

## 🎮 **Features**
- Pokemon-themed slot machine
- User registration and login
- Guest mode for instant play
- Persistent coin saving
- Live leaderboards
- Mobile-responsive design
- Authentic Game Boy graphics

---

**🎰 That's it! Just `docker-compose up --build -d` and you're done! ⚡**