import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// FIREBASE INITIALIZE
// ============================================

const serviceAccount: any = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
  authUri: 'https://accounts.google.com/o/oauth2/auth',
  tokenUri: 'https://oauth2.googleapis.com/token',
};

console.log('🔧 Firebase credentials kontrol ediliyor...');
if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
  console.error('❌ Firebase credentials eksik. .env dosyasını kontrol edin.');
  console.error('Beklenen: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
  process.exit(1);
}

try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  console.log('✅ Firebase initialized\n');
} catch (err) {
  console.error('❌ Firebase initialization failed:', err);
  process.exit(1);
}

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
    console.log('🎉 Doğrudan Firestore\'dan başlamaya hazırsınız.\n');
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
  const DEMO_USER_ID = 'default_merchant';
  console.log(`👤 Hedef User ID: ${DEMO_USER_ID}\n`);

  let migratedCount = 0;

  try {
    // ============ SETTINGS ============
    if (oldData.settings && Object.keys(oldData.settings).length > 0) {
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
          lastUpdated: product.lastUpdated
            ? admin.firestore.Timestamp.fromDate(new Date(product.lastUpdated))
            : admin.firestore.FieldValue.serverTimestamp(),
          createdAt: product.createdAt
            ? admin.firestore.Timestamp.fromDate(new Date(product.createdAt))
            : admin.firestore.FieldValue.serverTimestamp()
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
          createdAt: customer.createdAt
            ? admin.firestore.Timestamp.fromDate(new Date(customer.createdAt))
            : admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: customer.updatedAt
            ? admin.firestore.Timestamp.fromDate(new Date(customer.updatedAt))
            : admin.firestore.FieldValue.serverTimestamp()
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
          createdAt: campaign.createdAt
            ? admin.firestore.Timestamp.fromDate(new Date(campaign.createdAt))
            : admin.firestore.FieldValue.serverTimestamp(),
          approvedAt: campaign.approvedAt
            ? admin.firestore.Timestamp.fromDate(new Date(campaign.approvedAt))
            : null,
          updatedAt: campaign.updatedAt
            ? admin.firestore.Timestamp.fromDate(new Date(campaign.updatedAt))
            : admin.firestore.FieldValue.serverTimestamp()
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
          publishedAt: discount.publishedAt
            ? admin.firestore.Timestamp.fromDate(new Date(discount.publishedAt))
            : admin.firestore.FieldValue.serverTimestamp(),
          createdAt: discount.createdAt
            ? admin.firestore.Timestamp.fromDate(new Date(discount.createdAt))
            : admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: discount.updatedAt
            ? admin.firestore.Timestamp.fromDate(new Date(discount.updatedAt))
            : admin.firestore.FieldValue.serverTimestamp()
        });
      });

      await batch.commit();
      migratedCount += oldData.publicDiscounts.length;
      console.log(`✅ ${oldData.publicDiscounts.length} indirim taşındı\n`);
    }

    // ============ BACKUP ============
    console.log('💾 db_data.json yedeği yapılıyor...');
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
    console.log('\n✅ Artık Firestore\'dan veri okumaya başlayabilirsiniz!');
    console.log('\nSonraki adımlar:');
    console.log('1. src/lib/firebase.ts bağlantısı test et');
    console.log('2. server.ts → Firestore API endpoints');
    console.log('3. Frontend Authorization header ekle');
    console.log('4. npm start ile sunucuyu başlat\n');

    process.exit(0);

  } catch (err) {
    console.error('❌ Migration başarısız:', err);
    process.exit(1);
  }
}

// Çalıştır
migrateToFirestore();
