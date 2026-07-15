# 📋 TEKNİK ALTYAPI ANALİZ RAPORU

**Analiz Tarihi:** 22 Haziran 2026  
**Proje:** ESNAF İndirim Vitrini + Bulut Senkronizasyonu  
**Status:** İlk İnceleme Tamamlandı

---

## 1️⃣ BACKEND VARLIGI

### ✅ Backend Var mı?
**CEVAP: EVET - Express.js ile tam fonksiyonel backend**

#### Kanıt:
```
📦 package.json
- "express": "^4.21.2" ✓ Yüklü
- "typescript": "~5.8.2" ✓
- "@types/express": "^4.17.21" ✓
- "tsx": "^4.21.0" ✓
- "dotenv": "^17.2.3" ✓ (env değişkenleri için)
- "esbuild": "^0.25.0" ✓ (production bundle için)

Scripts:
- "dev": "tsx server.ts" ✓
- "start": "node dist/server.cjs" ✓ (Production)
- "build": "vite build && esbuild server.ts..." ✓
```

#### Backend Dosyası:
- **server.ts** (Express uygulaması)
- **PORT:** 3000 (sabit)
- **Middleware:** express.json(), vite devServer (development)
- **Çalışma Şekli:** Hybrid (Development'ta Vite + Express entegre)

---

## 2️⃣ VERİ SAKLAMA VE VERITABANI

### 🗄️ Verilerin Nerede Saklandığı?

#### **Seviye 1: Tarayıcı Tarafı (localStorage/IndexedDB)**
```
Frontend State:
- localStorage  → Cihaz kimliği, lisans verileri, backup
- IndexedDB    → Lisans kayıtları (license-db.ts)
- sessionStorage → Oturum verileri
- Memory        → window.__AKN_LICENSE__ (şifre tutuluyor)
```

**PROBLEM:** Sadece tarayıcıda tutulduysa, sunucu hiçbir veri hatırlamaz.  
**ÇÖZÜм:** Mevcut sistem bunu çözmüş → Seviye 2'ye bakınız.

---

#### **Seviye 2: Sunucu Tarafı (JSON File DB)**
```
📁 db_data.json (Sunucuda fiziksel dosya)

İçeriği:
{
  "products": [],        ← Ürünler
  "customers": [],       ← Müşteriler
  "campaigns": [],       ← Kampanyalar
  "publicDiscounts": [], ← Vitrindeki indirimler
  "settings": {
    "language": "tr",
    "merchantName": "...",
    "merchantPhone": "...",
    "merchantWhatsApp": "..."
  }
}
```

**Veritabanı Türü:** JSON File Database (SQLite değil, dosya sistemi)

**Okunan Dosya Konumu:**
```javascript
const DATA_FILE = path.join(process.cwd(), "db_data.json");
```

**Okuma Fonksiyonu (readDatabase):**
```javascript
function readDatabase() {
  if (!fs.existsSync(DATA_FILE)) {
    // Dosya yoksa, başlangıç verisi ile oluştur
    fs.writeFileSync(DATA_FILE, ...);
  }
  const data = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(data);
}
```

**Yazma Fonksiyonu (writeDatabase):**
```javascript
function writeDatabase(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}
```

### ✅ DOSYA SİSTEMİ YAZMA YETKİSİ

**CEVAP: EVET - Sunucu `fs` module ile dosyaya yazma yetkisine sahip**

**Kanıt:**
- `fs.writeFileSync()` server.ts'de 5+ yerde kullanılıyor
- API Endpoint'leri veri yazmak için bu fonksiyonu çağırıyor
- Test: POST /api/products → JSON'a yazılıyor
- Test: POST /api/campaigns → JSON'a yazılıyor
- Test: POST /api/public-discounts → JSON'a yazılıyor

**Uyarı ⚠️:**
```
Render.com (veya Vercel) gibi bulut ortamlarda:
- File system EPHEMERAL (geçici) olabilir
- Sunucu yeniden başlatıldığında veriler silinir
- Çözüm: PostgreSQL / MongoDB gibi persistent DB'ye geçmek gerekir
```

---

## 3️⃣ VERİ AKIŞı MIMARISI

### 📊 Güncel Veri Akışı Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                      ESNAF (Browser)                        │
│  - Ürün ekle, kampanya yayınla                              │
│  - localStorage'da lokal kopya tutuyor                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ POST/PUT/DELETE /api/...
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              EXPRESS BACKEND (server.ts)                    │
│  - API Endpoint'leri: /api/products, /api/campaigns, ...   │
│  - readDatabase() → db_data.json'u okur                    │
│  - writeDatabase() → db_data.json'u yazıp günceller        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ fs.writeFileSync()
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              db_data.json (Sunucuda)                        │
│  - Tüm ürünler, kampanyalar, indirimler saklanıyor         │
│  - Dosya tabanlı, kalıcı saklama                           │
└─────────────────────────────────────────────────────────────┘
```

### 📡 İşlem Akışı (Örnek: Yeni Kampanya Yayınlama)

1. **Esnaf UI'de kampanya bilgisini girer** → localStorage'a kaydedilir
2. **"Yayınla" butonuna basar** → POST /api/public-discounts
3. **Backend:**
   - `req.body`'den kampanya verilerini alır
   - `readDatabase()` ile db_data.json'u yükler
   - Yeni kampanya nesnesini oluşturur
   - `db.publicDiscounts` array'ine ekler
   - `writeDatabase(db)` ile db_data.json'u günceller
4. **Frontend:** Response'den yeni kampanya ID'sini alır

---

## 4️⃣ SİTEMAP DOSYASI ANALİZİ

### 🗺️ Sitemap Şu An Nerede?

**CEVAP: Dinamik olarak Express Backend'de üretiliyor**

**Endpoint:**
```
GET /sitemap.xml (server.ts, line 666-709)
```

**Nasıl Çalışıyor:**

```javascript
app.get("/sitemap.xml", (req, res) => {
  const db = readDatabase();  // ← db_data.json'u oku
  
  // XML başlığı oluştur
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="...">...\n';
  
  // Homepage ekle
  sitemap += '<url><loc>https://example.com/</loc>...</url>\n';
  
  // Her ürün için URL ekle (products array'inden)
  db.products.forEach((product) => {
    sitemap += `<url><loc>https://example.com/product/${product.id}</loc>...</url>\n`;
  });
  
  // Her kampanya için URL ekle (publicDiscounts array'inden)
  db.publicDiscounts.forEach((discount) => {
    sitemap += `<url><loc>https://example.com/discount/${discount.slug}</loc>...</url>\n`;
  });
  
  sitemap += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);  // ← XML'i tarayıcıya gönder
});
```

### ✅ Sitemap Özellikleri

| Özellik | Status | Not |
|---------|--------|-----|
| **Dinamik Üretim** | ✅ Var | İstek gelince oluşturuluyor |
| **Otomatik Güncellenme** | ✅ Var | Ürün/kampanya ekle/sil → sitemap otomatik update |
| **Homepage URL'i** | ✅ Var | `https://example.com/` |
| **Ürün URL'leri** | ✅ Var | `/product/{id}` formatında |
| **Kampanya URL'leri** | ✅ Var | `/discount/{slug}` formatında |
| **LastMod Tarihi** | ✅ Var | Her URL'ye `<lastmod>` ekleniyor |
| **Priority Düzeyi** | ✅ Var | Homepage=1.0, Ürün=0.8, Kampanya=0.7 |

**PROBLEM:** Sabit URL'ler
```javascript
sitemap += '<loc>https://example.com/...</loc>\n';  // ← "example.com" hardcoded
```

---

## 5️⃣ LİSANS KONTROLÜ

### 🔐 Lisans Doğrulama Nerede Yapılıyor?

#### **Seviye 1: Tarayıcı Tarafı (localStorage) - GÜVENSIŞ**
```
Dosya: src/lib/license-manager.ts

Fonksiyonlar:
- loadLicenseData()
- saveLicenseData()
- decodeLicenseKey()
- isLicenseExpired()
- validateLicense()
```

**Nasıl Çalışıyor:**
1. Kullanıcı lisans anahtarı girir
2. Key base64 decode'lanıyor
3. JSON parse ediliyor: `{ id: machineId, exp: tarih, type: "..." }`
4. localStorage'a kaydediliyor
5. Kontrol: machineId + expiry tarihi

**PROBLEM:** Sadece tarayıcıda kontrol → **Güvenli değil**
```
Neden? Çünkü:
- localStorage'a direkt erişilebilir (DevTools)
- Tarih değiştirebilir (Sistem saati manipüle)
- Lisans verisi silebilir, yerine fake yazabilir
```

#### **Seviye 2: IndexedDB (license-db.ts) - Biraz daha güvenli**
```
Store: "licenses" → Lisans verileri
Store: "used_licenses" → Tek seferlik kullanım kaydı

Fonksiyonlar:
- recordUsedLicense()
- isLicenseAlreadyUsed()
```

**Amaç:** Aynı lisansın çok farklı makinelerde kullanılmasını engellemek

#### **Seviye 3: Sunucu Tarafı (Backend) - EKSIK**

**CEVAP: Sunucuda lisans doğrulama kodu YOK**

**Kanıt:**
- server.ts'de lisans kontrol logic'i bulunmuyor
- POST /api/settings'e istek gelmeden, lisans doğrulama yok
- Frontend'ten herhangi bir API'ye POST atıldığında, backend "Lisans geçerli mi?" diye sormadığı anlaşılıyor

**Problem:** 
```
Esnaf → Frontend'de lisans kontrolü geçer → 
Ama backend'e POST atarken, sunucu hiç kontrol etmez →
Herhangi biri Postman'den /api/public-discounts'a POST atabilir!
```

---

## 6️⃣ GÜVENLIK VE YETKİLENDİRME

### 🔒 Sunucu İçin Güvenlik Soruları

| Soru | Cevap | Durum |
|------|-------|-------|
| **API'ler açık mı?** | Evet, kimlik kontrolü yok | ⚠️ Açık |
| **Authentication var mı?** | Yok | ❌ Eksik |
| **API Rate Limiting?** | Yok | ❌ Eksik |
| **CORS ayarı?** | Yok (tüm origin'lerden istek alıyor) | ⚠️ Açık |
| **Request Validation?** | Kısmi (sadece typeof kontrol) | ⚠️ Zayıf |

---

## 7️⃣ BULUT DÖ

DEPLOYMENT UYGUNLUĞU

### 🚀 Mevcut Deployment Durumu

**Vercel / Render.com gibi Platformlarda:**

```
✅ Express Backend             → Çalışır
✅ React Frontend (SSR yok)    → Çalışır
⚠️  db_data.json Yazma         → SORUN!
```

**Neden Sorun?**
```
Ephemeral File System:
- Render.com: Dosya sistemi konteyner kapatılınca silinir
- Vercel: Serverless = dosya yazma desteklenmiyor
- AWS Lambda: Yalnızca /tmp (geçici) yazılabilir

Sonuç:
- Veritabanını db_data.json'dan SQLite/PostgreSQL'e taşımak lazım
```

---

## 8️⃣ MEVCUT SETUP'UN STRENJİ VE ZAYIF YÖNLERİ

### ✅ Güçlü Yönler

1. **Full Stack İnfrastruktur Var**
   - Backend (Express) mevcut ve çalışıyor
   - Frontend (React + TypeScript)
   - Dinamik sitemap yönetimi
   - API endpoint'leri iyi organize

2. **Veri Persistency**
   - JSON File Database'e kaydediyor
   - Backup/Restore mekanizması var
   - SEO şeması (JSON-LD) destekleniyor

3. **Geliştirmeye Hazır**
   - TypeScript kullanılıyor (type safety)
   - Vite + Hot Reload (dev experience iyi)
   - npm scripts organize

### ❌ Zayıf Yönler

1. **Lisans Doğrulama Tarafında Boşluk**
   - Sunucuda kontrol yok
   - Kullanıcı endpoint'lere istediği veriyi POST atabilir
   - MachineID manipüle edilebilir

2. **Bulut Deployment'ta Dosya Sistemi Sorunu**
   - db_data.json yazmaması sorun
   - Production'da PostgreSQL/MongoDB lazım

3. **Güvenlik Açıkları**
   - API Authentication yok
   - CORS tüm origin'lerden istek kabul ediyor
   - Rate limiting yok

4. **Hardcoded URL'ler**
   - sitemap.xml'de `https://example.com` yazılı
   - robots.txt'de de aynı (dynamik olması gerekir)

---

## 9️⃣ BULUT SENKRONİZASYONU İÇİN GEREKLİ ADIMLAR

### 🔧 Teknik Gereksinimleri

| Adım | Gerekli mi? | Mevcut mi? | Status |
|------|-------------|-----------|--------|
| **Ürün/Kampanya → Backend POST** | ✅ Evet | ✅ Var | Ready |
| **Backend'in db'yi güncellemesi** | ✅ Evet | ✅ Var | Ready |
| **Sitemap dinamik üretme** | ✅ Evet | ✅ Var | Ready |
| **Her esnafın kendi URL'si** | ✅ Evet | ❌ Yok | **EKSIK** |
| **Sunucu lisans doğrulama** | ✅ Evet | ❌ Yok | **EKSIK** |
| **CDN/Bulut senkronizasyonu** | ✅ Evet | ⚠️ Kısmi | **Partial** |
| **Google Search Console hazırlanması** | ✅ Evet | ✅ Var | Ready |

---

## 🔟 SONUÇ VE TAVSİYELER

### 📌 Özetleme

1. **Backend Altyapısı** = Mevcut ✅
2. **Veritabanı** = JSON file (Production'a hazır değil)
3. **Sitemap** = Dinamik ✅
4. **Lisans Kontrolü** = Frontend only ❌
5. **Güvenlik** = Temel seviye ⚠️

### 💡 Öneriler (Öncelik Sırasına Göre)

**1. ACIL (Production'a geçmeden):**
- [ ] PostgreSQL/MongoDB'ye geçiş
- [ ] Sunucu tarafında lisans doğrulama
- [ ] API Authentication (JWT veya API Key)

**2. ÖNEMLİ (Bulut senkronizasyonu için):**
- [ ] Her esnafın kendi vitrini URL'si (username-based)
- [ ] URL'lerin dinamik olması (hardcoded example.com → production URL)
- [ ] Sitemap.xml URL'lerinin düzeltilmesi

**3. KÖYİ (UX iyileştirmesi):**
- [ ] CORS başkanlaması
- [ ] Rate limiting
- [ ] Request validation iyileştirmesi

---

## 📝 TEKN NOTLAR

### API Endpoint'leri Özeti

```
PRODUCTS
  GET    /api/products        ← Tüm ürünleri getir
  POST   /api/products        ← Yeni ürün ekle
  PUT    /api/products/:id    ← Ürünü güncelle
  DELETE /api/products/:id    ← Ürünü sil

CAMPAIGNS
  GET    /api/campaigns       ← Kampanyaları listele
  POST   /api/campaigns       ← Yeni kampanya
  PUT    /api/campaigns/:id   ← Kampanyayı güncelle
  POST   /api/trigger-campaign← Kampanya gönder

PUBLIC DISCOUNTS (Vitrindeki indirimler)
  GET    /api/public-discounts         ← Tümünü getir
  POST   /api/public-discounts         ← Yayınla
  PUT    /api/public-discounts/:id     ← Güncelle
  DELETE /api/public-discounts/:id     ← Kaldır
  PUT    /api/public-discounts/:id/views  ← İnceleme sayısı
  PUT    /api/public-discounts/:id/shares ← Paylaşım sayısı

SETTINGS
  GET    /api/settings        ← Mağaza ayarları
  POST   /api/settings        ← Ayarları güncelle

SEO
  GET    /sitemap.xml         ← Sitemap (dinamik)
  GET    /robots.txt          ← Robots.txt
  GET    /api/product/:id/schema ← JSON-LD schema
  POST   /api/generate-seo-meta  ← SEO metadata (Gemini)
  POST   /api/generate-marketing ← Marketing metin (Gemini)

HEALTH
  GET    /api/health          ← Sunucu health check
```

---

**Rapor Hazırlayanı:** Fusion AI Assistant  
**Sonraki Adım:** Geliştirmeyi başlatmak istiyorsan, bu raporun hangi bölümü üzerinde çalışmak istersin?
