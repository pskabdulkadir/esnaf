/**
 * ACIL FİX: Pazarlama Vitrininde Kayıp Ürün Kurtarma
 * 
 * SORUN:
 * - Kullanıcı ürünleri userId: license_AE3C8E03B175FA2A_unknown ile kaydetti
 * - Şimdi sistem fallback userId kullanıyor: user_4956C39550333A28_zeqn03ik0
 * - Firestore'daki ürünler eski ID altında, yeni ID altında aranıyor
 * 
 * ÇÖZÜM:
 * - Tüm publicDiscounts koleksiyonlarını tara
 * - Her discountı users/{userId}/publicDiscounts altında bul
 * - MachineID eşleşmelerine göre konsolide et
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Env variables'ı yükle (.env dosyasından)
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log(`📄 .env dosyası yükleniyor: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(`⚠️ .env dosyası bulunamadı: ${envPath}`);
  // .env.local'ı dene
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    console.log(`📄 .env.local dosyası yükleniyor: ${envLocalPath}`);
    dotenv.config({ path: envLocalPath });
  }
}

// Firebase Admin SDK başlat
let db: admin.firestore.Firestore | null = null;

async function initializeFirebase() {
  try {
    console.log('🔥 Firebase başlatılıyor...');

    // Env variables kontrol et
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const clientId = process.env.FIREBASE_CLIENT_ID;

    console.log('📋 Env Variables:');
    console.log(`  - FIREBASE_PROJECT_ID: ${projectId ? '✅' : '❌'}`);
    console.log(`  - FIREBASE_PRIVATE_KEY_ID: ${privateKeyId ? '✅' : '❌'}`);
    console.log(`  - FIREBASE_PRIVATE_KEY: ${privateKey ? `✅ (${privateKey.length} chars)` : '❌'}`);
    console.log(`  - FIREBASE_CLIENT_EMAIL: ${clientEmail ? '✅' : '❌'}`);
    console.log(`  - FIREBASE_CLIENT_ID: ${clientId ? '✅' : '❌'}`);

    // Tüm gerekli variables olması gerekiyor
    if (!projectId || !privateKey || !clientEmail) {
      throw new Error(
        `Firebase credentials eksik!\n` +
        `  - FIREBASE_PROJECT_ID: ${projectId ? '✓' : '✗'}\n` +
        `  - FIREBASE_PRIVATE_KEY: ${privateKey ? '✓' : '✗'}\n` +
        `  - FIREBASE_CLIENT_EMAIL: ${clientEmail ? '✓' : '✗'}\n\n` +
        `Lütfen .env dosyasında bu değerleri kontrol et.`
      );
    }

    const serviceAccount: any = {
      projectId,
      privateKeyId,
      privateKey: privateKey.replace(/\\n/g, '\n'),
      clientEmail,
      clientId,
      authUri: 'https://accounts.google.com/o/oauth2/auth',
      tokenUri: 'https://oauth2.googleapis.com/token',
    };

    try {
      // Admin SDK'yı başlat (eğer başlatılmamışsa)
      if (!admin.apps || admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin SDK başlatıldı');
      } else {
        console.log('ℹ️  Firebase Admin SDK zaten başlatılmış');
      }
    } catch (appErr) {
      // App zaten başlatılmış olabilir
      console.log('ℹ️  Firebase App initialization:', String(appErr).substring(0, 100));
    }

    db = admin.firestore();
    console.log('✅ Firestore bağlantısı sağlandı');
    return true;
  } catch (err) {
    console.error('❌ Firebase başlatma hatası:', err);
    return false;
  }
}

interface PublicDiscount {
  id: string;
  slug: string;
  userId: string;
  productName: string;
  isActive: boolean;
  publishedAt: string;
  [key: string]: any;
}

async function findAllDiscountsByMachinePattern(machineIdPrefix: string) {
  if (!db) return [];

  const discounts: Array<{ userId: string; discount: PublicDiscount; docRef: admin.firestore.DocumentReference }> = [];

  try {
    console.log(`\n🔍 MachineID prefix '${machineIdPrefix}' ile ürünleri aranıyor...`);

    // Tüm users koleksiyonunu tara
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Toplam ${usersSnapshot.size} kullanıcı bulundu`);

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      // Her user'ın publicDiscounts koleksiyonunu kontrol et
      const discountsSnapshot = await userDoc.ref.collection('publicDiscounts').get();

      if (discountsSnapshot.size > 0) {
        console.log(`  📦 ${userId}: ${discountsSnapshot.size} indirim bulundu`);

        for (const discountDoc of discountsSnapshot.docs) {
          const discount = discountDoc.data() as PublicDiscount;

          // userId'nin machineID prefix'ine bakıyoruz
          // Örn: license_AE3C8E03B175FA2A_unknown → prefix = AE3C8E03B175FA2A
          if (
            userId.includes(machineIdPrefix) ||
            discount.userId?.includes(machineIdPrefix) ||
            userId.includes('license_AE3C8E03B175FA2A')
          ) {
            discounts.push({
              userId,
              discount: { id: discountDoc.id, ...discount },
              docRef: discountDoc.ref,
            });
          }
        }
      }
    }

    console.log(`\n✅ ${discounts.length} indirim bulundu`);
    return discounts;
  } catch (err) {
    console.error('❌ Arama hatası:', err);
    return [];
  }
}

async function migrateDiscountToNewUser(
  oldUserId: string,
  newUserId: string,
  discount: PublicDiscount
) {
  if (!db) return false;

  try {
    console.log(`  🚀 ${discount.productName} ürünü migrasyon ediliyor...`);

    // Yeni location'da oluştur
    const newDocRef = db
      .collection('users')
      .doc(newUserId)
      .collection('publicDiscounts')
      .doc(discount.id);

    // Güncellenmiş userId ile kaydet
    const updatedDiscount = {
      ...discount,
      userId: newUserId,
      migratedAt: new Date().toISOString(),
      migratedFrom: oldUserId,
    };

    await newDocRef.set(updatedDiscount);
    console.log(`     ✅ Yeni location'a yazıldı: /users/${newUserId}/publicDiscounts/${discount.id}`);

    // Eski location'dan sil
    const oldDocRef = db
      .collection('users')
      .doc(oldUserId)
      .collection('publicDiscounts')
      .doc(discount.id);

    await oldDocRef.delete();
    console.log(`     🗑️  Eski location'dan silindi: /users/${oldUserId}/publicDiscounts/${discount.id}`);

    return true;
  } catch (err) {
    console.error(`     ❌ Migrasyon hatası:`, err);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🔧 FIRESTORE ÜRÜN RECOVERY MİGRASYON SCRIPTI              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Firebase bağlantısı
  const connected = await initializeFirebase();
  if (!connected) {
    console.error('❌ Firebase bağlantısı başarısız');
    process.exit(1);
  }

  // MachineID prefix'i - eski userId'nin machineID kısmı
  // Örn: license_AE3C8E03B175FA2A_unknown → AE3C8E03B175FA2A
  const oldMachineIdPrefix = 'AE3C8E03B175FA2A';
  const newUserId = 'user_4956C39550333A28_zeqn03ik0';

  console.log('\n📋 Taşınacak Ürün Bulma:');
  console.log(`   • MachineID: ${oldMachineIdPrefix}`);
  console.log(`   • Hedef userId: ${newUserId}`);
  console.log('');

  // Eski machineID'ye ait tüm discountları bul
  const discountsToMigrate = await findAllDiscountsByMachinePattern(oldMachineIdPrefix);

  if (discountsToMigrate.length === 0) {
    console.log('✅ Migrasyon yapılacak ürün yok!');
    process.exit(0);
  }

  // Detaylı bilgi göster
  console.log('\n📦 Migrasyon Edilecek Ürünler:');
  for (const item of discountsToMigrate) {
    console.log(`  • "${item.discount.productName}" (${item.discount.id})`);
    console.log(`    - Geçerli userId: ${item.userId}`);
    console.log(`    - Slug: ${item.discount.slug}`);
    console.log(`    - İnceleme: ${item.discount.views || 0}, Tıklama: ${item.discount.shares || 0}`);
  }

  // Onay al
  console.log(`\n⚠️  ${discountsToMigrate.length} ürün migrasyon edilecek.`);
  console.log('Devam etmek istediğinize emin misiniz? (evet için ENTER tuşuna basın)');

  // Otomatik devam (non-interactive mode için)
  const isInteractive = process.stdin.isTTY;
  if (!isInteractive) {
    console.log('🤖 Non-interactive mod - Devam ediliyor...\n');
  }

  // Migrasyon başla
  console.log('\n🚀 Migrasyon Başlıyor...\n');

  let migratedCount = 0;
  let failedCount = 0;

  for (const item of discountsToMigrate) {
    const success = await migrateDiscountToNewUser(
      item.userId,
      newUserId,
      item.discount
    );

    if (success) {
      migratedCount++;
    } else {
      failedCount++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Sonuç
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ MİGRASYON TAMAMLANDI                                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Sonuçlar:`);
  console.log(`  • ✅ Başarılı: ${migratedCount}`);
  console.log(`  • ❌ Başarısız: ${failedCount}`);
  console.log(`  • 📦 Toplam: ${discountsToMigrate.length}`);

  if (failedCount === 0) {
    console.log('\n🎉 Tüm ürünler başarıyla migrasyon edildi!');
    console.log(`   Ürünler artık şu adreste bulunmaktadır:`);
    console.log(`   /users/${newUserId}/publicDiscounts/*`);
  } else {
    console.log(`\n⚠️  ${failedCount} ürün migrasyon sırasında hata ile karşılaştı.`);
    console.log('   Lütfen hata loglarını kontrol edin.');
  }

  process.exit(failedCount > 0 ? 1 : 0);
}

// Çalıştır
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
