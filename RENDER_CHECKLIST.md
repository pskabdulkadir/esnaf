# Render Deployment Checklist

## ✅ Before Pushing to GitHub

- [ ] Read `RENDER_SETUP.md` completely
- [ ] Understand `/var/data` mount path for Render
- [ ] Verify `Dockerfile` exists in repo root
- [ ] Verify `render.yaml` exists in repo root
- [ ] Check `.env.example` has `RENDER=false`

## ✅ GitHub Repository

```bash
# 1. Add and commit all files
git add .
git commit -m "Setup Render deployment"

# 2. Push to main branch
git push origin main
```

## ✅ Render.com Setup

### Step 1: Connect Repository
1. Go to https://render.com
2. Dashboard → **New** → **Web Service**
3. Connect your GitHub account
4. Select `siftah` repository
5. Click **Connect**

### Step 2: Configure Service
- Name: `siftah-app` (or your choice)
- Environment: `Docker`
- Branch: `main`
- **Do NOT change Build/Start Commands** (Dockerfile handles it)

### Step 3: Add Environment Variables
Click **Environment** and add these:

```
NODE_ENV=production
RENDER=true
PORT=3000
PRODUCTION_URL=https://siftah-app.onrender.com
```

(Replace `siftah-app` with your actual Render app name)

Optional:
```
GOOGLE_ANALYTICS_ID=G-XXXXXXX
GOOGLE_ADS_ID=AW-XXXXXX
```

### Step 4: Add Persistent Disk
1. Click **Disks**
2. **Add Disk**
3. Name: `db-volume`
4. Mount Path: `/var/data`
5. Size: `1 GB`
6. Click **Save**

### Step 5: Deploy
Click **Create Web Service** and wait for deployment.

## ✅ After Deployment

### Check Health
```bash
# Replace with your actual Render URL
curl https://siftah-app.onrender.com/api/health

# Expected response (should be 200):
# {"status":"ok","timestamp":"...","uptime":...}
```

### Test Application
1. Open https://siftah-app.onrender.com in browser
2. Try logging into Pazarlamacı panel
3. Create a test campaign
4. Download backup (VERİLERİ İNDİR)
5. Verify db_data.json file downloaded
6. Upload backup (VERİLERİ YÜKLE)
7. Verify campaign still exists

### Monitor Logs
- Go to Render dashboard
- Click your service
- View **Logs** tab for any errors

## ⚠️ Important Notes

1. **First Deploy:** May take 5-10 minutes (building Docker image)
2. **Free Tier:** Service spins down after 15 min inactivity (auto-restart on access)
3. **Data Persistence:** Automatically handled via `/var/data` mount
4. **Backups:** Auto-created, last 10 kept in `/var/data/.backups/`
5. **HTTPS:** Automatically enabled (no setup needed)

## 🔄 Auto-Deployments

Future deployments automatic when you push to main:
```bash
git push origin main  # This triggers Render rebuild/deploy
```

## 📞 Troubleshooting

**Build fails?** → Check Render build logs for specific errors

**Health check fails?** → Wait 30-60 seconds, check application logs

**Data lost?** → Should not happen with proper mount, restore from backup

**Service slow?** → Free tier spins down, upgrade to paid tier for always-on

## ✨ You're Done!

Your app is now live on Render at:
```
https://siftah-app.onrender.com
```

Share this URL with users to access the application!
