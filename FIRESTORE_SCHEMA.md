# 🔥 Firestore Veri Şeması & Migration Planı

## Durum
**Mevcut:** db_data.json (dosya tabanlı)
**Hedef:** Google Firestore (bulut tabanlı, kullanıcı kontrolü korunan)

---

## Faz 1: Firestore Koleksiyon Yapısı

### Hedef Mimari
```
Firestore Database
├── users/{lisans_anahtarı}
│   ├── data/
│   │   └── user_data (ayarlar, config metadatası)
│   ├── products/{productId}
│   ├── customers/{customerId}
│   ├── campaigns/{campaignId}
│   ├── sales/{saleId}
│   ├── expenses/{expenseId}
│   └── publicDiscounts/{discountId}
```

---

## Veri Yapıları: JSON → Firestore Eşlemesi

### 1. Ayarlar (Settings)
**Mevcut (db_data.json):**
```json
{
  "settings": {
    "language": "tr",
    "merchantName": "Bizim Mahalle İşletmesi",
    "merchantPhone": "+90 532 111 2233",
    "merchantWhatsApp": "+90 532 111 2233"
  }
}
```

**Firestore:**
```
users/{lisans_anahtarı}/data/user_data
{
  "language": "tr",
  "merchantName": "Bizim Mahalle İşletmesi",
  "merchantPhone": "+90 532 111 2233",
  "merchantWhatsApp": "+90 532 111 2233",
  "updatedAt": Timestamp,
  "createdAt": Timestamp
}
```

---

### 2. Ürünler (Products)
**Mevcut:**
```json
{
  "id": "product_123",
  "name": "Domates",
  "price": 45.99,
  "stockQuantity": 10,
  "stockLimit": 50,
  "category": "Sebzeler",
  "expiryDate": "2025-01-15",
  "isSpecialDiscount": false,
  "lastUpdated": "2025-01-08T10:30:00Z"
}
```

**Firestore:**
```
users/{lisans_anahtarı}/products/{productId}
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

---

### 3. Müşteriler (Customers)
**Mevcut:**
```json
{
  "id": "customer_456",
  "fullName": "Ayşe Yılmaz",
  "phone": "+90 505 123 4567",
  "segment": "Ev Hanımları",
  "isSubscribed": true,
  "notes": "WhatsApp ile iletişim tercih ediyor"
}
```

**Firestore:**
```
users/{lisans_anahtarı}/customers/{customerId}
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

---

### 4. Kampanyalar (Campaigns)
**Mevcut:**
```json
{
  "id": "campaign_789",
  "productId": "product_123",
  "productName": "Domates",
  "originalPrice": 45.99,
  "discountPrice": 35.99,
  "targetSegment": "Ev Hanımları",
  "messageContent": "Bu hafta domates indirimde!",
  "deliveryTime": "16:00 - 18:00 (Akşam yemeği öncesi)",
  "status": "Gönderildi",
  "createdAt": "2025-01-08T10:30:00Z",
  "approvedAt": "2025-01-08T11:00:00Z",
  "sentCount": 125,
  "logs": ["2025-01-08 11:00 - 125 kişiye gönderildi"]
}
```

**Firestore:**
```
users/{lisans_anahtarı}/campaigns/{campaignId}
{
  "productId": "product_123",
  "productName": "Domates",
  "originalPrice": 45.99,
  "discountPrice": 35.99,
  "targetSegment": "Ev Hanımları",
  "messageContent": "Bu hafta domates indirimde!",
  "deliveryTime": "16:00 - 18:00 (Akşam yemeği öncesi)",
  "status": "Gönderildi",
  "sentCount": 125,
  "logs": ["2025-01-08 11:00 - 125 kişiye gönderildi"],
  "createdAt": Timestamp,
  "approvedAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

### 5. Halka Açık İndirimler (Public Discounts)
**Mevcut:**
```json
{
  "id": "discount_xyz",
  "productId": "product_123",
  "productName": "Domates",
  "slug": "domates-indirim-2025",
  "originalPrice": 45.99,
  "discountPrice": 35.99,
  "category": "Sebzeler",
  "merchantName": "Bizim Mahalle İşletmesi",
  "merchantPhone": "+90 532 111 2233",
  "merchantWhatsApp": "+90 532 111 2233",
  "seoTitle": "En İyi Domates İndirim Fiyatı",
  "seoDescription": "Taze domates, en uygun fiyatla",
  "seoKeywords": "domates, indirim, taze",
  "openGraphImage": "https://...",
  "views": 234,
  "shares": 12,
  "isActive": true,
  "publishedAt": "2025-01-08T10:30:00Z",
  "publishMode": "global",
  "latitude": 41.0082,
  "longitude": 28.9784,
  "radiusKm": 5
}
```

**Firestore:**
```
users/{lisans_anahtarı}/publicDiscounts/{discountId}
{
  "productId": "product_123",
  "productName": "Domates",
  "slug": "domates-indirim-2025",
  "originalPrice": 45.99,
  "discountPrice": 35.99,
  "category": "Sebzeler",
  "merchantName": "Bizim Mahalle İşletmesi",
  "merchantPhone": "+90 532 111 2233",
  "merchantWhatsApp": "+90 532 111 2233",
  "seoTitle": "En İyi Domates İndirim Fiyatı",
  "seoDescription": "Taze domates, en uygun fiyatla",
  "seoKeywords": "domates, indirim, taze",
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

---

### 6. Satışlar (Sales) - İsteğe Bağlı
**Firestore:**
```
users/{lisans_anahtarı}/sales/{saleId}
{
  "date": Timestamp,
  "items": [
    { "productId": "...", "quantity": 5, "price": 45.99 }
  ],
  "totalAmount": 229.95,
  "paymentMethod": "Nakit",
  "notes": "..."
}
```

---

### 7. Giderler (Expenses) - İsteğe Bağlı
**Firestore:**
```
users/{lisans_anahtarı}/expenses/{expenseId}
{
  "date": Timestamp,
  "category": "Kira",
  "amount": 5000,
  "description": "Dükkân kirasının 2025 Ocak ödemesi",
  "notes": "..."
}
```

---

## Faz 2: Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcı kendi verisine erişebilir
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Opsiyonel: Public reads için (sitemap, halka açık indirimler)
    match /users/{userId}/publicDiscounts/{discountId} {
      allow read: if true;  // Herkes okuyabilir
      allow write: if request.auth.uid == userId;  // Yazma sadece sahibi
    }
  }
}
```

---

## Faz 3: Migration Script Genel Yapısı

```typescript
// 1. db_data.json oku
const oldData = JSON.parse(fs.readFileSync('db_data.json', 'utf-8'));

// 2. Her kullanıcı (lisans_anahtarı) için:
for (const userId of users) {
  // 3. Settings → users/{userId}/data/user_data
  // 4. Products → users/{userId}/products/{id}
  // 5. Campaigns → users/{userId}/campaigns/{id}
  // ... vb.
}

// 4. Kontrol ve validasyon
// 5. Backup (gerekirse)
```

---

## Faz 4: Önemli Hususlar

1. **Lisans Anahtarı:**
   - Mevcut: Belirli bir kullanıcı ID formatı (örn: license_key_123)
   - Firebase'de: Document ID olarak kullanılacak
   - TypeScript: Custom claim veya doğrudan UID

2. **Offline Persistence:**
   - Firebase Web SDK'da `enablePersistence()` aktif edilecek
   - İnternet kesilse bile ürün ekleme devam edebilir

3. **Backup/Restore Özelliği (TUTULACAK):**
   - "Verimi İndir" → Firestore'daki veriyi JSON'a çevir, indir
   - "Verimi Yükle" → JSON'u Firestore'a geri yaz

4. **Sitemap & Public Discounts:**
   - Public discounts herkese görünebilir olmalı
   - Security rules'da `allow read: if true;` yapılacak

5. **Veri Taşıma Süreci:**
   - Yavaş yavaş (user by user) yapılabilir
   - Mevcut sistem paralel çalışabilir (hybrid mode)
   - Sonra db_data.json kaldırılabilir

---

## Sonraki Adım
Firebase proje bilgileriniz (URL, Service Account) hazır olduğunda:
- ✅ Faz 2: Backend Kod Değişiklikleri başlayabilir
