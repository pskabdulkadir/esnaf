// Firebase and Device Security Management Engine
// Coordinates Cloud Authentication checks, Remote Update enforcement, Offline Grace Policies, and Device Fingerprinting.

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  type Firestore
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

// Initialize Firebase App
export let app: any = null;
export let db: Firestore | null = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase SDK failed to initialize", e);
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
 * Also checks 15-day expiry dates for device licenses.
 */
export async function runSovereigntyAuthCheck(): Promise<SecurityStatus> {
  const deviceId = getOrCreateDeviceId();

  // Storage fallback keys
  const LAST_AUTH_CHECK = 'akn_last_auth_success_time';
  const SEC_STATUS_KEY = 'akn_cached_auth_state'; // "true" or "false"
  const SEC_VERSION_KEY = 'akn_cached_required_version';
  const DEVICE_EXPIRY_KEY = 'akn_device_expiry_date';

  const now = Date.now();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  // Helper to check if device license has expired (15-day trial)
  const checkExpiryDate = (): boolean => {
    const expiryStr = localStorage.getItem(DEVICE_EXPIRY_KEY);
    if (!expiryStr) return false; // No expiry date set, assume not expired

    try {
      const expiryDate = new Date(expiryStr);
      const today = new Date();
      return today > expiryDate; // Expired if today is after expiry
    } catch {
      return false;
    }
  };

  // Helper local reader for grace calculation
  const getCachedState = (): SecurityStatus => {
    const lastCheck = localStorage.getItem(LAST_AUTH_CHECK);
    const cachedAuth = localStorage.getItem(SEC_STATUS_KEY);
    const cachedReqVersion = localStorage.getItem(SEC_VERSION_KEY) || APP_CURRENT_VERSION;

    // Check if device license has expired
    if (checkExpiryDate()) {
      return {
        isLocked: true,
        lockType: 'unauthorized',
        errorMessage: 'Bu cihazın 15 günlük deneme süresi dolmuştur. Lütfen yöneticiniz ile iletişime geçiniz.',
        offlineGraceActive: false
      };
    }

    // Set fallback 15-day trial period if first time initializing offline/sandbox
    if (!lastCheck && !cachedAuth) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 15);
      localStorage.setItem(DEVICE_EXPIRY_KEY, expiryDate.toISOString());
      localStorage.setItem(LAST_AUTH_CHECK, now.toString());
      localStorage.setItem(SEC_STATUS_KEY, 'true');
      return {
        isLocked: false,
        lockType: 'none',
        offlineGraceActive: true,
        daysRemainingInGrace: 15
      };
    }

    if (cachedAuth === 'true' && lastCheck) {
      const lastCheckTime = parseInt(lastCheck, 10);
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

    // No cache or expired, force-lock
    return {
      isLocked: true,
      lockType: 'unauthorized',
      errorMessage: 'Internet connection required to verify access. Please connect to proceed with authorization check.',
      offlineGraceActive: false
    };
  };

  // If developer tool or host is loaded completely offline without Firestore db instantiation
  if (!db) {
    return getCachedState();
  }

  try {
    // 1. Fetch system-wide config for required version comparison
    const systemConfigRef = doc(db, 'Config', 'system');
    let requiredVersion = APP_CURRENT_VERSION;
    
    try {
      const configSnap = await getDoc(systemConfigRef);
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
          lastUpdated: serverTimestamp(),
          lockAllDevices: false
        }, { merge: true });
      }
    } catch (err) {
      console.warn("Could not retrieve system-wide configuration, choosing fallback version", err);
    }

    // 2. Clear update status check
    if (isVersionHigher(requiredVersion, APP_CURRENT_VERSION)) {
      return {
        isLocked: true,
        lockType: 'update_required',
        requiredVersion,
        offlineGraceActive: false
      };
    }

    // 3. Fetch device doc
    const deviceRef = doc(db, 'Devices', deviceId);
    let isAuthorized = true;
    let deviceExpiryDate: Date | null = null;

    const deviceSnap = await getDoc(deviceRef);
    if (deviceSnap.exists()) {
      const data = deviceSnap.data();
      isAuthorized = data?.isAuthorized !== false;

      // Check expiry date from Firebase
      if (data?.expiryDate) {
        deviceExpiryDate = new Date(data.expiryDate);
        localStorage.setItem(DEVICE_EXPIRY_KEY, data.expiryDate);

        const today = new Date();
        if (today > deviceExpiryDate) {
          isAuthorized = false; // Trial period expired
        }
      }

      // Update metadata on server asynchronously to trace current version & access activity
      setDoc(deviceRef, {
        currentVersion: APP_CURRENT_VERSION,
        lastOnlineTime: serverTimestamp(),
        platform: "Web Portal"
      }, { merge: true }).catch(e => console.warn("Syncing telemetry device details failed", e));

    } else {
      // İlk kez kaydedilen cihazlar 15 günlük deneme süresi ile kaydedilir
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 15);

      await setDoc(deviceRef, {
        deviceId,
        isAuthorized: true,
        currentVersion: APP_CURRENT_VERSION,
        platform: "Web Portal",
        createdAt: serverTimestamp(),
        expiryDate: expiryDate.toISOString(),
        lastOnlineTime: serverTimestamp()
      });

      // Ayrıca localStorage'a da kaydet (çevrimdışı kontrol için)
      localStorage.setItem(DEVICE_EXPIRY_KEY, expiryDate.toISOString());
      isAuthorized = true; // 15 günlük deneme süresi başladı
    }

    // 4. Record local verification status for offline grace validation
    if (isAuthorized) {
      localStorage.setItem(LAST_AUTH_CHECK, now.toString());
      localStorage.setItem(SEC_STATUS_KEY, 'true');

      // Calculate days remaining in trial if expiry date exists
      let daysRemaining: number | undefined = undefined;
      if (deviceExpiryDate) {
        const today = new Date();
        const timeDiff = deviceExpiryDate.getTime() - today.getTime();
        daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      }

      return {
        isLocked: false,
        lockType: 'none',
        offlineGraceActive: true,
        daysRemainingInGrace: daysRemaining
      };
    } else {
      localStorage.setItem(SEC_STATUS_KEY, 'false');

      let errorMsg = 'Bu cihazın yetkisi yöneticiniz tarafından askıya alınmıştır.';
      if (deviceExpiryDate && new Date() > deviceExpiryDate) {
        errorMsg = 'Bu cihazın 15 günlük deneme süresi dolmuştur. Lütfen yöneticiniz ile iletişime geçiniz.';
      }

      return {
        isLocked: true,
        lockType: 'unauthorized',
        offlineGraceActive: false,
        errorMessage: errorMsg
      };
    }
  } catch (err: any) {
    console.warn("Auth query failed. Initiating fallback offline sovereignty strategy", err);
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
    console.warn('Firestore not initialized');
    return false;
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

    console.log('Backup başarıyla kaydedildi');
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
    console.warn('Firestore not initialized');
    return null;
  }

  try {
    const deviceId = getOrCreateDeviceId();
    const backupRef = doc(db, 'device_backups', deviceId);
    const backupSnap = await getDoc(backupRef);

    if (backupSnap.exists()) {
      const data = backupSnap.data();
      console.log('Veriler Firestore\'dan geri yüklendi');
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
