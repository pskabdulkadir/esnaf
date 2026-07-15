// CommonJS format - Firebase Admin SDK uyumluluğu için
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let db = null;

function initializeFirebase() {
  if (admin.apps.length > 0) {
    console.log('ℹ️  Firebase zaten initialized');
    return admin.firestore();
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
  };

  if (!serviceAccount.projectId || !serviceAccount.privateKey) {
    throw new Error('Firebase credentials eksik');
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase initialized');
    db = admin.firestore();
    return db;
  } catch (err) {
    console.error('❌ Firebase init error:', err);
    throw err;
  }
}

function getFirestore() {
  if (!db) {
    return initializeFirebase();
  }
  return db;
}

module.exports = {
  initializeFirebase,
  getFirestore,
  admin
};
