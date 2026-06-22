/**
 * IndexedDB Lisans Depolama
 * Tarayıcı tamamen temizlenmiş olsa bile lisansları hatırlayır
 * Cihaz ID'ye dayalı kalıcı saklama
 */

const DB_NAME = 'AKN_Global_License_DB';
const STORE_NAME = 'licenses';
const VERSION = 1;

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
          console.log('✅ IndexedDB store oluşturuldu');
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
