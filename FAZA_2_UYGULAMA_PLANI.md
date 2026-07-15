# Faz 2: Backend Entegrasyonu - Uygulama Planı

## Durum
- ✅ Firebase projesi canlı (siftah-app-v1)
- ✅ Service Account anahtarı .env'de
- ✅ Migration script hazır
- ❌ server.ts henüz Firestore'a geçmedi (mevcut: dosya tabanlı)
- ❌ Frontend Authorization header eklemesi bekleniyor

---

## Faz 2'nin 3 Adımı

### Adım 1: Migration Script'i Çalıştır
```bash
# Eğer db_data.json'da eski veri varsa:
npm run migrate-firestore

# Output: ✅ MIGRATION BAŞARILI!
# Result: Tüm veriler Firestore'a taşındı, db_data.json silindi
```

**Kontrol:**
- Firestore Console'da `users/default_merchant/products/...` görünüyor mu?
- `.backups/db_data_*.json` oluştu mu?

---

### Adım 2: server.ts'i Firestore'a Bağla

**Problem:** Mevcut server.ts hala `fs` modülüyle dosya okuyor.

**Çözüm:** 3 seçenek var:

#### Seçenek A: Tam Refactor (Önerilen)
- `server.ts` tamamen yaz, tüm fs işlemleri → Firestore
- **Avantaj:** Temiz, modern, performant
- **Dezavantaj:** Büyük değişiklik, test süresi

#### Seçenek B: Hybrid Mode (Kademeli)
- server.ts mevcut kalır ama Firestore entegrasyonu yapılır
- fs ile Firestore aynı anda çalışır (veri senkron)
- **Avantaj:** Güvenli geçiş, rollback imkanı
- **Dezavantaj:** Tekil kod, kompleks

#### Seçenek C: Yeni Server Dosyası (Tercih: B)
- server.ts → server-old.ts (backup)
- server-firestore.ts → server.ts (yeni)
- **Avantaj:** Clean start
- **Dezavantaj:** Git history kaybolabilir

**Benim önerim:** **Seçenek A (Tam Refactor)**

Neden? Firestore'a tam geçmek istiyorsunuz. Yarı yolda bırakmak daha kompleks.

---

### Adım 3: Frontend Authorization Header

Frontend'de tüm API çağrıları bu formatta olmalı:

```typescript
// Eski (çalışmıyacak)
const response = await fetch('/api/products');

// Yeni (Firestore gerekli)
const userId = localStorage.getItem('lisans_anahtari'); // Kullanıcı ID'si

const response = await fetch('/api/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${userId}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Implementasyon Sırası

1. **Migration çalıştır**
   ```bash
   npm run migrate-firestore
   ```

2. **server.ts refactor et** (Firestore endpoints)
   - `GET /api/products` → userId'den Firestore'a oku
   - `POST /api/products` → userId'yle Firestore'a yaz
   - ... (tüm endpoints)

3. **Frontend güncellemeleri**
   - `src/components/Marketer.tsx` → Authorization header ekle
   - `src/App.tsx` → Authorization header ekle
   - localStorage'da userId saklı mı kontrol et

4. **Test**
   ```bash
   npm run dev
   # 1. Login / userId başlat
   # 2. Ürün ekle → Firestore'da görünüyor mu?
   # 3. Kampanya yayınla → publicDiscounts koleksiyonunda mı?
   ```

5. **Build & Deploy**
   ```bash
   npm run build
   npm start
   ```

---

## Teknik Detaylar

### Authorization Header Strukture

```
Request:
  GET /api/products
  Headers: {
    Authorization: "Bearer default_merchant"
  }

Server:
  1. AuthHeader oku: "Bearer default_merchant"
  2. userId ayıkla: "default_merchant"
  3. Firestore'dan oku: users/default_merchant/products/...
```

### Firestore Bağlantı Testi

```bash
# Health check
curl http://localhost:3000/api/health

# Response:
{
  "status": "ok",
  "database": "Firestore",
  "timestamp": "2025-01-08T...",
  "environment": "development"
}
```

### Hata Handling

```typescript
// Firestore bağlantı hatası
try {
  const docs = await db.collection('users').doc(userId).collection('products').get();
} catch (err) {
  console.error('Firestore error:', err);
  res.status(500).json({ error: 'Sunucu ile bağlantı kurulamadı' });
}
```

---

## Riskleri & Mitigation

| Risk | Mitigation |
|------|-----------|
| Veri kaybı | ✅ .backups'a backup al, migration testleyin |
| API downtime | ✅ Hybrid mode (fs + Firestore) paralel çalıştır |
| Firestore quota aşımı | ✅ Ücretsiz tier yeterli, write limits gözetilecek |
| Frontend broken | ✅ Authorization header eklemeden test et |
| Build fail | ✅ npm run build test et, node_modules temizle |

---

## Kontrol Listesi (Sırasıyla)

- [ ] `.env` dosyası Firebase credentials'ı içeriyor mu?
- [ ] `npm install firebase-admin` başarılı mı?
- [ ] `npm run migrate-firestore` çalıştı mı?
- [ ] Firestore Console'da `users/default_merchant` görünüyor mu?
- [ ] `.backups/db_data_*.json` oluştu mu?
- [ ] `server.ts` Firestore endpoints'ine güncellenmiş mi?
- [ ] `npm run dev` error yok mu?
- [ ] `GET /api/health` başarılı mı?
- [ ] Frontend Authorization header göndermeye başladı mı?
- [ ] Ürün ekle test → Firestore'da görünüyor mu?
- [ ] `npm run build` başarılı mı?
- [ ] `npm start` çalışıyor mu?

---

## Tahmini Zaman

| Adım | Süre |
|------|------|
| Migration çalıştır | 2-5 dakika |
| server.ts refactor | 1-2 saat |
| Frontend güncelle | 30 dakika |
| Test & debug | 30 dakika |
| Build & Deploy | 10 dakika |
| **Toplam** | **3-4 saat** |

---

## Sonraki Aşamalar (Faz 3-5)

- Faz 3: AI Content Engine (Firestore'dan ürün bilgisini al)
- Faz 4: Sitemap & SEO (publicDiscounts Firestore'dan oku)
- Faz 5: Security Rules (Test → Production mode)
- Faz 6: Render'a deploy

---

**Hazır mısınız? Başlayalım mı?**
