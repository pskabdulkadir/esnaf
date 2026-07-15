#!/usr/bin/env node

/**
 * ACIL FİX: Pazarlama Vitrininde Kayıp Ürün Kurtarma
 * 
 * API Tabanlı Migrasyon (Firestore SDK'sına gerek yok)
 * http://localhost:3000 üzerinden recovery endpoint'lerini kullanır
 */

const http = require('http');
const https = require('https');

// Sunucu adresi (localhost veya production)
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const isHttps = SERVER_URL.startsWith('https');
    const lib = isHttps ? https : http;
    
    try {
      const url = new URL(SERVER_URL);
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.ADMIN_TOKEN && { 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}` })
        }
      };

      const req = lib.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${parsed.error || data}`));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(new Error(`Parse error: ${data}`));
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🔧 FIRESTORE ÜRÜN RECOVERY - API TABANLANDI MIGRASYON     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📍 Sunucu: ${SERVER_URL}\n`);

  const oldMachineIdPrefix = 'AE3C8E03B175FA2A';
  const newUserId = 'user_4956C39550333A28_zeqn03ik0';
  const oldUserId = 'license_AE3C8E03B175FA2A_unknown';

  try {
    // Step 1: Ürünleri listele
    console.log('📋 Step 1: Ürünler Bulunuyor...');
    console.log(`   • MachineID Prefix: ${oldMachineIdPrefix}`);
    console.log(`   • Eski userId: ${oldUserId}`);
    console.log(`   • Yeni userId: ${newUserId}\n`);

    const listResult = await makeRequest(
      'GET',
      `/api/admin/list-all-discounts?machinePrefix=${encodeURIComponent(oldMachineIdPrefix)}`
    );

    const discounts = listResult.discounts || [];
    
    if (discounts.length === 0) {
      console.log('✅ Migrasyon yapılacak ürün yok!');
      console.log('\n💡 Olası nedenler:');
      console.log('   1. Ürünler zaten taşınmış');
      console.log('   2. Ürünler farklı userId altında');
      console.log(`   3. Firestore'da ürün yok\n`);
      process.exit(0);
    }

    console.log(`📦 ${discounts.length} ürün bulundu:\n`);
    for (let i = 0; i < discounts.length; i++) {
      const d = discounts[i];
      console.log(`  ${i + 1}. "${d.productName}"`);
      console.log(`     - ID: ${d.id}`);
      console.log(`     - Slug: ${d.slug}`);
      console.log(`     - İnceleme: ${d.views || 0}, Tıklama: ${d.shares || 0}`);
      console.log(`     - Geçerli userId: ${d.currentUserId}\n`);
    }

    // Step 2: Onay al
    console.log(`⚠️  ${discounts.length} ürün migrasyon edilecek.`);
    console.log('🚀 Taşıma işlemi başlıyor...\n');

    // Step 3: Ürünleri taşı
    console.log('Step 2: Ürünler Taşınıyor...\n');
    
    const recoverResult = await makeRequest(
      'POST',
      '/api/admin/recover-discounts',
      {
        oldUserId,
        newUserId
      }
    );

    if (recoverResult.success) {
      console.log(`✅ Migrasyon Başarılı!\n`);
      console.log(`📊 Sonuçlar:`);
      console.log(`  • Taşınan ürünler: ${recoverResult.movedCount}`);
      console.log(`  • Eski userId: ${recoverResult.oldUserId}`);
      console.log(`  • Yeni userId: ${recoverResult.newUserId}`);
      console.log(`\n🎉 Tüm ürünler başarıyla migrasyon edildi!\n`);
      console.log(`Ürünler artık şu adreste bulunmaktadır:`);
      console.log(`/users/${recoverResult.newUserId}/publicDiscounts/*\n`);
    } else {
      console.error(`❌ Migrasyon Başarısız:`);
      console.error(`   ${recoverResult.error || 'Bilinmeyen hata'}`);
      process.exit(1);
    }

  } catch (err) {
    const msg = err.message || String(err);
    console.error('❌ Hata:', msg);
    console.error('\n📋 Debug Info:');
    console.error('   SERVER_URL:', SERVER_URL);
    console.error('   Error:', err);

    if (msg.includes('ECONNREFUSED')) {
      console.error('\n💡 Sunucu bağlantı hatası!');
      console.error(`   Lütfen ${SERVER_URL} adresinde bir sunucu çalışıyor mu kontrol et.`);
      console.error('   \n   Yerel sunucuyu başlatmak için:');
      console.error('   $ npm run dev');
    } else if (msg.includes('HTTP 404')) {
      console.error('\n💡 API Endpoint\'i bulunamadı!');
      console.error('   Lütfen sunucunun en son versiyonunu çalıştırıyor musunuz kontrol et.');
    } else if (msg.includes('ENOTFOUND')) {
      console.error('\n💡 Sunucu adresi bulunamadı!');
      console.error(`   ${SERVER_URL} adresini kontrol et.`);
    }

    process.exit(1);
  }
}

main();
