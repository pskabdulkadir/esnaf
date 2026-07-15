# 🔥 Faz 1: Firestore Veri Şeması Tasarımı (Detaylı Döküman)

## Proje Bilgileri
- **Proje Adı:** siftah-app-v1
- **Veritabanı:** Cloud Firestore (Native/Standard Mode)
- **Güvenlik Modu:** Test Mode (ilerde userId-based rules)
- **Multi-tenant Mimarisi:** Evet - Her kullanıcı kendi veri silosunda

---

## Firestore Koleksiyon Hiyerarşisi

```
Firestore Database (siftah-app-v1)
│
└── users/ (Top-level Collection)
    │
    ├── {lisans_anahtarı}/ (Document)
    │   │
    │   ├── data/ (Sub-collection)
    │   │   └── user_data (Document) → Settings & Config
    │   │
    │   ├── products/ (Sub-collection)
    │   │   ├── {productId_1} (Document)
    │   │   ├── {productId_2} (Document)
    │   │   └── ...
    │   │
    │   ├── customers/ (Sub-collection)
    │   │   ├── {customerId_1} (Document)
    │   │   ├── {customerId_2} (Document)
    │   │   └── ...
    │   │
    │   ├── campaigns/ (Sub-collection)
    │   │   ├── {campaignId_1} (Document)
    │   │   └── ...
    │   │
    │   ├── sales/ (Sub-collection)
    │   │   ├── {saleId_1} (Document)
    │   │   └── ...
    │   │
    │   ├── expenses/ (Sub-collection)
    │   │   ├── {expenseId_1} (Document)
    │   │   └── ...
    │   │
    │   └── publicDiscounts/ (Sub-collection)
    │       ├── {discountId_1} (Document)
    │       └── ...
    │
    ├── {lisans_anahtarı_2}/ (Başka bir kullanıcı)
    │   └── (aynı yapı)
    │
    └── {lisans_anahtarı_3}/
        └── (aynı yapı)
```

---

## Document Yapıları & Alanlar

### 1. **users/{lisans_anahtarı}/data/user_data**

**Amaç:** Esnafın ayarları, profil bilgileri, meta verisi

**Firestore Document:**
```json
{
  "language": "tr",
  "merchantName": "Bizim Mahalle İşletmesi",
  "merchantPhone": "+90 532 111 2233",
  "merchantWhatsApp": "+90 532 111 2233",
  "businessType": "Manav",
  "businessAddress": "Mahalle Caddesi No:5",
  "businessEmail": "iletisim@mahalle.com",
  "updatedAt": Timestamp,
  "createdAt": Timestamp
}
```

**Alanlar:**
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| language | String | ✅ | Dil (tr, en, vb.) |
| merchantName | String | ✅ | İşletme adı |
| merchantPhone | String | ✅ | Telefon |
| merchantWhatsApp | String | ❌ | WhatsApp numarası |
| businessType | String | ❌ | İş türü |
| businessAddress | String | ❌ | Adres |
| businessEmail | String | ❌ | Email |
| updatedAt | Timestamp | ✅ | Son güncellenme |
| createdAt | Timestamp | ✅ | Oluşturma tarihi |

---

### 2. **users/{lisans_anahtarı}/products/{productId}**

**Amaç:** Ürün kataloğu (inventar)

**Firestore Document:**
```json
{
  "name": "Domates",
  "price": 45.99,
  "stockQuantity": 10,
  "stockLimit": 50,
  "category": "Sebzeler",
  "expiryDate": "2025-01-15",
  "isSpecialDiscount": false,
  "lastUpdated": Timestamp,
  "createdAt": Timestamp
}
```

**Alanlar:**
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| name | String | ✅ | Ürün adı |
| price | Number | ✅ | Birim fiyat |
| stockQuantity | Number | ✅ | Mevcut stok |
| stockLimit | Number | ✅ | Stok eşiği |
| category | String | ✅ | Kategori (Sebzeler, Meyve, vb.) |
| expiryDate | String | ❌ | Son kullanma tarihi (YYYY-MM-DD) |
| isSpecialDiscount | Boolean | ✅ | Kampanya için işaretli mi? |
| lastUpdated | Timestamp | ✅ | Son güncellenme |
| createdAt | Timestamp | ✅ | Oluşturma tarihi |

**Indeksler (Önerilir):**
- `stockQuantity` (filtering için)
- `expiryDate` (sorting için)
- `category` (filtering için)

---

### 3. **users/{lisans_anahtarı}/customers/{customerId}**

**Amaç:** Müşteri veritabanı

**Firestore Document:**
```json
{
  "fullName": "Ayşe Yılmaz",
  "phone": "+90 505 123 4567",
  "segment": "Ev Hanımları",
  "isSubscribed": true,
  "notes": "WhatsApp ile iletişim tercih ediyor",
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

**Alanlar:**
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| fullName | String | ✅ | Müşteri adı |
| phone | String | ✅ | Telefon |
| segment | String | ✅ | Segment (Ev Hanımları, Gençler, Genel) |
| isSubscribed | Boolean | ✅ | Haberdar olmak istiyor mu? |
| notes | String | ❌ | Not/açıklama |
| createdAt | Timestamp | ✅ | Oluşturma tarihi |
| updatedAt | Timestamp | ✅ | Son güncellenme |

**Indeksler (Önerilir):**
- `segment` (filtering için)
- `isSubscribed` (filtering için)

---

### 4. **users/{lisans_anahtarı}/campaigns/{campaignId}**

**Amaç:** Pazarlama kampanyaları (WhatsApp, email vb.)

**Firestore Document:**
```json
{
  "productId": "prod_1234567890",
  "productName": "Domates",
  "originalPrice": 45.99,
  "discountPrice": 35.99,
  "targetSegment": "Ev Hanımları",
  "messageContent": "Bu hafta domates indirimde!",
  "deliveryTime": "16:00 - 18:00 (Akşam yemeği öncesi)",
  "status": "Gönderildi",
  "sentCount": 125,
  "logs": [
    "2025-01-08 11:00 - 125 kişiye gönderildi"
  ],
  "createdAt": Timestamp,
  "approvedAt": Timestamp,
  "updatedAt": Timestamp
}
```

**Alanlar:**
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| productId | String | ✅ | Bağlı ürün ID |
| productName | String | ✅ | Ürün adı |
| originalPrice | Number | ✅ | Orijinal fiyat |
| discountPrice | Number | ✅ | İndirimli fiyat |
| targetSegment | String | ✅ | Hedef müşteri segmenti |
| messageContent | String | ✅ | Kampanya metni |
| deliveryTime | String | ✅ | Gönderim saati |
| status | String | ✅ | Taslak / Kuyrukta / Gönderildi / vb. |
| sentCount | Number | ✅ | Kaç kişiye gönderildi |
| logs | Array | ✅ | Gönderim logları |
| createdAt | Timestamp | ✅ | Oluşturma tarihi |
| approvedAt | Timestamp | ❌ | Onay tarihi |
| updatedAt | Timestamp | ✅ | Son güncellenme |

**Statüsler:**
- `Taslak` - Henüz hazır değil
- `Onay Bekliyor` - Gönderim öncesi kontrol
- `Kuyrukta` - Gönderim için sırada
- `Gönderiliyor` - Şu an gönderiliyor
- `Gönderildi` - Tamamlandı
- `İptal` - İptal edildi

---

### 5. **users/{lisans_anahtarı}/publicDiscounts/{discountId}**

**Amaç:** Halka açık indirimler (sitemap, SEO, Google indexing için)

**Firestore Document:**
```json
{
  "productId": "prod_1234567890",
  "productName": "Domates",
  "slug": "domates-indirim-2025",
  "originalPrice": 45.99,
  "discountPrice": 35.99,
  "category": "Sebzeler",
  "merchantName": "Bizim Mahalle İşletmesi",
  "merchantPhone": "+90 532 111 2233",
  "merchantWhatsApp": "+90 532 111 2233",
  "seoTitle": "En İyi Domates İndirim Fiyatı",
  "seoDescription": "Taze domates, en uygun fiyatla, mahalle esnafindan",
  "seoKeywords": "domates, indirim, taze, mahalle",
  "openGraphImage": "https://...",
  "views": 234,
  "shares": 12,
  "isActive": true,
  "publishMode": "global",
  "latitude": 41.0082,
  "longitude": 28.9784,
  "radiusKm": 5,
  "publishedAt": Timestamp,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

**Alanlar:**
| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| productId | String | ✅ | Bağlı ürün ID |
| productName | String | ✅ | Ürün adı |
| slug | String | ✅ | URL-friendly slug |
| originalPrice | Number | ✅ | Orijinal fiyat |
| discountPrice | Number | ✅ | İndirimli fiyat |
| category | String | ✅ | Kategori |
| merchantName | String | ✅ | İşletme adı |
| merchantPhone | String | ✅ | Telefon |
| merchantWhatsApp | String | ❌ | WhatsApp |
| seoTitle | String | ✅ | SEO başlığı |
| seoDescription | String | ✅ | SEO açıklaması |
| seoKeywords | String | ✅ | SEO anahtar kelimeleri |
| openGraphImage | String | ❌ | OG resmi (sosyal medya) |
| views | Number | ✅ | Görüntülenme sayısı |
| shares | Number | ✅ | Paylaşım sayısı |
| isActive | Boolean | ✅ | Yayında mı? |
| publishMode | String | ✅ | global / local |
| latitude | Number | ❌ | Konum (enlim) |
| longitude | Number | ❌ | Konum (boyam) |
| radiusKm | Number | ❌ | Etki alanı (km) |
| publishedAt | Timestamp | ✅ | Yayın tarihi |
| createdAt | Timestamp | ✅ | Oluşturma tarihi |
| updatedAt | Timestamp | ✅ | Son güncellenme |

**Indeksler (Önerilir):**
- `isActive` (filtering için)
- `publishMode` (filtering için)
- `publishedAt` (sorting için)

---

### 6. **users/{lisans_anahtarı}/sales/{saleId}** (İsteğe Bağlı)

**Amaç:** Satış kayıtları, gelir takibi

**Firestore Document:**
```json
{
  "date": Timestamp,
  "items": [
    {
      "productId": "prod_1234567890",
      "productName": "Domates",
      "quantity": 5,
      "unitPrice": 45.99,
      "totalPrice": 229.95
    }
  ],
  "totalAmount": 229.95,
  "paymentMethod": "Nakit",
  "notes": "Komşu Ayşe'den",
  "createdAt": Timestamp
}
```

---

### 7. **users/{lisans_anahtarı}/expenses/{expenseId}** (İsteğe Bağlı)

**Amaç:** Gider kayıtları (kira, elektrik, vb.)

**Firestore Document:**
```json
{
  "date": Timestamp,
  "category": "Kira",
  "amount": 5000,
  "description": "Dükkân kirasının 2025 Ocak ödemesi",
  "notes": "Landlord'a nakit ödendi",
  "createdAt": Timestamp
}
```

---

## Firestore Security Rules (Test Mode → Production)

### Test Mode (Şu an - Tüm veri açık)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Production Mode (userId Izolasyonu - Faz 5'te uygulanacak)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcı kendi verisine erişebilir
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Public discounts herkes okuyabilir
    match /users/{userId}/publicDiscounts/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## Firestore Kapasiteleri & Limitler

| Metrik | Limit | Not |
|--------|-------|-----|
| Document size | 1 MB | Ürün/kampanya verileri rahat |
| Sub-collection depth | Unlimited | Önerilen: 3 seviye |
| Write rate | 1,000/saniye | Ücretsiz tier: ~1,500/gün |
| Read rate | 50,000/gün | Ücretsiz tier yeterli |
| Storage | 1 GB free | Başlanğıç için ideal |
| Daily backups | Otomatik | Firestore tarafından yapılır |

---

## İndeksler (Firestore Console'da oluşturulacak)

Aşağıdaki sorguları optimize etmek için:

```javascript
// Örnek: Belirli tarihten sonra yapılan kampanyaları listele
db.collection("users")
  .doc(userId)
  .collection("campaigns")
  .where("createdAt", ">=", startDate)
  .orderBy("createdAt", "desc")
  .get();
```

**Gerekli İndeksler:**
1. `campaigns` collection: createdAt (Ascending)
2. `products` collection: stockQuantity (Ascending)
3. `publicDiscounts` collection: isActive, publishedAt
4. `customers` collection: segment, isSubscribed

---

## Yazma Operasyonları Optimizasyonu

### Batch Writes (Çok sayıda doküman yazılacaksa)
```typescript
const batch = db.batch();

// Mehrere Dokumente schreiben
batch.set(db.collection("users").doc(userId).collection("products").doc(prodId), data);
batch.set(db.collection("users").doc(userId).collection("campaigns").doc(campId), data);

await batch.commit(); // Atomik işlem
```

### Transaction (Okuma + Yazma birlikte)
```typescript
await db.runTransaction(async (transaction) => {
  const doc = await transaction.get(docRef);
  const newValue = doc.data().value + 1;
  transaction.update(docRef, { value: newValue });
});
```

---

## Veri Taşıma Planı (db_data.json → Firestore)

### Senaryo 1: Test/Demo Verisi Yok
Eğer `db_data.json` boş ise → **Direkt Firestore'a başla** ✅

### Senaryo 2: Mevcut Veriler Varsa

**Migration Script Kullanılacak:**
```typescript
// scripts/migrate-firestore.ts

import * as fs from 'fs';
import * as admin from 'firebase-admin';

const oldData = JSON.parse(fs.readFileSync('db_data.json', 'utf-8'));

const DEMO_USER_ID = 'demo_merchant_001'; // Tüm verileri bu kullanıcıya taşı

// Products
for (const product of oldData.products || []) {
  await admin.firestore()
    .collection('users')
    .doc(DEMO_USER_ID)
    .collection('products')
    .doc(product.id)
    .set(product);
}

// Benzer şekilde campaigns, publicDiscounts, vb.
```

---

## Sonraki Adımlar (Faz 2)

1. ✅ **src/lib/firebase.ts** ile Firestore bağlantı
2. ❌ **server-firestore.ts** → **server.ts** olarak aktiflestir
3. ❌ **Frontend** güncelle (Authorization header)
4. ❌ **AI Content Engine, Sitemap** entegrasyonu
5. ❌ **Security Rules** (Test → Production)

---

## Kontrol Listesi (Senden)

- [ ] Firestore collections manual olarak oluşturdum (Console'da)
- [ ] Örnek dokuman girdim ve yapı doğruladım
- [ ] Migration planını anladım
- [ ] Test Mode'u onayladım (Faz 5'te Production geçecek)
- [ ] Backend kodlamaya devam edebilirim ✅

---

**Onay:** Yukarıdaki şema ve yapıyı onayladığınızda, Faz 2'ye başlayabilirim.
