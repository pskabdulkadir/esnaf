import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Firebase Test başlıyor...\n');

// Credentials kontrol
const credentials = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  clientId: process.env.FIREBASE_CLIENT_ID,
};

console.log('📋 Credentials Kontrol:');
console.log('  Project ID:', credentials.projectId ? '✅' : '❌');
console.log('  Private Key ID:', credentials.privateKeyId ? '✅' : '❌');
console.log('  Private Key:', credentials.privateKey ? '✅' : '❌');
console.log('  Client Email:', credentials.clientEmail ? '✅' : '❌');
console.log('  Client ID:', credentials.clientId ? '✅' : '❌');

if (!credentials.projectId || !credentials.privateKey || !credentials.clientEmail) {
  console.error('\n❌ Eksik credentials!');
  process.exit(1);
}

try {
  console.log('\n🔥 Firebase initializing...');
  
  admin.initializeApp({
    credential: admin.credential.cert(credentials as any),
    projectId: credentials.projectId
  });
  
  console.log('✅ Firebase initialized successfully!\n');
  
  // Test read
  console.log('📖 Firestore test read...');
  const db = admin.firestore();
  const testDoc = await db.collection('users').doc('test').get();
  console.log('✅ Firestore connected!\n');
  
  console.log('═════════════════════════════════════════');
  console.log('✅ ALL TESTS PASSED - Ready for migration!');
  console.log('═════════════════════════════════════════\n');
  
  process.exit(0);
  
} catch (err: any) {
  console.error('\n❌ Error:', err.message);
  console.error('\nFull error:', err);
  process.exit(1);
}
