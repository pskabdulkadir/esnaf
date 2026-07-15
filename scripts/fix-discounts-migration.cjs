#!/usr/bin/env node

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

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db = null;

async function initializeFirebase() {
  try {
    console.log('🔥 Firebase başlatılıyor...');
    
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

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error(
        `Firebase credentials eksik!\n` +
        `  - FIREBASE_PROJECT_ID: ${projectId ? '✓' : '✗'}\n` +
        `  - FIREBASE_PRIVATE_KEY: ${privateKey ? '✓' : '✗'}\n` +
        `  - FIREBASE_CLIENT_EMAIL: ${clientEmail ? '✓' : '✗'}\n\n` +
        `Lütfen .env dosyasında bu değerleri kontrol et.`
      );
    }

    const serviceAccount = {
      projectId,
      privateKeyId,
      privateKey: privateKey.replace(/\\n/g, '\n'),
      clientEmail,
      clientId,
      authUri: 'https://accounts.google.com/o/oauth2/auth',
      tokenUri: 'https://oauth2.googleapis.com/token',
    };

    // Admin SDK başlat
    if (!admin.apps || admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK başlatıldı');
    } else {
      console.log('ℹ️  Firebase Admin SDK zaten başlatılmış');
    }

    // Firestore bağlantısını kur
    db = admin.firestore();

    // Test et
    await db.collection('_health').doc('test').set({ timestamp: new Date() });

    console.log('✅ Firestore bağlantısı sağlandı ve test edildi');
    return true;
  } catch (err) {
    console.error('❌ Firebase başlatma hatası:', err.message);
    if (err.stack) console.error('   Stack:', err.stack.split('\n')[0]);
    return false;
  }
}

async function findAllDiscountsByMachinePattern(machineIdPrefix) {
  if (!db) return [];

  const discounts = [];

  try {
    console.log(`\n🔍 MachineID prefix '${machineIdPrefix}' ile ürünleri aranıyor...`);

    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Toplam ${usersSnapshot.size} kullanıcı bulundu`);

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      const discountsSnapshot = await userDoc.ref.collection('publicDiscounts').get();

      if (discountsSnapshot.size > 0) {
        console.log(`  📦 ${userId}: ${discountsSnapshot.size} indirim bulundu`);

        for (const discountDoc of discountsSnapshot.docs) {
          const discount = discountDoc.data();

          if (
            userId.includes(machineIdPrefix) ||
            (discount.userId && discount.userId.includes(machineIdPrefix)) ||
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
    console.error('❌ Arama hatası:', err.message);
    return [];
  }
}

async function migrateDiscountToNewUser(oldUserId, newUserId, discount) {
  if (!db) return false;

  try {
    console.log(`  🚀 ${discount.productName} ürünü migrasyon ediliyor...`);

    const newDocRef = db
      .collection('users')
      .doc(newUserId)
      .collection('publicDiscounts')
      .doc(discount.id);

    const updatedDiscount = {
      ...discount,
      userId: newUserId,
      migratedAt: new Date().toISOString(),
      migratedFrom: oldUserId,
    };

    await newDocRef.set(updatedDiscount);
    console.log(`     ✅ Yeni location'a yazıldı: /users/${newUserId}/publicDiscounts/${discount.id}`);

    const oldDocRef = db
      .collection('users')
      .doc(oldUserId)
      .collection('publicDiscounts')
      .doc(discount.id);

    await oldDocRef.delete();
    console.log(`     🗑️  Eski location'dan silindi: /users/${oldUserId}/publicDiscounts/${discount.id}`);

    return true;
  } catch (err) {
    console.error(`     ❌ Migrasyon hatası:`, err.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🔧 FIRESTORE ÜRÜN RECOVERY MİGRASYON SCRIPTI              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const connected = await initializeFirebase();
  if (!connected) {
    console.error('❌ Firebase bağlantısı başarısız');
    process.exit(1);
  }

  const oldMachineIdPrefix = 'AE3C8E03B175FA2A';
  const newUserId = 'user_4956C39550333A28_zeqn03ik0';

  console.log('\n📋 Taşınacak Ürün Bulma:');
  console.log(`   • MachineID: ${oldMachineIdPrefix}`);
  console.log(`   • Hedef userId: ${newUserId}`);
  console.log('');

  const discountsToMigrate = await findAllDiscountsByMachinePattern(oldMachineIdPrefix);

  if (discountsToMigrate.length === 0) {
    console.log('✅ Migrasyon yapılacak ürün yok!');
    process.exit(0);
  }

  console.log('\n📦 Migrasyon Edilecek Ürünler:');
  for (const item of discountsToMigrate) {
    console.log(`  • "${item.discount.productName}" (${item.discount.id})`);
    console.log(`    - Geçerli userId: ${item.userId}`);
    console.log(`    - Slug: ${item.discount.slug}`);
    console.log(`    - İnceleme: ${item.discount.views || 0}, Tıklama: ${item.discount.shares || 0}`);
  }

  console.log(`\n⚠️  ${discountsToMigrate.length} ürün migrasyon edilecek.`);
  console.log('🚀 Migrasyon Başlıyor...\n');

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

    await new Promise(resolve => setTimeout(resolve, 500));
  }

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

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
