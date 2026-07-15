# 🔄 Firestore Migration Planı

## Durum
- **Mevcut:** db_data.json (dosya tabanlı, tek kullanıcı)
- **Hedef:** Firestore (bulut tabanlı, multi-tenant: `users/{userId}`)

---

## Senaryo Analizi

### Senaryo 1: db_data.json Boş (Önerilen - Prod için)
```json
{
  "products": [],
  "customers": [],
  "campaigns": [],
  "publicDiscounts": [],
  "settings": { ... }
}
```

**Aksiyonlar:**
✅ `db_data.json` kaldır
✅ Backend doğrudan Firestore'dan okumaya başla
✅ Migration script gerekmez
✅ Test Mode'da başla → Production Mode'a geç

**Süre:** 0 saatlik veri taşıma

---

### Senaryo 2: db_data.json'da Eski Veriler Varsa

**Örnek Eski Veri:**
```json
{
  "products": [
    { "id": "prod-1704767400000", "name": "Domates", "price": 45.99, ... }
  ],
  "campaigns": [
    { "id": "camp-1704767400000", "productId": "prod-1704767400000", ... }
  ],
  "publicDiscounts": [
    { "id": "discount-xyz", "productId": "prod-1704767400000", ... }
  ],
  "settings": { "merchantName": "Bizim Mahalle", ... }
}
```

**Aksiyonlar:**
1. Migration script çalıştır
2. Verileri Firestore'a taşı
3. Integrity kontrol (tüm kayıtlar taşındı mı?)
4. db_data.json sil

**Süre:** 1-2 saat (veri boyutuna göre)

---

## Migration Script: Detaylı Tasarım

### 1. Script Yüklenmesi
```bash
npm install --save-dev ts-node
```

### 2. Script Dosyası: `scripts/migrate-to-firestore.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Firebase Initialize
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
  authUri: 'https://accounts.google.com/o/oauth2/auth',
  tokenUri: 'https://oauth2.googleapis.com/token',
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

// ============================================
// MIGRATION SCRIPT
// ============================================

async function migrateToFirestore() {
  console.log('🔄 Firebase Migration başlıyor...\n');

  // 1. Eski db_data.json'ı oku
  const dbPath = path.join(process.cwd(), 'db_data.json');
  if (!fs.existsSync(dbPath)) {
    console.log('✅ db_data.json mevcut değil - Fresh start!');
    process.exit(0);
  }

  let oldData: any;
  try {
    const rawData = fs.readFileSync(dbPath, 'utf-8');
    oldData = JSON.parse(rawData);
    console.log(`📂 db_data.json okundu (${JSON.stringify(oldData).length} bytes)`);
  } catch (err) {
    console.error('❌ db_data.json okunamadı:', err);
    process.exit(1);
  }

  // 2. Demo User ID'sini belirle
  const DEMO_USER_ID = 'default_merchant'; // Tek bir kullanıcı olarak migre et
  console.log(`👤 Hedef User ID: ${DEMO_USER_ID}\n`);

  let migratedCount = 0;

  try {
    // ============ SETTINGS ============
    if (oldData.settings) {
      console.log('⏳ Settings taşınıyor...');
      await db
        .collection('users')
        .doc(DEMO_USER_ID)
        .collection('data')
        .doc('user_data')
        .set({
          ...oldData.settings,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      console.log('✅ Settings taşındı\n');
    }

    // ============ PRODUCTS ============
    if (Array.isArray(oldData.products) && oldData.products.length > 0) {
      console.log(`⏳ ${oldData.products.length} ürün taşınıyor...`);
      const batch = db.batch();
      
      oldData.products.forEach((product: any, index: number) => {
        const docRef = db
          .collection('users')
          .doc(DEMO_USER_ID)
          .collection('products')
          .doc(product.id || `prod_${Date.now()}_${index}`);
        
        batch.set(docRef, {
          ...product,
          lastUpdated: admin.firestore.Timestamp.fromDate(
            product.lastUpdated ? new Date(product.lastUpdated) : new Date()
          ),
          createdAt: admin.firestore.Timestamp.fromDate(
            product.createdAt ? new Date(product.createdAt) : new Date()
          )
        });
      });

      await batch.commit();
      migratedCount += oldData.products.length;
      console.log(`✅ ${oldData.products.length} ürün taşındı\n`);
    }

    // ============ CUSTOMERS ============
    if (Array.isArray(oldData.customers) && oldData.customers.length > 0) {
      console.log(`⏳ ${oldData.customers.length} müşteri taşınıyor...`);
      const batch = db.batch();
      
      oldData.customers.forEach((customer: any, index: number) => {
        const docRef = db
          .collection('users')
          .doc(DEMO_USER_ID)
          .collection('customers')
          .doc(customer.id || `cust_${Date.now()}_${index}`);
        
        batch.set(docRef, {
          ...customer,
          createdAt: admin.firestore.Timestamp.fromDate(
            customer.createdAt ? new Date(customer.createdAt) : new Date()
          ),
          updatedAt: admin.firestore.Timestamp.fromDate(
            customer.updatedAt ? new Date(customer.updatedAt) : new Date()
          )
        });
      });

      await batch.commit();
      migratedCount += oldData.customers.length;
      console.log(`✅ ${oldData.customers.length} müşteri taşındı\n`);
    }

    // ============ CAMPAIGNS ============
    if (Array.isArray(oldData.campaigns) && oldData.campaigns.length > 0) {
      console.log(`⏳ ${oldData.campaigns.length} kampanya taşınıyor...`);
      const batch = db.batch();
      
      oldData.campaigns.forEach((campaign: any, index: number) => {
        const docRef = db
          .collection('users')
          .doc(DEMO_USER_ID)
          .collection('campaigns')
          .doc(campaign.id || `camp_${Date.now()}_${index}`);
        
        batch.set(docRef, {
          ...campaign,
          createdAt: admin.firestore.Timestamp.fromDate(
            campaign.createdAt ? new Date(campaign.createdAt) : new Date()
          ),
          approvedAt: campaign.approvedAt 
            ? admin.firestore.Timestamp.fromDate(new Date(campaign.approvedAt))
            : null,
          updatedAt: admin.firestore.Timestamp.fromDate(
            campaign.updatedAt ? new Date(campaign.updatedAt) : new Date()
          )
        });
      });

      await batch.commit();
      migratedCount += oldData.campaigns.length;
      console.log(`✅ ${oldData.campaigns.length} kampanya taşındı\n`);
    }

    // ============ PUBLIC DISCOUNTS ============
    if (Array.isArray(oldData.publicDiscounts) && oldData.publicDiscounts.length > 0) {
      console.log(`⏳ ${oldData.publicDiscounts.length} indirim taşınıyor...`);
      const batch = db.batch();
      
      oldData.publicDiscounts.forEach((discount: any, index: number) => {
        const docRef = db
          .collection('users')
          .doc(DEMO_USER_ID)
          .collection('publicDiscounts')
          .doc(discount.id || `discount_${Date.now()}_${index}`);
        
        batch.set(docRef, {
          ...discount,
          publishedAt: admin.firestore.Timestamp.fromDate(
            discount.publishedAt ? new Date(discount.publishedAt) : new Date()
          ),
          createdAt: admin.firestore.Timestamp.fromDate(
            discount.createdAt ? new Date(discount.createdAt) : new Date()
          ),
          updatedAt: admin.firestore.Timestamp.fromDate(
            discount.updatedAt ? new Date(discount.updatedAt) : new Date()
          )
        });
      });

      await batch.commit();
      migratedCount += oldData.publicDiscounts.length;
      console.log(`✅ ${oldData.publicDiscounts.length} indirim taşındı\n`);
    }

    // ============ BACKUP ============
    console.log('💾 db_data.json backup'ı yapılıyor...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupPath = path.join(process.cwd(), `.backups/db_data_${timestamp}.json`);
    const backupDir = path.join(process.cwd(), '.backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ Backup kaydedildi: ${backupPath}\n`);

    // ============ CLEANUP ============
    console.log('🗑️  db_data.json siliniyor...');
    fs.unlinkSync(dbPath);
    console.log('✅ db_data.json silindi\n');

    // ============ SUMMARY ============
    console.log('═════════════════════════════════════════');
    console.log('✅ MIGRATION BAŞARILI!');
    console.log('═════════════════════════════════════════');
    console.log(`📦 Taşınan toplam kayıt: ${migratedCount}`);
    console.log(`👤 Target User ID: ${DEMO_USER_ID}`);
    console.log(`💾 Backup: ${backupPath}`);
    console.log(`🔥 Firestore: siftah-app-v1`);
    console.log('\n✅ Artık Firestore'dan veri okumaya başlayabilirsiniz!');
    console.log('\nSonraki adımlar:');
    console.log('1. src/lib/firebase.ts bağlantısı kontrol et');
    console.log('2. server.ts → Firestore API endpoints');
    console.log('3. Frontend Authorization header ekle');

    process.exit(0);

  } catch (err) {
    console.error('❌ Migration başarısız:', err);
    process.exit(1);
  }
}

// Çalıştır
migrateToFirestore();
```

### 3. Migration Script Çalıştırma
```bash
# .env dosyasının kurulduğundan emin ol
npm run migrate-firestore
# veya
npx ts-node scripts/migrate-to-firestore.ts
```

### 4. Output Örneği
```
🔄 Firebase Migration başlıyor...

📂 db_data.json okundu (45280 bytes)
👤 Hedef User ID: default_merchant

⏳ Settings taşınıyor...
✅ Settings taşındı

⏳ 25 ürün taşınıyor...
✅ 25 ürün taşındı

⏳ 12 müşteri taşınıyor...
✅ 12 müşteri taşındı

⏳ 8 kampanya taşınıyor...
✅ 8 kampanya taşındı

⏳ 5 indirim taşınıyor...
✅ 5 indirim taşındı

💾 db_data.json backup'ı yapılıyor...
✅ Backup kaydedildi: .backups/db_data_2025-01-08T12-30-45.json

🗑️  db_data.json siliniyor...
✅ db_data.json silindi

═════════════════════════════════════════
✅ MIGRATION BAŞARILI!
═════════════════════════════════════════
📦 Taşınan toplam kayıt: 50
👤 Target User ID: default_merchant
💾 Backup: .backups/db_data_2025-01-08T12-30-45.json
🔥 Firestore: siftah-app-v1

✅ Artık Firestore'dan veri okumaya başlayabilirsiniz!

Sonraki adımlar:
1. src/lib/firebase.ts bağlantısı kontrol et
2. server.ts → Firestore API endpoints
3. Frontend Authorization header ekle
```

---

## Migration Öncesi Kontrol Listesi

- [ ] **Firebase projesi hazır mı?** (siftah-app-v1)
- [ ] **Service Account Key'i .env'ye ekledim mi?**
- [ ] **db_data.json'ı yedekledim mi?** (.backups'a)
- [ ] **Firestore'da yeterli write quota'nız var mı?**
- [ ] **Script başarısından emin olmak için test modu çalıştırdım mı?**

---

## Migration Sonrası Kontrol Listesi

- [ ] **Tüm veriler Firestore'a taşındı mı?**
- [ ] **Firestore Console'da collections görünüyor mu?**
- [ ] **db_data.json silindi mi?**
- [ ] **Backend Firestore'dan okumaya başladı mı?**
- [ ] **Frontend Authorization header'ı gönderiyor mu?**
- [ ] **Health endpoint çalışıyor mu?** (`GET /api/health`)

---

## Geri Dönüş Planı (Rollback)

Eğer migration başarısız olursa:

```bash
# 1. Backup'tan restore et
cp .backups/db_data_TIMESTAMP.json db_data.json

# 2. Firestore'daki yanlış verileri sil
# Firestore Console'da users/{DEMO_USER_ID} collection'ını sil

# 3. Script'i düzelt ve tekrar çalıştır
```

---

## Tahmini Migration Zamanı

| Veri Boyutu | Kayıt Sayısı | Tahmini Süre |
|-------------|-------------|-------------|
| < 100 KB | < 50 | 10 saniye |
| 100 KB - 1 MB | 50-500 | 30 saniye |
| 1 MB - 10 MB | 500-5000 | 2-3 dakika |
| > 10 MB | > 5000 | 5+ dakika |

---

## Alternatif: Google Cloud Datastore Import

Eğer çok büyük veri varsa, `gcloud` CLI kullanarak import et:

```bash
# 1. JSON'u Google Cloud Format'ına dönüştür
# 2. Cloud Console'dan Import et
# 3. Daha hızlı (1 MB/saniye)
```

---

## Sonraki Adımlar

Migration tamamlandıktan sonra:

1. ✅ **src/lib/firebase.ts** - Firestore bağlantısı
2. ✅ **server-firestore.ts** → **server.ts** değiştir
3. ❌ **Frontend** - Authorization header ekle
4. ❌ **Tests** - API endpoints kontrol et
5. ❌ **Deployment** - Render'da test et

---

**Not:** Migration script tamamen otomatik ve geri dönülebilir (backup sayesinde).
