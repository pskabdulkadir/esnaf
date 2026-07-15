# Siftah Application - Deployment Guide

## 📋 Overview

Bu uygulama **self-hosted** ve **cihaz tabanlı** çalışmaktadır. Tüm veriler JSON dosya olarak lokal depolanır ve kullanıcılar tarafından backup/restore edilir.

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- Docker & Docker Compose installed
- Linux server (Ubuntu 20.04+ recommended)

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd siftah

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env file with your settings
nano .env
# Set: PRODUCTION_URL=https://yourdomain.com

# 4. Build and start
docker-compose up -d

# 5. Check logs
docker-compose logs -f siftah

# 6. Verify health
curl http://localhost:3000/api/health
```

### Data Backup

```bash
# Backups are automatically created in .backups/ directory
# Keep last 10 backups automatically

# Manual backup
cp db_data.json db_data.backup.$(date +%Y%m%d_%H%M%S).json

# Restore from backup
cp db_data.backup.20240101_120000.json db_data.json
docker-compose restart siftah
```

---

## 🔧 Manual Installation (PM2 - Alternative)

### Prerequisites
- Node.js 18+ installed
- npm installed

### Installation

```bash
# 1. Clone and install
git clone <repo-url>
cd siftah
npm install

# 2. Build
npm run build

# 3. Install PM2 globally
npm install -g pm2

# 4. Copy environment
cp .env.example .env
nano .env

# 5. Start with PM2
pm2 start ecosystem.config.js

# 6. Save PM2 config
pm2 save
pm2 startup

# 7. Check status
pm2 monit
```

### Logs & Monitoring

```bash
# View logs
pm2 logs siftah-app

# Restart
pm2 restart siftah-app

# Stop
pm2 stop siftah-app

# Delete
pm2 delete siftah-app
```

---

## 🔒 Systemd Service (Alternative)

### Installation

```bash
# 1. Create application directory
sudo mkdir -p /opt/siftah
sudo chown $USER:$USER /opt/siftah

# 2. Copy files
cp -r . /opt/siftah/
cd /opt/siftah

# 3. Install dependencies
npm install --production

# 4. Build
npm run build

# 5. Install service
sudo cp siftah.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable siftah
sudo systemctl start siftah

# 6. Check status
sudo systemctl status siftah

# 7. View logs
sudo journalctl -u siftah -f
```

### Management

```bash
# Start/Stop/Restart
sudo systemctl start siftah
sudo systemctl stop siftah
sudo systemctl restart siftah

# Check status
sudo systemctl status siftah

# View logs
sudo journalctl -u siftah -n 50
```

---

## 🌐 Nginx Reverse Proxy (Production)

### Installation

```bash
# 1. Install Nginx
sudo apt update
sudo apt install nginx

# 2. Copy config
sudo cp nginx.conf.example /etc/nginx/sites-available/siftah

# 3. Edit config
sudo nano /etc/nginx/sites-available/siftah
# Replace: yourdomain.com with your domain

# 4. Enable site
sudo ln -s /etc/nginx/sites-available/siftah /etc/nginx/sites-enabled/

# 5. Disable default site
sudo rm /etc/nginx/sites-enabled/default

# 6. Test config
sudo nginx -t

# 7. Start Nginx
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# 1. Install Certbot
sudo apt install certbot python3-certbot-nginx

# 2. Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 3. Update Nginx config with certificate paths
sudo nano /etc/nginx/sites-available/siftah

# 4. Restart Nginx
sudo systemctl restart nginx

# 5. Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 📊 Environment Variables

```bash
# .env file template
PORT=3000                                    # Server port
NODE_ENV=production                          # Environment
PRODUCTION_URL=https://yourdomain.com       # Public URL
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXXXXXXX        # Optional: Google Analytics
GOOGLE_ADS_ID=AW-XXXXXXXXXX                  # Optional: Google Ads
```

---

## 📦 Database Management

### Backup Strategy

**Automatic Backups:**
- Every write operation creates a backup
- Last 10 backups retained in `.backups/` directory

**Manual Backup:**
```bash
# Single backup
cp db_data.json backups/db_data.$(date +%Y%m%d_%H%M%S).json

# All backups to external storage
tar -czf db_backups.tar.gz .backups/
```

**Restore:**
```bash
# From backup
cp .backups/db_data_backup.json db_data.json

# If using Docker
docker-compose down
cp .backups/db_data_backup.json db_data.json
docker-compose up -d
```

### Export/Import Data

Users can download and upload backups through the UI:
- **Download:** Pazarlamacı tab → VERİLERİ İNDİR
- **Upload:** Pazarlamacı tab → VERİLERİ YÜKLE

---

## 🔍 Monitoring & Health

### Health Check

```bash
# API health
curl http://localhost:3000/api/health

# Response
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600
}
```

### Docker Health

```bash
# Check container health
docker-compose ps

# View health status
docker inspect siftah-app | grep -A 5 "Health"
```

### Log Monitoring

```bash
# Docker logs
docker-compose logs -f --tail=50 siftah

# PM2 logs
pm2 logs siftah-app --lines=50

# Systemd logs
sudo journalctl -u siftah -n 100 -f
```

---

## 🔐 Security Checklist

- [ ] Change default admin password in settings
- [ ] Enable HTTPS with valid certificate
- [ ] Configure Nginx firewall rules
- [ ] Regular backups to external storage
- [ ] Monitor disk space (.backups/ directory)
- [ ] Set up log rotation
- [ ] Restrict access to /admin endpoints
- [ ] Update Node.js regularly

---

## 🛠️ Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 3000
sudo lsof -i :3000
sudo kill -9 <PID>

# Or change PORT in .env
```

### Database Corruption

```bash
# Restore from backup
cp .backups/latest_backup.json db_data.json
docker-compose restart siftah
```

### High Memory Usage

```bash
# Check memory
free -h
ps aux | grep node

# Increase memory limit in docker-compose.yml
# memory: 1g
```

### Nginx Issues

```bash
# Test config
sudo nginx -t

# Reload config
sudo nginx -s reload

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📈 Performance Tuning

### For Large Datasets

```yaml
# docker-compose.yml
services:
  siftah:
    environment:
      - NODE_ENV=production
      - PORT=3000
    mem_limit: 1g
    memswap_limit: 1g
```

### Database Optimization

- Keep `.backups/` cleaned up (10 backups max, auto-managed)
- Archive old data periodically
- Monitor JSON file size

---

## 🔄 Update Procedure

```bash
# 1. Backup current data
cp db_data.json db_data.backup.$(date +%Y%m%d).json

# 2. Pull updates
git pull origin main

# 3. Install dependencies
npm install

# 4. Build
npm run build

# 5. Restart service
docker-compose restart siftah
# OR
pm2 restart siftah-app
# OR
sudo systemctl restart siftah
```

---

## 📞 Support

For issues:
1. Check logs
2. Verify .env configuration
3. Ensure adequate disk space
4. Check network connectivity
5. Review backups for data recovery

---

## 📋 Checklist for Production

- [ ] Server deployed and running
- [ ] HTTPS certificate configured
- [ ] Backups automated and tested
- [ ] Monitoring and alerts set up
- [ ] Admin credentials changed
- [ ] Nginx reverse proxy configured
- [ ] Firewall rules applied
- [ ] Health checks passing
- [ ] Database file permissions correct
- [ ] Log rotation configured
