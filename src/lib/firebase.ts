// Real-Time Local Storage Security and Backup Management Engine
// Replaced Firebase implementation with secure offline local data-grace engine.

export const APP_CURRENT_VERSION = '1.2.0';

export let app: any = null;
export let db: any = null;

/**
 * Generate high-integrity unique Device ID if missing
 */
export function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem('akn_device_id');
    if (!deviceId) {
      const randHex = Array.from({ length: 6 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('').toUpperCase();
      
      deviceId = `AKN-WEB-LOCAL-${randHex}`;
      localStorage.setItem('akn_device_id', deviceId);
    }
    return deviceId;
  } catch (e) {
    return 'AKN-WEB-LOCAL-TEMPORARY';
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
 * Perform offline local integrity and access trial check.
 * Replaces online sovereignty checks with local offline sandbox.
 */
export async function runSovereigntyAuthCheck(): Promise<SecurityStatus> {
  const deviceId = getOrCreateDeviceId();
  console.log('[AUTH_CHECK_LOCAL] Başlangıç - Device ID:', deviceId);

  const now = Date.now();
  const TRIAL_DAYS = 15;

  // Track first access local timestamp
  let firstAccess = localStorage.getItem('akn_first_access_time');
  if (!firstAccess) {
    firstAccess = now.toString();
    localStorage.setItem('akn_first_access_time', firstAccess);
  }

  const firstDate = parseInt(firstAccess, 10);
  const diffMs = now - firstDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, TRIAL_DAYS - diffDays);
  const isWithin15Days = diffDays < TRIAL_DAYS;

  // Local admin override (always defaults to true locally)
  const isAccessAllowedByAdmin = localStorage.getItem('akn_admin_access_allowed') !== 'false';

  const createStatus = (
    isLocked: boolean,
    lockType: SecurityStatus['lockType'],
    within15Days: boolean,
    allowedByAdmin: boolean,
    remainingDays: number,
    errorMessage?: string
  ): SecurityStatus => ({
    isLocked,
    lockType,
    errorMessage,
    offlineGraceActive: !isLocked,
    daysRemainingInGrace: remainingDays,
    daysRemainingInTrial: remainingDays,
    isWithin15Days: within15Days,
    isAccessAllowedByAdmin: allowedByAdmin
  });

  if (!isAccessAllowedByAdmin) {
    return createStatus(
      true, 
      'unauthorized', 
      isWithin15Days, 
      false, 
      daysRemaining,
      'Sistem yönetici tarafından devre dışı bırakılmıştır (Yerel Engel).'
    );
  }

  if (!isWithin15Days) {
    return createStatus(
      true, 
      'trial_expired', 
      false, 
      true, 
      0,
      'Sistem deneme süresi (15 gün) sona ermiştir. Devam etmek için destek ekibi ile iletişime geçiniz.'
    );
  }

  console.log('[AUTH_CHECK_LOCAL] ✓ Çevrimdışı Sistem Aktif. Kalan Gün:', daysRemaining);
  return createStatus(false, 'none', true, true, daysRemaining);
}

/**
 * Force manual administrative reset/sync
 */
export async function forceResyncAuthStatus(): Promise<SecurityStatus> {
  localStorage.removeItem('akn_last_auth_success_time');
  return await runSovereigntyAuthCheck();
}

/**
 * Backup application data to localStorage
 */
export async function backupDataToFirestore(
  products: any[],
  sales: any[],
  expenses: any[],
  docSettings: any
): Promise<boolean> {
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
    console.log('✓ Yerel veri yedekleme başarıyla kaydedildi');
    return true;
  } catch (error) {
    console.error('Yerel yedekleme hatası:', error);
    return false;
  }
}

/**
 * Restore application data from localStorage
 */
export async function restoreDataFromFirestore(): Promise<{
  products: any[];
  sales: any[];
  expenses: any[];
  docSettings: any;
} | null> {
  try {
    const backupData = localStorage.getItem('akn_local_backup');
    if (backupData) {
      const data = JSON.parse(backupData);
      console.log('✓ Veriler başarılı bir şekilde yerel depolamadan geri yüklendi');
      return {
        products: data.products || [],
        sales: data.sales || [],
        expenses: data.expenses || [],
        docSettings: data.docSettings || {}
      };
    }
    return null;
  } catch (error) {
    console.error('Yerel verileri geri yükleme hatası:', error);
    return null;
  }
}
