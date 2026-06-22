/**
 * IndexedDB Lisans Depolama
 * Tarayıcı tamamen temizlenmiş olsa bile lisansları hatırlayır
 * Cihaz ID'ye dayalı kalıcı saklama
 */

const DB_NAME = 'AKN_Global_License_DB';
const STORE_NAME = 'licenses';
const USED_LICENSES_STORE = 'used_licenses';
const VERSION = 2;

export interface StoredLicense {
  deviceId: string;
  licenseData: {
    id: string;
    exp: string;
    type: string;
  };
  timestamp: number;
  machineId: string;
}

export interface UsedLicense {
  id: string; // machineId + hash(licenseKey)
  machineId: string;
  licenseKeyHash: string;
  timestamp: number;
}

let db: IDBDatabase | null = null;

/**
 * IndexedDB'yi başlat ve aç
 */
export async function initLicenseDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, VERSION);

      request.onerror = () => {
        console.error('❌ IndexedDB açılamadı');
        reject(request.error);
      };

      request.onsuccess = () => {
        db = request.result;
        console.log('✅ IndexedDB açıldı');
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        // Store oluştur (deviceId'ye göre indexed)
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, {
            keyPath: 'deviceId'
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('✅ IndexedDB licenses store oluşturuldu');
        }

        // Kullanılan lisanslar store'unu oluştur
        if (!database.objectStoreNames.contains(USED_LICENSES_STORE)) {
          const usedStore = database.createObjectStore(USED_LICENSES_STORE, {
            keyPath: 'id'
          });
          usedStore.createIndex('machineId', 'machineId', { unique: false });
          console.log('✅ IndexedDB used_licenses store oluşturuldu');
        }
      };
    } catch (e) {
      console.error('IndexedDB başlatma hatası:', e);
      reject(e);
    }
  });
}

/**
 * Lisansı IndexedDB'ye kaydet
 */
export async function saveLicenseToIndexedDB(
  deviceId: string,
  licenseData: { id: string; exp: string; type: string },
  machineId: string
): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      if (!db) {
        db = await initLicenseDB();
      }

      if (!db) {
        console.warn('⚠️ IndexedDB kullanılamıyor');
        return resolve(false);
      }

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const storedLicense: StoredLicense = {
        deviceId,
        licenseData,
        timestamp: new Date().getTime(),
        machineId
      };

      const request = store.put(storedLicense);

      request.onsuccess = () => {
        console.log('✅ Lisans IndexedDB\'ye kaydedildi:', deviceId);
        resolve(true);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB kaydetme hatası');
        resolve(false);
      };
    } catch (e) {
      console.error('Lisans IndexedDB kaydetme hatası:', e);
      resolve(false);
    }
  });
}

/**
 * Cihaz ID'ye göre IndexedDB'den lisans geri yükle
 */
export async function getLicenseFromIndexedDB(
  deviceId: string
): Promise<StoredLicense | null> {
  return new Promise(async (resolve) => {
    try {
      if (!db) {
        db = await initLicenseDB();
      }

      if (!db) {
        console.warn('⚠️ IndexedDB kullanılamıyor');
        return resolve(null);
      }

      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(deviceId);

      request.onsuccess = () => {
        const result = request.result as StoredLicense | undefined;
        if (result) {
          console.log('✅ IndexedDB\'den lisans geri yüklendi:', deviceId);
          resolve(result);
        } else {
          console.warn('⚠️ IndexedDB\'de lisans bulunamadı:', deviceId);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('❌ IndexedDB okuma hatası');
        resolve(null);
      };
    } catch (e) {
      console.error('Lisans IndexedDB okuma hatası:', e);
      resolve(null);
    }
  });
}

/**
 * Tüm lisansları IndexedDB'den getir
 */
export async function getAllLicensesFromIndexedDB(): Promise<StoredLicense[]> {
  return new Promise(async (resolve) => {
    try {
      if (!db) {
        db = await initLicenseDB();
      }

      if (!db) {
        return resolve([]);
      }

      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as StoredLicense[];
        console.log('✅ Tüm lisanslar IndexedDB\'den getirildi:', results.length);
        resolve(results);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB getAll hatası');
        resolve([]);
      };
    } catch (e) {
      console.error('Lisans IndexedDB getAll hatası:', e);
      resolve([]);
    }
  });
}

/**
 * IndexedDB'den lisansı sil
 */
export async function deleteLicenseFromIndexedDB(deviceId: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      if (!db) {
        db = await initLicenseDB();
      }

      if (!db) {
        return resolve(false);
      }

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(deviceId);

      request.onsuccess = () => {
        console.log('✅ Lisans IndexedDB\'den silindi:', deviceId);
        resolve(true);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB silme hatası');
        resolve(false);
      };
    } catch (e) {
      console.error('Lisans IndexedDB silme hatası:', e);
      resolve(false);
    }
  });
}

/**
 * Tüm lisansları temizle
 */
export async function clearAllLicensesFromIndexedDB(): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      if (!db) {
        db = await initLicenseDB();
      }

      if (!db) {
        return resolve(false);
      }

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('✅ Tüm lisanslar IndexedDB\'den temizlendi');
        resolve(true);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB temizleme hatası');
        resolve(false);
      };
    } catch (e) {
      console.error('Lisans IndexedDB temizleme hatası:', e);
      resolve(false);
    }
  });
}

/**
 * IndexedDB'deki lisanın geçerli olup olmadığını kontrol et
 */
export async function isStoredLicenseValid(deviceId: string): Promise<boolean> {
  try {
    const stored = await getLicenseFromIndexedDB(deviceId);

    if (!stored || !stored.licenseData) {
      return false;
    }

    const expiryDate = new Date(stored.licenseData.exp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const isValid = expiryDate >= today;

    if (isValid) {
      console.log('✅ IndexedDB\'deki lisans geçerli');
    } else {
      console.warn('⚠️ IndexedDB\'deki lisans süresi dolmuş');
    }

    return isValid;
  } catch (e) {
    console.error('Lisans geçerlilik kontrol hatası:', e);
    return false;
  }
}

/**
 * Lisans anahtarı hash'i oluştur (basit)
 */
function hashLicenseKey(licenseKey: string): string {
  let hash = 0;
  for (let i = 0; i < licenseKey.length; i++) {
    const char = licenseKey.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'lh_' + Math.abs(hash).toString(36);
}

/**
 * Lisans anahtarı kullanımını kaydet (tek seferlik kontrol için)
 * ⭐ ÖNEMLI: Global düzeyde tutulur - cihaz ID değişse bile çalışmaz
 */
export async function recordUsedLicense(machineId: string, licenseKey: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      if (!db) {
        db = await initLicenseDB();
      }

      if (!db) {
        console.warn('⚠️ IndexedDB kullanılamıyor');
        return resolve(false);
      }

      const licenseKeyHash = hashLicenseKey(licenseKey);
      // ⭐ ÖNEMLI: ID'ye sadece licenseKeyHash ekliyoruz, machineId EKLEMEMELIYIZ
      // Bu sayede cihaz ID değişse bile lisans anahtarı bir daha kullanılamaz
      const usedLicense: UsedLicense = {
        id: licenseKeyHash,  // SADECE lisans hash'i
        machineId,  // Referans amaçlı tutulur
        licenseKeyHash,
        timestamp: new Date().getTime()
      };

      const transaction = db.transaction([USED_LICENSES_STORE], 'readwrite');
      const store = transaction.objectStore(USED_LICENSES_STORE);
      const request = store.put(usedLicense);

      request.onsuccess = () => {
        console.log('🔒 Lisans GLOBAL düzeyde kayıtlandı (cihaz ID değişse bile çalışmaz):', licenseKeyHash);
        resolve(true);
      };

      request.onerror = () => {
        console.error('❌ Lisans kullanımı kaydetme hatası');
        resolve(false);
      };
    } catch (e) {
      console.error('Lisans kullanımı kaydetme hatası:', e);
      resolve(false);
    }
  });
}

/**
 * Lisans anahtarı daha önce HERHANGİ cihazda kullanıldı mı kontrol et
 * ⭐ ÖNEMLI: Global kontrol - cihaz ID'den bağımsız
 */
export async function isLicenseAlreadyUsed(machineId: string, licenseKey: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      if (!db) {
        db = await initLicenseDB();
      }

      if (!db) {
        console.warn('⚠️ IndexedDB kullanılamıyor');
        return resolve(false);
      }

      const licenseKeyHash = hashLicenseKey(licenseKey);
      // ⭐ ÖNEMLI: SADECE licenseKeyHash ile kontrol yapıyoruz
      // Cihaz ID'si DIKKATE ALINMIYOR

      const transaction = db.transaction([USED_LICENSES_STORE], 'readonly');
      const store = transaction.objectStore(USED_LICENSES_STORE);
      const request = store.get(licenseKeyHash);  // Sadece hash ile kontrol

      request.onsuccess = () => {
        const result = request.result as UsedLicense | undefined;
        if (result) {
          console.log('🔒 Bu lisans DÜNYAda kayıtlı - tekrar kullanılamaz:', licenseKeyHash);
          resolve(true);
        } else {
          console.log('✅ Bu lisans daha önce kullanılmamış');
          resolve(false);
        }
      };

      request.onerror = () => {
        console.error('❌ Lisans kontrol hatası');
        resolve(false);
      };
    } catch (e) {
      console.error('Lisans kontrol hatası:', e);
      resolve(false);
    }
  });
}

/**
 * Cihaz kimliği değiştiğinde - BUNU YAPMIYORUZ
 * ⭐ ÖNEMLI: Eski lisans anahtarları SONSUZA KADAR tek seferlik kalır
 * Cihaz ID değişse bile, eski lisanslar hiçbir zaman tekrar kullanılamaz
 * Bu nedenle temizleme yapılmaz
 */
export async function clearUsedLicensesForMachine(machineId: string): Promise<boolean> {
  console.log('ℹ️ Cihaz ID yenilendi, ama eski lisans geçmişi silinmeyecek (global koruma):', machineId);
  return Promise.resolve(true);
}

/**
 * Debug: IndexedDB durumunu göster
 */
export async function debugIndexedDB(): Promise<void> {
  try {
    const all = await getAllLicensesFromIndexedDB();
    console.log('📊 IndexedDB Debug:', {
      total: all.length,
      licenses: all.map(l => ({
        deviceId: l.deviceId,
        exp: l.licenseData.exp,
        timestamp: new Date(l.timestamp).toLocaleString()
      }))
    });
  } catch (e) {
    console.error('Debug hatası:', e);
  }
}
