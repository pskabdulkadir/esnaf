import * as admin from 'firebase-admin';

// ⭐ Firebase Admin SDK'yı initialize et
// Credentials env variables'dan okunuyor

const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    console.log('✅ Firebase zaten initialized');
    return;
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

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log('✅ Firebase initialized successfully');
  } catch (err) {
    console.error('❌ Firebase initialization failed:', err);
    throw new Error('Firebase initialization failed');
  }
};

// Initialize
initializeFirebase();

// Exports
export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
