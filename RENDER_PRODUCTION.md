# 🎯 Render Production Deployment - Adım Adım Rehberi

## Önemli Notlar
- ✅ db_data.json artık kullanılmıyor - Firestore kullanıyoruz
- ✅ Veritabanı: Google Firestore (siftah-app-v1)
- ✅ Sunucu: Render (Node.js, Dockerfile ile)
- ✅ Otomatik Deploy: GitHub push → Render auto-deploy

---

## Adım 1: Render Account Oluşturun

1. https://render.com/auth/sign-up açın
2. Email ve password ile register olun
3. Email verification yapın
4. Dashboard'a gelin: https://dashboard.render.com

---

## Adım 2: GitHub Bağlantısı

1. Render Dashboard → Settings → Integrations
2. "GitHub" → Connect
3. Sizin GitHub account'ı authorize edin
4. Repository seçeğiniz repo'nu seçin

---

## Adım 3: Web Service Oluşturun

1. Dashboard → "New +" → "Web Service"
2. Repository seçin: `codew43671/esnaf` (veya sizinkisi)
3. "Connect" tıklayın

**Settings:**
```
Name: siftah-app
Environment: Node
Build Command: npm run build
Start Command: npm start
Instance Type: Free (başlangıç için yeterli)
```

4. "Create Web Service" tıklayın

---

## Adım 4: Environment Variables Ekle

**KRITIK:** Service creation sonrası Environment variables ekleyin.

Render Dashboard → siftah-app → Environment

Aşağıdaki variables'ı ekleyin:

```
NODE_ENV=production
PORT=3000
RENDER=true

FIREBASE_PROJECT_ID=siftah-app-v1
FIREBASE_PRIVATE_KEY_ID=f59a069f7ce005bbb959d945cee79b0982b52d56
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBA...[FULL KEY]...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@siftah-app-v1.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=111060470180634756523
FIREBASE_DATABASE_URL=https://siftah-app-v1.firebaseio.com
```

⚠️ **Dikkat:** FIREBASE_PRIVATE_KEY'nin newline'ları (`\n`) korunmalı!

4. "Save" tıklayın

---

## Adım 5: Deploy İzle

1. Render Dashboard → siftah-app → "Logs" tab'ı
2. Deploy progress izleyin

**Başarılı Deploy Mesajı:**
```
✅ Production Server running on port 3000
🔥 Database: Firestore (siftah-app-v1)
```

3. "Available at" link'ine tıklayın: `https://siftah-app.onrender.com`

---

## Adım 6: Health Check

```bash
curl https://siftah-app.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-08T15:30:45.123Z",
  "database": "Firestore",
  "environment": "production",
  "port": 3000,
  "firebaseProject": "siftah-app-v1",
  "firebaseConnection": "connected"
}
```

✅ Eğer `"firebaseConnection": "connected"` görmüyorsanız:
- Render Logs'u kontrol edin
- Firebase credentials doğru mu?
- Firestore Database online mi?

---

## Adım 7: Test API Çağrısı

```bash
# 1. Product ekle
curl -X POST https://siftah-app.onrender.com/api/products \
  -H "Authorization: Bearer default_merchant" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Ürün",
    "price": 100,
    "stockQuantity": 10,
    "stockLimit": 50,
    "category": "Genel"
  }'

# Response:
# { "id": "prod_1234567890", "name": "Test Ürün", ... }

# 2. Ürünleri listele
curl -X GET https://siftah-app.onrender.com/api/products \
  -H "Authorization: Bearer default_merchant"

# Response:
# [ { "id": "prod_1234567890", "name": "Test Ürün", ... } ]
```

---

## Adım 8: Firestore Doğrulaması

1. Firebase Console → siftah-app-v1
2. Firestore → Data tab'ı
3. `users/default_merchant/products/` koleksiyonu görünüyor mu?
4. Eklediğiniz test ürün var mı?

✅ Eğer veriler görünüyorsa, deployment başarılı! 🎉

---

## Adım 9: Auto-Deploy Ayarı

GitHub push otomatik Render deployment'ı tetikler.

Kontrol etmek için:
1. Lokal'da bir dosya düzenleyin
2. GitHub'a push edin
3. Render Dashboard → Logs → Yeni deploy yapıyor mu?

---

## Adım 10: Custom Domain (Opsiyonel)

Eğer custom domain istiyorsanız:

1. Render Dashboard → siftah-app → Settings
2. "Custom Domains" → "Add"
3. Domain adınız girin: `siftah.yourdomain.com`
4. DNS records'u Render tarafından sağlanan nameserver'lara point edin
5. SSL otomatik aktif olur

---

## Troubleshooting

### Deploy başarısız - Build failed
```
Kontrol edin:
1. npm run build lokal'da çalışıyor mu?
2. TypeScript errors var mı?
3. Dependencies eksik mi?
4. package.json'da build script doğru mu?
```

### Health check OK ama Firestore bağlantısı failed
```
Kontrol edin:
1. FIREBASE_* variables doğru mu? (Render → Environment)
2. FIREBASE_PRIVATE_KEY'de \n karakterleri mı var?
3. Firebase Service Account keys still valid mi?
4. Firestore Database online mi? (Firebase Console)
```

### API çağrısı 503 Firestore unavailable
```
Kontrol edin:
1. Render logs'unda Firebase init hatasıVar mı?
2. Network connectivity (Firestore erişilebilir mi?)
3. Rate limiting (Firestore quota aşıldı mı?)
```

### Database data görünmüyor
```
Kontrol edin:
1. Authorization header Bearer token doğru mu?
2. Firestore Console'da collection yapısı doğru mu?
   users/{userId}/products/{id}
3. Dokuman ID'si doğru mu?
```

---

## Performance Tips

### 1. Firestore Query Optimization
```typescript
// ❌ Yavaş - Tüm dokümanları oku
const snapshot = await db.collection("products").get();

// ✅ Hızlı - Filtreleme yap
const snapshot = await db.collection("products")
  .where("isActive", "==", true)
  .limit(10)
  .get();
```

### 2. Indexes
Firestore otomatik simple queries'i handle eder.
Composite queries için indexes'i Firestore önerecek.

### 3. Caching
Render'ın built-in caching'ini kullanmayın (stateless)
Instead, Redis veya Firestore caching kullanın.

---

## Monitoring

### Render Logs
```
Render Dashboard → siftah-app → Logs
- Errors real-time görmek için
- Deployment progress izlemek için
```

### Firebase Firestore Usage
```
Firebase Console → siftah-app-v1 → Usage
- Daily read/write operations
- Storage usage
- Network egress
```

### Health Check Endpoint
```bash
# Cron job ile her 5 dakika kontrol et
0 */5 * * * curl https://siftah-app.onrender.com/api/health | grep "ok"
```

---

## Security Checklist

- [ ] Firebase credentials Render environment'ta secret'olarak stored
- [ ] `.env` dosyası `.gitignore`'da
- [ ] FIREBASE_PRIVATE_KEY secure şekilde entered (not exposed in logs)
- [ ] Firestore Security Rules production-ready
- [ ] HTTPS enabled (Render otomatik yapıyor)
- [ ] Health endpoint sensitive data leak'ine bakmıyor

---

## Veri Backup (Manual)

```bash
# Firestore manual export
gcloud firestore export gs://siftah-app-backups/backup-$(date +%Y%m%d)

# Storage'dan download
gsutil -m cp -r gs://siftah-app-backups/backup-20250108 ./backups/
```

---

## Render Free Tier Limits

| Resource | Limit | Yeterli mi? |
|----------|-------|-----------|
| Monthly Hours | 750 | ✅ Evet |
| RAM | 0.5 GB | ✅ Evet |
| Disk | Ephemeral | ⚠️ Veri disk'te yok (Firestore kullanıyoruz) |
| Bandwidth | Unlimited | ✅ Evet |
| CPU | Shared | ✅ Evet |

---

## Next Steps

1. ✅ Render'da deploy edin
2. ✅ Health check doğrulayın
3. ✅ API test'leri yapın
4. ✅ Firestore'da veri görün
5. ⏳ Frontend'i Render'a bağlayın
6. ⏳ Custom domain ayarlayın
7. ⏳ CI/CD pipeline optimize edin

---

**Hazır mısınız? Render deploy'a gidebiliriz!** 🚀
