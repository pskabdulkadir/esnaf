# Siftah - Esnaf Marketing Platform

**Local JSON-based, Self-hosted, Device-identified Application**

All user data is stored locally and managed by users through backup/restore functionality.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete production setup guides:

- **Docker** (Recommended): One-command deployment
- **PM2**: Node.js process manager
- **Systemd**: Linux system service
- **Nginx**: Reverse proxy with SSL

## 📋 Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- For production: Linux server or Docker

## 🏗️ Build for Production

```bash
# Build frontend (Vite) and backend (esbuild)
npm run build

# Start production server
npm start

# Server runs on http://localhost:3000
```

## ⚙️ Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

**Available variables:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `PRODUCTION_URL` - Public application URL
- `GOOGLE_ANALYTICS_ID` - Optional: Google Analytics tracking
- `GOOGLE_ADS_ID` - Optional: Google Ads conversion tracking

## 💾 Data Management

### Backup & Restore

Users can manage data through the application UI:
- **Download Backup:** Pazarlamacı tab → VERİLERİ İNDİR
- **Upload Backup:** Pazarlamacı tab → VERİLERİ YÜKLE

### Automatic Backups

Every write operation creates automatic backups in `.backups/` directory.
Last 10 backups are retained automatically.

## 🐳 Docker Deployment

```bash
# Build and start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f siftah

# Stop
docker-compose down
```

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete production setup guide
- `.env.example` - Environment variables template
- `Dockerfile` - Production Docker image
- `docker-compose.yml` - Docker Compose setup
- `ecosystem.config.js` - PM2 configuration
- `nginx.conf.example` - Nginx reverse proxy config

## 📊 Features

✅ Campaign management (Create, Read, Update, Delete)
✅ Local JSON database with automatic backups
✅ User data backup/restore
✅ Google Search integration (Sitemap + IndexNow API)
✅ Responsive design
✅ Multi-language support (TR, EN, DE)
✅ SEO optimized

## 🔒 Security

- Input validation on all endpoints
- Error handling for database failures
- Automatic backup system
- HTTPS support via Nginx
- Rate limiting ready

## 🆘 Troubleshooting

See [DEPLOYMENT.md](DEPLOYMENT.md) for troubleshooting guide.

## 📝 License

This project is provided as-is for self-hosted deployment.
