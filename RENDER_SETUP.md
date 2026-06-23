# Siftah App - Render.com Deployment Guide

## 🚀 Quick Start on Render

### Step 1: Connect GitHub Repository

1. Go to https://render.com
2. Click **New** → **Web Service**
3. Select **Connect a repository**
4. Authorize GitHub and select your `siftah` repository
5. Click **Connect**

### Step 2: Configure Service

Fill in the deployment settings:

| Setting | Value |
|---------|-------|
| **Name** | `siftah-app` (or your preference) |
| **Environment** | `Docker` |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/server.cjs` |

### Step 3: Add Environment Variables

Click **Environment** and add:

```
NODE_ENV=production
RENDER=true
PORT=3000
PRODUCTION_URL=https://YOUR_APP_NAME.onrender.com
GOOGLE_ANALYTICS_ID=G-XXXXXXX (optional)
GOOGLE_ADS_ID=AW-XXXXXX (optional)
```

**Important:** Replace `YOUR_APP_NAME` with your actual Render app name.

### Step 4: Configure Persistent Disk

1. Click **Disks**
2. Click **Add Disk**
3. Set:
   - **Name:** `db-volume`
   - **Mount Path:** `/var/data`
   - **Size:** `1 GB` (minimum for most uses)

4. Click **Save**

### Step 5: Deploy

1. Click **Create Web Service**
2. Wait for build to complete
3. View deployment logs in **Logs** tab

### Step 6: Verify Health

Once deployed, test the health endpoint:

```bash
# Replace with your actual Render URL
curl https://siftah-app.onrender.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T12:00:00.000Z","uptime":...}
```

---

## 📁 File Structure for Render

```
siftah/
├── Dockerfile                 # Render uses this (not docker-compose.yml)
├── render.yaml               # Render deployment config
├── RENDER_SETUP.md          # This guide
├── package.json
├── server.ts                # Contains Render path handling
├── src/                     # Frontend
├── dist/                    # Built output
└── db_data.json            # Database (auto-created)
```

---

## 🔄 How Data Persistence Works on Render

### Path Mapping

```
Local Development:     process.cwd() + "db_data.json"
                      (usually ./db_data.json)

Render Production:    /var/data/db_data.json
                      (persistent disk mounted here)
```

The application automatically detects Render and uses the correct path via the `RENDER=true` environment variable.

### Automatic Backups

Backups are created in the same persistent disk:
```
/var/data/.backups/db_data_YYYYMMDD_HHMMSS.json
```

Last 10 backups are kept automatically.

---

## 📊 Monitoring

### Health Check

Render automatically checks `/api/health` every 30 seconds.

Check manually:
```bash
curl https://YOUR_APP_NAME.onrender.com/api/health
```

### View Logs

1. Go to your Render dashboard
2. Click on your service
3. Click **Logs** tab
4. View real-time logs from the application

### Check Disk Usage

```bash
# SSH into your service and run:
df -h /var/data
du -sh /var/data
```

---

## 🔒 Security on Render

✅ **HTTPS:** Automatically enabled for all Render apps  
✅ **Firewall:** Render provides DDoS protection  
✅ **Environment Variables:** Securely stored in Render dashboard  
✅ **No SSH Access (Free Tier):** Use Render's console only  

---

## 💾 Data Management

### Backup Downloads

Users download backups through the app UI:

1. Open app at `https://YOUR_APP_NAME.onrender.com`
2. Login to Pazarlamacı panel
3. Click "VERİLERİ İNDİR" (Download Data)
4. Save the JSON file locally

### Data Restore

1. In Pazarlamacı panel
2. Click "VERİLERİ YÜKLE" (Upload Data)
3. Select your backup JSON file
4. Confirm restore

### Manual Backup (via Render Console)

If needed, you can backup directly from Render:

1. Go to your service dashboard
2. Click **Console**
3. Run:
   ```bash
   cat /var/data/db_data.json > backup_$(date +%Y%m%d_%H%M%S).json
   ```
4. Download the backup file

---

## 🆘 Troubleshooting

### Deploy Failed - Build Error

**Check build logs:**
1. Go to **Logs** tab
2. Look for build errors
3. Common fixes:
   - Ensure `package.json` exists
   - Check `npm run build` succeeds locally first
   - Verify Node.js 18+ compatibility

### Deploy Failed - Port Binding

Render should set `PORT` automatically. If you get port errors:

1. Check **Environment** variables
2. Ensure `PORT` is set (or remove it to use default)
3. Ensure `NODE_ENV=production`

### 404 on Health Check

If `/api/health` returns 404:

1. Wait 30-60 seconds for full deployment
2. Check that application started (no errors in logs)
3. Verify `PRODUCTION_URL` matches your Render domain

### Disk Full Error

If you see "disk full" errors:

1. Check disk usage: `df -h /var/data`
2. Clear old backups: Backups over 30 days old can be deleted
3. Upgrade disk size in **Disks** tab

### Data Lost After Restart

**Should NOT happen with proper setup.** If data is lost:

1. Check if persistent disk is properly mounted
2. Verify `RENDER=true` in environment variables
3. Verify mount path is `/var/data`
4. Restore from backup if available

---

## 📈 Performance Tips

### Upgrade from Free Tier

Free tier has limitations:
- Services spin down after 15 minutes of inactivity
- Slower CPU
- Limited RAM (512MB)

**Paid tier benefits:**
- Always on
- Better performance
- More memory (1GB+)
- Priority support

### Cost Estimation (Jan 2024)

| Tier | Monthly Cost | Use Case |
|------|--------------|----------|
| Free | $0 | Testing, low traffic |
| Starter | $7/month | Small business |
| Standard | $12/month | Growing business |

---

## 🔄 Auto-Deploy from GitHub

Render automatically re-deploys when you push to `main` branch:

```bash
# This will trigger auto-deployment
git push origin main
```

You can also manually trigger deploys in the Render dashboard.

---

## 📞 Render Support

- **Render Docs:** https://render.com/docs
- **Status Page:** https://status.render.com
- **Support:** https://support.render.com

---

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Render.yaml added to repo
- [ ] Service connected to Render
- [ ] Environment variables set
- [ ] Persistent disk configured (1GB)
- [ ] Build succeeded
- [ ] Health check passing
- [ ] Data persistence working
- [ ] HTTPS enabled
- [ ] Domain configured (if custom domain)

---

## 📝 Next Steps

After deployment:

1. **Access your app:** https://YOUR_APP_NAME.onrender.com
2. **Test functionality:** Try creating/editing campaigns
3. **Test backup:** Download and re-upload data
4. **Monitor logs:** Keep an eye on application logs
5. **Set up custom domain:** (Optional) Configure your own domain

---

## 🎯 Key Differences from Local

| Feature | Local | Render |
|---------|-------|--------|
| Database Path | `./db_data.json` | `/var/data/db_data.json` |
| HTTPS | No (HTTP only) | Yes (auto) |
| Port | 3000 | Auto-assigned by Render |
| Restart Behavior | Manual | Auto (15 min idle free tier) |
| Backup Storage | `.backups/` folder | `/var/data/.backups/` |
| Cost | Free (local) | $0-12/month |
