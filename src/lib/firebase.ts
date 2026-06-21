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
  lockType: 'unauthorized' | 'update_required' | 'none' | 'trial_expired';
  requiredVersion?: string;
  errorMessage?: string;
  offlineGraceActive: boolean;
  daysRemainingInGrace?: number;
  daysRemainingInTrial?: number;
  isWithin15Days: boolean;
  isAccessAllowedByAdmin: boolean;
}

/**
 * Perform startup check comparing current system state, Firestore client details and global settings.
 * Checks user access status from Users collection (isAccessAllowed field).
 */
export async function runSovereigntyAuthCheck(): Promise<SecurityStatus> {
  const deviceId = getOrCreateDeviceId();
  console.log('[AUTH_CHECK] Başlangıç - Device ID:', deviceId, 'DB var mı:', !!db);

  const now = Date.now();
  const TRIAL_DAYS = 15;

  // Helper: Varsayılan durum
  const createStatus = (
    isLocked: boolean,
    lockType: SecurityStatus['lockType'],
    isWithin15Days: boolean,
    isAccessAllowedByAdmin: boolean,
    daysRemaining: number,
    errorMessage?: string
  ): SecurityStatus => ({
    isLocked,
    lockType,
    errorMessage,
    offlineGraceActive: !isLocked,
    daysRemainingInGrace: daysRemaining,
    daysRemainingInTrial: daysRemaining,
    isWithin15Days,
    isAccessAllowedByAdmin
  });

  // Firestore connection yoksa - offline mode
  if (!db) {
    console.log('[AUTH_CHECK] Firebase DB yoktur, çevrimdışı mod');
    return createStatus(false, 'none', true, true, TRIAL_DAYS);
  }

  try {
    console.log('[AUTH_CHECK] Firestore\'a bağlanılıyor...');
    const deviceRef = doc(db, 'Devices', deviceId);
    const deviceSnap = await getDoc(deviceRef);

    if (deviceSnap.exists()) {
      const data = deviceSnap.data();
      console.log('[AUTH_CHECK] Cihaz Firestore\'da bulundu:', data);

      // 1. Admin kontrolü: isAccessAllowed
      const isAccessAllowedByAdmin = data?.isAccessAllowed !== false;

      // 2. 15 gün kontrolü
      const firstConnectionDate = data?.firstConnectionDate;
      let isWithin15Days = true;
      let daysRemaining = TRIAL_DAYS;

      if (firstConnectionDate) {
        const firstDate = firstConnectionDate.toDate ? firstConnectionDate.toDate().getTime() : firstConnectionDate;
        const diffMs = now - firstDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(0, TRIAL_DAYS - diffDays);
        isWithin15Days = diffDays < TRIAL_DAYS;

        console.log('[AUTH_CHECK] 15 Gün Kontrolü:', {
          firstDate: new Date(firstDate),
          diffDays,
          daysRemaining,
          isWithin15Days
        });
      }

      // 3. Hibrit karar: İkisi de true olmalı sistem çalışsın
      const systemActive = isAccessAllowedByAdmin && isWithin15Days;

      if (!isAccessAllowedByAdmin) {
        console.log('[AUTH_CHECK] ❌ KAPATILDI: Admin isAccessAllowed: false komutu');
        return createStatus(true, 'unauthorized', isWithin15Days, false, daysRemaining,
          'Sistem yönetici tarafından devre dışı bırakılmıştır.');
      }

      if (!isWithin15Days) {
        console.log('[AUTH_CHECK] ❌ KAPATILDI: 15 gün deneme süresi doldu');
        return createStatus(true, 'trial_expired', false, true, 0,
          '15 günlük deneme süresi sona ermiştir.');
      }

      console.log('[AUTH_CHECK] ✓ Sistem aktif (Admin OK + 15 gün içinde)');

      // Async metadata update
      setDoc(deviceRef, {
        currentVersion: APP_CURRENT_VERSION,
        lastOnlineTime: serverTimestamp(),
        platform: "Web Portal"
      }, { merge: true }).catch(e => console.warn("Metadata güncellemesi hatası:", e));

      return createStatus(false, 'none', true, true, daysRemaining);

    } else {
      // OTOMATIK KAYIT: firstConnectionDate ile
      console.log('[AUTH_CHECK] Yeni cihaz - otomatik kayıt...');
      try {
        const deviceData = {
          deviceId,
          isAccessAllowed: true,
          firstConnectionDate: serverTimestamp(),
          currentVersion: APP_CURRENT_VERSION,
          platform: "Web Portal",
          createdAt: serverTimestamp(),
          lastOnlineTime: serverTimestamp()
        };

        console.log('[AUTH_CHECK] Yazılacak veri:', deviceData);
        await setDoc(deviceRef, deviceData);
        console.log('[AUTH_CHECK] ✓ Yeni cihaz kaydedildi:', deviceId);
      } catch (createErr: any) {
        console.error('[AUTH_CHECK] ❌ Kaydı hatası:', createErr?.code, createErr?.message);
      }

      return createStatus(false, 'none', true, true, TRIAL_DAYS);
    }
  } catch (err: any) {
    console.error("[AUTH_CHECK] Firestore hatası:", err.code, err.message);
    console.log('[AUTH_CHECK] Çevrimdışı mod - sistem açık kalacak');
    return createStatus(false, 'none', true, true, TRIAL_DAYS);
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
