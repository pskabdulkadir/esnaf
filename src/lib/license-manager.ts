/**
 * Lisans Yönetimi Utility Fonksiyonları
 * Lisans verilerini işlemek, doğrulamak ve localStorage'da tutmak için
 */

export interface LicenseData {
  id: string; // MachineID
  exp: string; // ISO string tarihi
  type: string; // Lisans türü
}

/**
 * localStorage'dan lisans verilerini yükle
 */
export function loadLicenseData(): LicenseData | null {
  try {
    const licenseDataStr = localStorage.getItem('license_data');
    if (licenseDataStr) {
      return JSON.parse(licenseDataStr);
    }
  } catch (e) {
    console.error('Lisans verisi yükleme hatası:', e);
  }
  return null;
}

/**
 * Lisans verilerini localStorage'a kaydet
 */
export function saveLicenseData(data: LicenseData): void {
  try {
    localStorage.setItem('license_data', JSON.stringify(data));
  } catch (e) {
    console.error('Lisans verisi kaydetme hatası:', e);
  }
}

/**
 * Lisans anahtarını Base64'ten çöz
 */
export function decodeLicenseKey(licenseKey: string): LicenseData {
  const decodedKey = atob(licenseKey.trim());
  return JSON.parse(decodedKey);
}

/**
 * Kalan günleri hesapla
 */
export function calculateDaysRemaining(expiryDateStr: string): number {
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const timeDiff = expiry.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return Math.max(0, daysDiff);
}

/**
 * Lisans süresi dolmuş mu kontrol et
 */
export function isLicenseExpired(expiryDateStr: string): boolean {
  return calculateDaysRemaining(expiryDateStr) <= 0;
}

/**
 * İki tarihi birleştir (mevcut süreyi uzat)
 * Mevcut bitiş tarihi + yeni lisanstan gelen gün sayısı
 */
export function combineLicensePeriods(currentExpiryStr: string, newExpiryStr: string): string {
  const currentExpiry = new Date(currentExpiryStr);
  const newExpiry = new Date(newExpiryStr);
  const today = new Date();

  // Yeni lisanstaki gün sayısını hesapla
  today.setHours(0, 0, 0, 0);
  newExpiry.setHours(0, 0, 0, 0);
  const additionalDays = Math.ceil((newExpiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

  // Mevcut bitiş tarihine gün ekle
  const combinedDate = new Date(currentExpiry);
  combinedDate.setDate(combinedDate.getDate() + additionalDays);

  return combinedDate.toISOString();
}

/**
 * MachineID eşleştirme kontrolü
 */
export function validateMachineId(licenseId: string, currentMachineId: string): boolean {
  return licenseId === currentMachineId;
}

/**
 * Lisans formatını kontrol et
 */
export function validateLicenseFormat(licenseData: any): boolean {
  return licenseData && licenseData.id && licenseData.exp && licenseData.type;
}

/**
 * localStorage'dan lisans anahtarını yükle
 */
export function getStoredLicenseKey(): string | null {
  try {
    return localStorage.getItem('license_key_submitted');
  } catch (e) {
    console.error('Lisans anahtarı yükleme hatası:', e);
  }
  return null;
}

/**
 * localStorage'a lisans anahtarını kaydet
 */
export function saveStoredLicenseKey(key: string): void {
  try {
    localStorage.setItem('license_key_submitted', key);
  } catch (e) {
    console.error('Lisans anahtarı kaydetme hatası:', e);
  }
}

/**
 * Lisans geçerliliğini kontrol et ve localStorage'ı güncelle
 */
export function validateLicense(licenseData: LicenseData, machineId: string): {
  valid: boolean;
  reason?: string;
} {
  // Format kontrol
  if (!validateLicenseFormat(licenseData)) {
    return { valid: false, reason: 'invalid_format' };
  }

  // MachineID kontrol
  if (!validateMachineId(licenseData.id, machineId)) {
    return { valid: false, reason: 'machine_id_mismatch' };
  }

  // Süresi dolmuş mu kontrol
  if (isLicenseExpired(licenseData.exp)) {
    return { valid: false, reason: 'license_expired' };
  }

  return { valid: true };
}

/**
 * Tarih formatını yerel dile göre formatla
 */
export function formatDate(dateStr: string, language: 'tr' | 'en' | 'de'): string {
  const date = new Date(dateStr);
  const locales: Record<string, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
  };

  return date.toLocaleDateString(locales[language] || 'tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * localStorage'dan kalıcı lisans bilgisini yükle ve geçerliliğini kontrol et
 * Bu fonksiyon tarayıcı sıfırlandığında dahi bilgileri geri yüklemek için kullanılır
 */
export function loadAndValidatePersistentLicense(): {
  valid: boolean;
  reason?: string;
  data?: LicenseData;
} {
  try {
    const licenseDataStr = localStorage.getItem('license_data');

    if (!licenseDataStr) {
      return { valid: false, reason: 'no_license_data' };
    }

    const licenseData = JSON.parse(licenseDataStr) as LicenseData;

    // Format kontrolü
    if (!validateLicenseFormat(licenseData)) {
      return { valid: false, reason: 'invalid_format' };
    }

    // Süresi dolmuş mu kontrol et
    if (isLicenseExpired(licenseData.exp)) {
      return { valid: false, reason: 'license_expired' };
    }

    // Tüm kontroller başarılı
    return { valid: true, data: licenseData };
  } catch (e) {
    console.error('localStorage\'dan lisans yükleme hatası:', e);
    return { valid: false, reason: 'parse_error' };
  }
}

/**
 * Lisans kalıcılığını sağla
 * Tarayıcı sıfırlanırsa bile geri yüklenebilir
 * ÇOKLU BACKUP SEVİYESİ: localStorage + sessionStorage + JSON string
 */
export function ensureLicensePersistency(licenseData: LicenseData): void {
  try {
    const timestamp = new Date().getTime();
    const jsonStr = JSON.stringify(licenseData);

    // SEVIYE 1: localStorage'a kaydet (Ana saklama)
    try {
      saveLicenseData(licenseData);
      localStorage.setItem('isLicenseValid', 'true');
      console.log('✅ localStorage\'a kaydedildi');
    } catch (e1) {
      console.warn('localStorage kaydı başarısız:', e1);
    }

    // SEVIYE 2: Zaman damgalı backup localStorage'da
    try {
      localStorage.setItem('license_backup_' + timestamp, jsonStr);
      console.log('✅ localStorage backup\'ı kaydedildi');
    } catch (e2) {
      console.warn('localStorage backup kaydı başarısız:', e2);
    }

    // SEVIYE 3: sessionStorage'a kaydet (Sayfa yenilemede kalır, tarayıcı kapatılırsa silinir)
    try {
      sessionStorage.setItem('license_data_session', jsonStr);
      sessionStorage.setItem('license_valid_session', 'true');
      console.log('✅ sessionStorage\'a kaydedildi');
    } catch (e3) {
      console.warn('sessionStorage kaydı başarısız:', e3);
    }

    // SEVIYE 4: Window objesine kaydet (RAM'de, en hızlı erişim)
    try {
      (window as any).__AKN_LICENSE__ = {
        data: licenseData,
        timestamp: timestamp,
        valid: true
      };
      console.log('✅ Memory\'ye kaydedildi');
    } catch (e4) {
      console.warn('Memory kaydı başarısız:', e4);
    }

    console.log('🔒 Lisans çoklu seviyelerde kalıcı olarak saklandı');
  } catch (e) {
    console.error('Lisans kalıcılık sağlama hatası:', e);
  }
}

/**
 * Lisans geçerlilik durumunu kontrol et ve güncelle
 * App.tsx'te mount'da çağrılır
 * ÇOKLU SEVIYELER: localStorage → sessionStorage → Memory
 */
export function checkAndRestoreLicenseValidity(): boolean {
  // SEVIYE 1: Memory'den kontrol (en hızlı)
  try {
    const memoryData = (window as any).__AKN_LICENSE__;
    if (memoryData && memoryData.valid && memoryData.data) {
      const licenseData = memoryData.data as LicenseData;
      if (validateLicenseFormat(licenseData) && !isLicenseExpired(licenseData.exp)) {
        console.log('✅ Memory\'den lisans yüklendi');
        localStorage.setItem('isLicenseValid', 'true');
        return true;
      }
    }
  } catch (e) {
    console.warn('Memory\'den yükleme başarısız:', e);
  }

  // SEVIYE 2: sessionStorage'dan kontrol (sayfa yenilemede kalır)
  try {
    const sessionData = sessionStorage.getItem('license_data_session');
    if (sessionData) {
      const licenseData = JSON.parse(sessionData) as LicenseData;
      if (validateLicenseFormat(licenseData) && !isLicenseExpired(licenseData.exp)) {
        console.log('✅ sessionStorage\'dan lisans yüklendi');
        // localStorage'a da geri yükle
        saveLicenseData(licenseData);
        localStorage.setItem('isLicenseValid', 'true');
        // Memory'ye de yaz
        (window as any).__AKN_LICENSE__ = {
          data: licenseData,
          timestamp: new Date().getTime(),
          valid: true
        };
        return true;
      }
    }
  } catch (e) {
    console.warn('sessionStorage\'dan yükleme başarısız:', e);
  }

  // SEVIYE 3: localStorage'dan kontrol
  const result = loadAndValidatePersistentLicense();
  if (result.valid && result.data) {
    console.log('✅ localStorage\'dan lisans yüklendi');
    try {
      localStorage.setItem('isLicenseValid', 'true');
      // sessionStorage'a da yaz
      sessionStorage.setItem('license_data_session', JSON.stringify(result.data));
      // Memory'ye de yaz
      (window as any).__AKN_LICENSE__ = {
        data: result.data,
        timestamp: new Date().getTime(),
        valid: true
      };
    } catch (e) {
      console.warn('Backup seviyeleri yazılamadı:', e);
    }
    return true;
  }

  // Hiçbir kaynakta veri yok
  console.warn('❌ Lisans bilgisi hiçbir kaynakta bulunamadı');
  try {
    localStorage.setItem('isLicenseValid', 'false');
  } catch (e) {
    console.warn('isLicenseValid bayrağı yazılamadı:', e);
  }
  return false;
}

/**
 * Tüm seviyelerde backup lisans verilerini geri yükle
 * localStorage → sessionStorage → Memory
 */
export function restoreFromBackup(): LicenseData | null {
  // SEVIYE 1: Memory'deki backup
  try {
    const memoryData = (window as any).__AKN_LICENSE__;
    if (memoryData && memoryData.data) {
      const data = memoryData.data as LicenseData;
      if (validateLicenseFormat(data) && !isLicenseExpired(data.exp)) {
        console.log('✅ Memory\'deki backup\'tan geri yüklendi');
        saveLicenseData(data);
        return data;
      }
    }
  } catch (e) {
    console.warn('Memory backup geri yükleme hatası:', e);
  }

  // SEVIYE 2: sessionStorage'daki backup
  try {
    const sessionData = sessionStorage.getItem('license_data_session');
    if (sessionData) {
      const data = JSON.parse(sessionData) as LicenseData;
      if (validateLicenseFormat(data) && !isLicenseExpired(data.exp)) {
        console.log('✅ sessionStorage\'daki backup\'tan geri yüklendi');
        saveLicenseData(data);
        // Memory'ye de yaz
        (window as any).__AKN_LICENSE__ = {
          data: data,
          timestamp: new Date().getTime(),
          valid: true
        };
        return data;
      }
    }
  } catch (e) {
    console.warn('sessionStorage backup geri yükleme hatası:', e);
  }

  // SEVIYE 3: localStorage'daki zaman damgalı backup'lar
  try {
    const backupKeys = Object.keys(localStorage).filter(key =>
      key.startsWith('license_backup_')
    );

    if (backupKeys.length === 0) {
      console.warn('localStorage\'da backup bulunamadı');
      return null;
    }

    // En son backup'ı al
    const latestBackupKey = backupKeys.sort().pop();
    if (!latestBackupKey) {
      return null;
    }

    const backupData = localStorage.getItem(latestBackupKey);
    if (!backupData) {
      return null;
    }

    const data = JSON.parse(backupData) as LicenseData;

    // Backup da geçerli mi kontrol et
    if (validateLicenseFormat(data) && !isLicenseExpired(data.exp)) {
      console.log('✅ localStorage\'daki backup\'tan geri yüklendi:', latestBackupKey);
      // Ana alana geri yükle
      saveLicenseData(data);
      // Diğer seviyelere de yaz
      sessionStorage.setItem('license_data_session', JSON.stringify(data));
      (window as any).__AKN_LICENSE__ = {
        data: data,
        timestamp: new Date().getTime(),
        valid: true
      };
      return data;
    }

    console.warn('Son backup geçersiz veya süresi dolmuş');
    return null;
  } catch (e) {
    console.error('Backup\'dan geri yükleme hatası:', e);
    return null;
  }
}

/**
 * Tüm lisans verilerini sil (çıkış/lisans iptal için)
 */
export function clearAllLicenseData(): void {
  try {
    localStorage.removeItem('license_data');
    localStorage.removeItem('license_key_submitted');
    localStorage.removeItem('isLicenseValid');

    // Backup'ları da sil
    const backupKeys = Object.keys(localStorage).filter(key =>
      key.startsWith('license_backup_')
    );
    backupKeys.forEach(key => localStorage.removeItem(key));

    console.log('Tüm lisans verileri silindi');
  } catch (e) {
    console.error('Lisans verisi silme hatası:', e);
  }
}

/**
 * Lisans verilerinin localStorage'da kaç gün kaldığını göster (debug)
 */
export function debugLicenseStorage(): {
  stored: boolean;
  expiryDate?: string;
  daysRemaining?: number;
  isExpired?: boolean;
} {
  const licenseDataStr = localStorage.getItem('license_data');
  if (!licenseDataStr) {
    return { stored: false };
  }

  try {
    const data = JSON.parse(licenseDataStr) as LicenseData;
    const daysLeft = calculateDaysRemaining(data.exp);
    const isExpired = isLicenseExpired(data.exp);

    return {
      stored: true,
      expiryDate: data.exp,
      daysRemaining: daysLeft,
      isExpired,
    };
  } catch (e) {
    return { stored: false };
  }
}
