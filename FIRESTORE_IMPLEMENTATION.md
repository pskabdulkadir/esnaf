# 🚀 Firebase Migration - Detaylı Implementasyon Planı

## Durum
Faz 1 (Şema Tasarımı) tamamlandı. Şimdi **Faz 2: Backend Kodlama** başlayacak.

---

## ✅ Ön Koşullar (SİZ Yapmış Olmalısınız)

- [ ] Firebase Console'dan project oluşturdum
- [ ] Firestore Database oluşturdum (Production Mode)
- [ ] Service Account Private Key indirdim
- [ ] Firestore Database URL'sini aldım
- [ ] Security Rules kopyaladım (firestore.rules)

### Firebase Bilgileriniz:
```
Firestore Database URL: https://[PROJECT-ID].firebaseio.com
Service Account Key: /path/to/serviceAccountKey.json (Git'e yüklemeyin!)
```

---

## Faz 2: Backend Kodlama

### 2.1 Paket Kurulumu

```bash
npm install firebase-admin
npm install --save-dev @types/firebase-admin
```

### 2.2 .env Dosyası (Güncelleme)

```env
# Render / Deployment
PORT=3000
RENDER=true

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

### 2.3 Yeni Dosya: `src/lib/firebase.ts`

```typescript
import * as admin from 'firebase-admin';

// Service Account credentials'ı env'den oku
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
  authUri: process.env.FIREBASE_AUTH_URI,
  tokenUri: process.env.FIREBASE_TOKEN_URI,
};

// Firebase Admin SDK'yı initialize et
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

export default admin;
```

---

## Faz 3: Server.ts Kodlama

### 3.1 İmport'lar (Değişme)

```typescript
// ESKI
import fs from "fs";
import path from "path";

// YENİ
import { db } from "./lib/firebase";
import { FieldValue } from "firebase-admin/firestore";
```

### 3.2 Veri Okuma Fonksiyonları (Yeni)

```typescript
// User verilerini Firestore'dan oku
async function getUserData(userId: string) {
  try {
    const userRef = db.collection('users').doc(userId);
    const settingsDoc = await userRef.collection('data').doc('user_data').get();
    
    const settings = settingsDoc.exists ? settingsDoc.data() : {};
    
    return {
      settings,
      userId
    };
  } catch (err) {
    console.error('Error reading user data', err);
    throw new Error('Veri okunamadı');
  }
}

// Kullanıcının ürünlerini oku
async function getUserProducts(userId: string) {
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('products')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error('Error reading products', err);
    throw new Error('Ürünler okunamadı');
  }
}

// Kullanıcının kampanyalarını oku
async function getUserCampaigns(userId: string) {
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('campaigns')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error('Error reading campaigns', err);
    throw new Error('Kampanyalar okunamadı');
  }
}

// Kullanıcının halka açık indirimlerini oku
async function getUserPublicDiscounts(userId: string) {
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('publicDiscounts')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error('Error reading public discounts', err);
    throw new Error('Halka açık indirimler okunamadı');
  }
}
```

### 3.3 Veri Yazma Fonksiyonları (Yeni)

```typescript
// Ürün kaydet
async function saveProduct(userId: string, productId: string, data: any) {
  try {
    await db
      .collection('users')
      .doc(userId)
      .collection('products')
      .doc(productId)
      .set(data, { merge: true });
    
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error saving product', err);
    return { success: false, error: errorMsg };
  }
}

// Kampanya kaydet
async function saveCampaign(userId: string, campaignId: string, data: any) {
  try {
    await db
      .collection('users')
      .doc(userId)
      .collection('campaigns')
      .doc(campaignId)
      .set(data, { merge: true });
    
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error saving campaign', err);
    return { success: false, error: errorMsg };
  }
}

// Public discount kaydet
async function savePublicDiscount(userId: string, discountId: string, data: any) {
  try {
    await db
      .collection('users')
      .doc(userId)
      .collection('publicDiscounts')
      .doc(discountId)
      .set({
        ...data,
        createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error saving public discount', err);
    return { success: false, error: errorMsg };
  }
}

// Sil
async function deleteDocument(userId: string, collection: string, documentId: string) {
  try {
    await db
      .collection('users')
      .doc(userId)
      .collection(collection)
      .doc(documentId)
      .delete();
    
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error deleting document', err);
    return { success: false, error: errorMsg };
  }
}
```

---

## Faz 4: API Endpoints (Express Routes)

### 4.1 Authentication Middleware (Gerekli)

```typescript
// Middleware: Lisans anahtarını al (Authorization header'dan)
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    req.user = { userId: authHeader.slice(7) };
  } else {
    req.user = null;
  }
  next();
});

// Auth guard middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.user?.userId) {
    return res.status(401).json({ error: 'Yetkilendirme gerekli' });
  }
  next();
}
```

### 4.2 Products API (Güncellenmiş)

```typescript
// GET /api/products
app.get('/api/products', requireAuth, async (req, res) => {
  try {
    const products = await getUserProducts(req.user.userId);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Hata oluştu' });
  }
});

// POST /api/products
app.post('/api/products', requireAuth, async (req, res) => {
  try {
    if (!req.body.name || typeof req.body.name !== 'string') {
      return res.status(400).json({ error: 'Ürün adı gereklidir' });
    }

    const productId = 'prod_' + Date.now();
    const data = {
      ...req.body,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const result = await saveProduct(req.user.userId, productId, data);
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json({ id: productId, ...data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Hata oluştu' });
  }
});

// PUT /api/products/:id
app.put('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const result = await saveProduct(req.user.userId, req.params.id, {
      ...req.body,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Hata oluştu' });
  }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const result = await deleteDocument(req.user.userId, 'products', req.params.id);
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Hata oluştu' });
  }
});
```

### 4.3 Public Discounts API (Güncellenmiş)

```typescript
// GET /api/public-discounts (halka açık, auth gerekli değil)
app.get('/api/public-discounts', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'userId gerekli' });
    }

    const discounts = await getUserPublicDiscounts(userId);
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Hata oluştu' });
  }
});

// POST /api/public-discounts (Kampanya yayınla)
app.post('/api/public-discounts', requireAuth, async (req, res) => {
  try {
    const { productId, originalPrice, discountPrice, seoTitle, seoDescription } = req.body;

    if (!productId || !originalPrice || !discountPrice) {
      return res.status(400).json({ error: 'Eksik alan' });
    }

    const discountId = 'discount_' + Date.now();
    const result = await savePublicDiscount(req.user.userId, discountId, {
      ...req.body,
      isActive: true,
      views: 0,
      shares: 0
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json({ id: discountId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Hata oluştu' });
  }
});

// PUT /api/public-discounts/:id
app.put('/api/public-discounts/:id', requireAuth, async (req, res) => {
  try {
    const result = await savePublicDiscount(req.user.userId, req.params.id, req.body);
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Hata oluştu' });
  }
});

// DELETE /api/public-discounts/:id
app.delete('/api/public-discounts/:id', requireAuth, async (req, res) => {
  try {
    const result = await deleteDocument(req.user.userId, 'publicDiscounts', req.params.id);
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Hata oluştu' });
  }
});
```

---

## Faz 5: Frontend Değişiklikleri

### 5.1 Authorization Header Ekleme

Tüm API çağrılarında lisans anahtarını gönder:

```typescript
// Örnek
const userId = localStorage.getItem('userId'); // veya prop'tan al

const response = await fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${userId}`
  }
});
```

### 5.2 Backup/Restore Fonksiyonları (YENİ)

```typescript
// Verimi İndir (JSON export)
async function downloadBackup(userId: string) {
  try {
    const products = await getUserProducts(userId);
    const campaigns = await getUserCampaigns(userId);
    const discounts = await getUserPublicDiscounts(userId);
    const settings = await getUserData(userId);

    const backup = {
      products,
      campaigns,
      publicDiscounts: discounts,
      settings,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${userId}_${Date.now()}.json`;
    a.click();
  } catch (err) {
    console.error('Backup indir hatası', err);
  }
}

// Verimi Yükle (JSON import)
async function uploadBackup(userId: string, file: File) {
  try {
    const text = await file.text();
    const backup = JSON.parse(text);

    // Her veriyi Firestore'a yaz
    for (const product of backup.products || []) {
      await saveProduct(userId, product.id, product);
    }
    for (const campaign of backup.campaigns || []) {
      await saveCampaign(userId, campaign.id, campaign);
    }
    for (const discount of backup.publicDiscounts || []) {
      await savePublicDiscount(userId, discount.id, discount);
    }

    console.log('Backup başarıyla yüklendi');
  } catch (err) {
    console.error('Backup yükle hatası', err);
  }
}
```

---

## Faz 6: Migration Script (Opsiyonel)

Eğer mevcut db_data.json'dan Firestore'a geçiş yapmak istiyorsanız:

```typescript
// scripts/migrate-to-firestore.ts

import * as fs from 'fs';
import * as admin from 'firebase-admin';

async function migrate() {
  // 1. db_data.json oku
  const oldData = JSON.parse(
    fs.readFileSync('db_data.json', 'utf-8')
  );

  // 2. Firestore'a yaz
  // (Hangi userId için? İlk başta tek bir kullanıcı olabilir)
  const userId = 'default_user'; // AYARLANACAK

  // Products
  for (const product of oldData.products || []) {
    await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('products')
      .doc(product.id)
      .set(product);
  }

  console.log('✅ Migration tamamlandı');
}

migrate().catch(err => {
  console.error('Migration hatası:', err);
  process.exit(1);
});
```

---

## ✅ Sonraki Adımlar

1. **Firebase Kurulumunu onaylayın** (Project ID, Service Account Key)
2. **Security Rules'u Firebase Console'a kopyalayın**
3. **Faz 2 kodlamaya başlayın:**
   - `src/lib/firebase.ts` oluştur
   - `server.ts` güncelle (imports, endpoints)
   - Auth middleware ekle
4. **Faz 3'ü test edin:**
   - Health endpoint çalışıyor mu?
   - API'lar veri yazabiliyor mu?
5. **Faz 4: Frontend entegrasyonu**
6. **Faz 5: Production deployment (Render)**

---

## 🚨 Önemli Hatırlatmalar

- ❌ Service Account Key'i Git'e yüklemeyin (`.gitignore`'a ekleyin)
- ✅ `.env.example` oluşturun (açık şekilde)
- ✅ Firestore ücretsiz planında sınırlar var (okuma/yazma)
- ✅ Render'da `FIREBASE_*` env variables'ı ayarlayın
