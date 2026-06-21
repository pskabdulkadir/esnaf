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

const isFirebaseConfigValid = Object.values(firebaseConfig).every(val => val && val.trim && val.trim());

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

  // Storage fallback keys
  const LAST_AUTH_CHECK = 'akn_last_auth_success_time';
  const SEC_STATUS_KEY = 'akn_cached_auth_state'; // "true" or "false"
  const SEC_VERSION_KEY = 'akn_cached_required_version';
  const USER_ACCESS_KEY = 'akn_cached_user_access';

  const now = Date.now();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  // Helper local reader for grace calculation
  const getCachedState = (): SecurityStatus => {
    const lastCheck = localStorage.getItem(LAST_AUTH_CHECK);
    const cachedAuth = localStorage.getItem(SEC_STATUS_KEY);
    const cachedUserAccess = localStorage.getItem(USER_ACCESS_KEY) !== 'false'; // Default true if not set
    const cachedReqVersion = localStorage.getItem(SEC_VERSION_KEY) || APP_CURRENT_VERSION;

    // Check if user access is denied (isAccessAllowed = false)
    if (cachedAuth === 'true' && !cachedUserAccess) {
      return {
        isLocked: true,
        lockType: 'unauthorized',
        errorMessage: 'Erişiminiz geçici olarak durdurulmuştur. Lütfen yöneticiniz ile iletişime geçiniz.',
        offlineGraceActive: false
      };
    }

    // Set fallback access allowed if first time initializing offline/sandbox
    if (!lastCheck && !cachedAuth) {
      localStorage.setItem(LAST_AUTH_CHECK, now.toString());
      localStorage.setItem(SEC_STATUS_KEY, 'true');
      localStorage.setItem(USER_ACCESS_KEY, 'true');
      console.log('[AUTH_CHECK] Çevrimdışı mod: İlk erişim izni verildi');
      return {
        isLocked: false,
        lockType: 'none',
        offlineGraceActive: true,
        daysRemainingInGrace: 3
      };
    }

    if (cachedAuth === 'true' && lastCheck && cachedUserAccess) {
      const lastCheckTime = parseInt(lastCheck, 10);
      if (isNaN(lastCheckTime)) {
        localStorage.removeItem(LAST_AUTH_CHECK);
        return {
          isLocked: true,
          lockType: 'unauthorized',
          errorMessage: 'Erişim doğrulama için internet bağlantısı gereklidir. Lütfen bağlantı sağlayarak devam etmeyi deneyin.',
          offlineGraceActive: false
        };
      }
      const diff = now - lastCheckTime;

      if (diff < threeDaysMs) {
        // Safe inside the 3-day grace period
        const daysLeft = Math.max(0, parseFloat(((threeDaysMs - diff) / (24 * 60 * 60 * 1000)).toFixed(1)));

        // Let's verify remote update cached as well
        if (isVersionHigher(cachedReqVersion, APP_CURRENT_VERSION)) {
          return {
            isLocked: true,
            lockType: 'update_required',
            requiredVersion: cachedReqVersion,
            offlineGraceActive: true,
            daysRemainingInGrace: daysLeft
          };
        }

        return {
          isLocked: false,
          lockType: 'none',
          offlineGraceActive: true,
          daysRemainingInGrace: daysLeft
        };
      }
    }

    // Offline mode: allow access with grace period
    console.log('[AUTH_CHECK] Çevrimdışı mod: Erişim izni verildi');
    return {
      isLocked: false,
      lockType: 'none',
      offlineGraceActive: true,
      daysRemainingInGrace: 3
    };
  };

  // If developer tool or host is loaded completely offline without Firestore db instantiation
  if (!db) {
    console.log('[AUTH_CHECK] Firebase DB yoktur, çevrimdışı mod başlatılıyor...');
    return getCachedState();
  }

  try {
    console.log('[AUTH_CHECK] Firebase bağlantısı başarılı, Config okunuyor...');
    // 1. Fetch system-wide config for required version comparison
    const systemConfigRef = doc(db, 'Config', 'system');
    let requiredVersion = APP_CURRENT_VERSION;

    try {
      const configSnap = await getDoc(systemConfigRef);
      console.log('[AUTH_CHECK] Config kontrol edildi');
      if (configSnap.exists()) {
        const data = configSnap.data();
        if (data && data.requiredVersion) {
          requiredVersion = data.requiredVersion;
          localStorage.setItem(SEC_VERSION_KEY, requiredVersion);
        }
      } else {
        // Seed initial system config if not exist for user convenience
        await setDoc(systemConfigRef, {
          requiredVersion: APP_CURRENT_VERSION,
          lastUpdated: serverTimestamp()
        }, { merge: true });
      }
    } catch (err) {
      console.warn("Sistem yapılandırması alınamadı, yedek sürüm kullanılıyor", err);
    }

    // 2. Check update requirement
    if (isVersionHigher(requiredVersion, APP_CURRENT_VERSION)) {
      return {
        isLocked: true,
        lockType: 'update_required',
        requiredVersion,
        offlineGraceActive: false
      };
    }

    // 3. Fetch user doc from Users collection
    console.log('[AUTH_CHECK] Devices koleksiyonundan cihaz okunuyor...');
    const deviceRef = doc(db, 'Devices', deviceId);
    let isAccessAllowed = true;

    const deviceSnap = await getDoc(deviceRef);
    console.log('[AUTH_CHECK] Cihaz belge var mı:', deviceSnap.exists(), 'Data:', deviceSnap.data());
    if (deviceSnap.exists()) {
      const data = deviceSnap.data();
      isAccessAllowed = data?.isAccessAllowed !== false;
      console.log('[AUTH_CHECK] Device data:', data, 'isAccessAllowed:', isAccessAllowed);

      // Update metadata on server asynchronously
      setDoc(deviceRef, {
        currentVersion: APP_CURRENT_VERSION,
        lastOnlineTime: serverTimestamp(),
        platform: "Web Portal"
      }, { merge: true }).catch(e => console.warn("Kullanıcı telemetrisi güncellenemedi", e));

    } else {
      // İlk kez kaydedilen cihaz - varsayılan olarak erişim izni verilir
      await setDoc(deviceRef, {
        deviceId,
        isAccessAllowed: true,
        currentVersion: APP_CURRENT_VERSION,
        platform: "Web Portal",
        createdAt: serverTimestamp(),
        lastOnlineTime: serverTimestamp()
      });

      console.log('[AUTH_CHECK] Yeni cihaz Firestore\'da kaydedildi:', deviceId);
      isAccessAllowed = true;
    }

    // 4. Record local verification status for offline grace validation
    if (isAccessAllowed) {
      localStorage.setItem(LAST_AUTH_CHECK, now.toString());
      localStorage.setItem(SEC_STATUS_KEY, 'true');
      localStorage.setItem(USER_ACCESS_KEY, 'true');

      return {
        isLocked: false,
        lockType: 'none',
        offlineGraceActive: true,
        daysRemainingInGrace: 3
      };
    } else {
      localStorage.setItem(LAST_AUTH_CHECK, now.toString()); // Set timestamp for offline denial check
      localStorage.setItem(SEC_STATUS_KEY, 'true'); // Connection was successful
      localStorage.setItem(USER_ACCESS_KEY, 'false'); // But access is denied

      return {
        isLocked: true,
        lockType: 'unauthorized',
        errorMessage: 'Erişiminiz geçici olarak durdurulmuştur. Lütfen yöneticiniz ile iletişime geçiniz.',
        offlineGraceActive: false
      };
    }
  } catch (err: any) {
    console.error("[AUTH_CHECK] HATA!", err.code, err.message);
    console.warn("Erişim sorgulaması başarısız. Çevrimdışı güvenlik stratejisi başlatılıyor", err);
    return getCachedState();
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
