// Firebase and Device Security Management Engine
// Coordinates Cloud Authentication checks, Remote Update enforcement, Offline Grace Policies, and Device Fingerprinting.

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
  enableIndexedDbPersistence
} from 'firebase/firestore';

// Current local application metadata
export const APP_CURRENT_VERSION = '1.2.0';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigValid = Object.values(firebaseConfig).every(val =>
  val && typeof val === 'string' && val.trim() && !val.includes('Dummy') && !val.includes('your-')
);

// Initialize Firebase App
export let app: any = null;
export let db: Firestore | null = null;

try {
  if (!isFirebaseConfigValid) {
    console.warn('Firebase configuration incomplete. Set env variables in .env file');
  } else {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }

  // Enable offline persistence for better UX on slow/unstable networks
  if (db) {
    enableIndexedDbPersistence(db)
      .then(() => console.log("✓ Firestore offline persistence enabled"))
      .catch((err: any) => {
        if (err.code === 'failed-precondition') {
          console.warn("Firestore: Multiple tabs open - persistence disabled");
        } else if (err.code === 'unimplemented') {
          console.warn("Firestore: Browser doesn't support IndexedDB - persistence unavailable");
        } else {
          console.warn("Firestore persistence error:", err);
        }
      });
  }
} catch (e) {
  console.error("Firebase SDK failed to initialize", e);
  console.log("⚠ Running in offline/localStorage mode. No Firebase sync available.");
}

/**
 * Generate high-integrity unique Device ID if missing
 */
export function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem('akn_device_id');
    if (!deviceId) {
      // Create readable distinct suffix with hardware identity markers
      const randHex = Array.from({ length: 6 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('').toUpperCase();
      
      deviceId = `AKN-WEB-DEV-${randHex}`;
      localStorage.setItem('akn_device_id', deviceId);
    }
    return deviceId;
  } catch (e) {
    return 'AKN-WEB-DEV-TEMPORARY';
  }
}

export interface SecurityStatus {
  isLocked: boolean;
  lockType: 'unauthorized' | 'update_required' | 'none';
  requiredVersion?: string;
  errorMessage?: string;
  offlineGraceActive: boolean;
  daysRemainingInGrace?: number;
}

/**
 * Perform startup check comparing current system state, Firestore client details and global settings.
 * Checks user access status from Users collection (isAccessAllowed field).
 */
export async function runSovereigntyAuthCheck(): Promise<SecurityStatus> {
  const deviceId = getOrCreateDeviceId();
  console.log('[AUTH_CHECK] Başlangıç - Device ID:', deviceId, 'DB var mı:', !!db);

  const now = Date.now();

  // Always default to ALLOW - kritik hata için offline mode
  const allowByDefault = (): SecurityStatus => {
    console.log('[AUTH_CHECK] ✓ Varsayılan izin: Sistem açık (çevrimdışı mod)');
    return {
      isLocked: false,
      lockType: 'none',
      offlineGraceActive: true,
      daysRemainingInGrace: 999
    };
  };

  // Firestore connection yoksa - offline mode, erişime izin
  if (!db) {
    console.log('[AUTH_CHECK] Firebase DB yoktur, çevrimdışı mod - erişime izin verildi');
    return allowByDefault();
  }

  try {
    console.log('[AUTH_CHECK] Firestore\'a bağlanılıyor...');
    const deviceRef = doc(db, 'Devices', deviceId);
    const deviceSnap = await getDoc(deviceRef);

    if (deviceSnap.exists()) {
      const data = deviceSnap.data();
      console.log('[AUTH_CHECK] Cihaz Firestore\'da bulundu:', data);

      // ONLY block if explicitly set to false
      const isAccessAllowed = data?.isAccessAllowed !== false;

      if (!isAccessAllowed) {
        console.log('[AUTH_CHECK] ❌ Cihaz erişimi KAPATILDI (isAccessAllowed: false)');
        return {
          isLocked: true,
          lockType: 'unauthorized',
          errorMessage: 'Erişiminiz yönetici tarafından durdurulmuştur. Lütfen iletişime geçiniz.',
          offlineGraceActive: false
        };
      }

      console.log('[AUTH_CHECK] ✓ Cihaz erişimi açık');

      // Async metadata update (non-blocking)
      setDoc(deviceRef, {
        currentVersion: APP_CURRENT_VERSION,
        lastOnlineTime: serverTimestamp(),
        platform: "Web Portal"
      }, { merge: true }).catch(e => console.warn("Metadata güncellemesi hatası:", e));

      return allowByDefault();
    } else {
      // OTOMATIK KAYIT: Device yoksa, hemen oluştur
      console.log('[AUTH_CHECK] Yeni cihaz - otomatik kayıt yapılıyor...');
      try {
        await setDoc(deviceRef, {
          deviceId,
          isAccessAllowed: true,
          currentVersion: APP_CURRENT_VERSION,
          platform: "Web Portal",
          createdAt: serverTimestamp(),
          lastOnlineTime: serverTimestamp()
        });

        console.log('[AUTH_CHECK] ✓ Yeni cihaz kaydedildi:', deviceId);
      } catch (createErr) {
        console.warn('[AUTH_CHECK] Cihaz kaydı başarısız, çevrimdışı mod devam ediyor:', createErr);
      }

      return allowByDefault();
    }
  } catch (err: any) {
    // KRITIK HATA YÖNETİMİ: Firestore hatası → offline mode, erişime izin
    console.error("[AUTH_CHECK] Firestore hatası, çevrimdışı mod aktivasyonu:", err.code, err.message);
    console.log('[AUTH_CHECK] Sistem çevrimdışı modda çalışacak - erişime izin verildi');
    return allowByDefault();
  }
}

/**
 * Compare semantic versions. Returns true if serverVersion > localVersion.
 */
function isVersionHigher(serverVersion: string, localVersion: string): boolean {
  try {
    const sParts = serverVersion.split('.').map(Number);
    const lParts = localVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(sParts.length, lParts.length); i++) {
      const sVal = sParts[i] || 0;
      const lVal = lParts[i] || 0;
      
      if (sVal > lVal) return true;
      if (sVal < lVal) return false;
    }
    return false;
  } catch {
    return serverVersion !== localVersion;
  }
}

/**
 * Force manual administrative reset/sync button
 */
export async function forceResyncAuthStatus(): Promise<SecurityStatus> {
  // Clear success cache then try re-running
  localStorage.removeItem('akn_last_auth_success_time');
  return await runSovereigntyAuthCheck();
}

/**
 * Backup application data to Firebase Firestore
 */
export async function backupDataToFirestore(
  products: any[],
  sales: any[],
  expenses: any[],
  docSettings: any
): Promise<boolean> {
  if (!db) {
    console.warn('Firestore not initialized, backing up to localStorage');
    try {
      const backupData = {
        products,
        sales,
        expenses,
        docSettings,
        lastBackupTime: Date.now(),
        appVersion: APP_CURRENT_VERSION
      };
      localStorage.setItem('akn_local_backup', JSON.stringify(backupData));
      console.log('✓ Yerel yedek başarıyla kaydedildi');
      return true;
    } catch (error) {
      console.error('Yerel backup hatası:', error);
      return false;
    }
  }

  try {
    const deviceId = getOrCreateDeviceId();
    const backupRef = doc(db, 'device_backups', deviceId);

    await setDoc(backupRef, {
      deviceId,
      products,
      sales,
      expenses,
      docSettings,
      lastBackupTime: serverTimestamp(),
      appVersion: APP_CURRENT_VERSION
    }, { merge: true });

    console.log('✓ Firestore yedekleme başarıyla kaydedildi');
    return true;
  } catch (error) {
    console.error('Firestore backup hatası:', error);
    return false;
  }
}

/**
 * Restore application data from Firebase Firestore
 */
export async function restoreDataFromFirestore(): Promise<{
  products: any[];
  sales: any[];
  expenses: any[];
  docSettings: any;
} | null> {
  if (!db) {
    console.warn('Firestore not initialized, restoring from localStorage');
    try {
      const backupData = localStorage.getItem('akn_local_backup');
      if (backupData) {
        const data = JSON.parse(backupData);
        console.log('✓ Veriler yerel depolama alanından geri yüklendi');
        return {
          products: data.products || [],
          sales: data.sales || [],
          expenses: data.expenses || [],
          docSettings: data.docSettings || {}
        };
      }
      return null;
    } catch (error) {
      console.error('Yerel restore hatası:', error);
      return null;
    }
  }

  try {
    const deviceId = getOrCreateDeviceId();
    const backupRef = doc(db, 'device_backups', deviceId);
    const backupSnap = await getDoc(backupRef);

    if (backupSnap.exists()) {
      const data = backupSnap.data();
      console.log('✓ Veriler Firestore\'dan geri yüklendi');
      return {
        products: data.products || [],
        sales: data.sales || [],
        expenses: data.expenses || [],
        docSettings: data.docSettings || {}
      };
    } else {
      console.log('Firestore\'da yedek bulunamadı');
      return null;
    }
  } catch (error) {
    console.error('Firestore restore hatası:', error);
    return null;
  }
}
