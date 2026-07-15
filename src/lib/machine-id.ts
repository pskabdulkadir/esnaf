/**
 * Cihaz Tanıma Modülü
 * Benzersiz MachineID üretimi ve çoklu yedekleme: localStorage → IndexedDB → Memory
 */

// Memory cache for fallback
let cachedMachineId: string | null = null;

function generateRandomUUID(): string {
  return 'xxxxxxxxxxxxxxxx'.replace(/x/g, () => {
    return Math.floor(Math.random() * 16).toString(16).toUpperCase();
  });
}

export function generateMachineId(): string {
  return generateRandomUUID();
}

async function saveToIndexedDB(key: string, value: string): Promise<boolean> {
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('esnaf_db', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('machine_id')) {
          db.createObjectStore('machine_id');
        }
      };
    });

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('machine_id', 'readwrite');
      const store = tx.objectStore('machine_id');
      const request = store.put(value, key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    db.close();
    return true;
  } catch (e) {
    console.warn('IndexedDB kaydı başarısız:', e);
    return false;
  }
}

async function getFromIndexedDB(key: string): Promise<string | null> {
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('esnaf_db', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const value = await new Promise<string | undefined>((resolve, reject) => {
      const tx = db.transaction('machine_id', 'readonly');
      const store = tx.objectStore('machine_id');
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    db.close();
    return value || null;
  } catch (e) {
    console.warn('IndexedDB okuma başarısız:', e);
    return null;
  }
}

export function getOrCreateMachineId(): string {
  const storageKey = 'license_machine_id';

  // SEVIYE 0: Memory cache'den kontrol (en hızlı)
  if (cachedMachineId) {
    return cachedMachineId;
  }

  // SEVIYE 1: localStorage'dan kontrol
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && stored.trim().length === 16) {
      cachedMachineId = stored;
      console.log('✅ MachineID localStorage\'dan yüklendi');
      return stored;
    }
  } catch (e) {
    console.warn('⚠️ localStorage okunamadı (private mode olabilir):', e);
  }

  // SEVIYE 2: sessionStorage'dan kontrol (backup)
  try {
    const sessionStored = sessionStorage.getItem(storageKey);
    if (sessionStored && sessionStored.trim().length === 16) {
      cachedMachineId = sessionStored;
      console.log('✅ MachineID sessionStorage\'dan yüklendi');
      // localStorage'a da kaydedelim eğer mümkünse
      try {
        localStorage.setItem(storageKey, sessionStored);
      } catch (e) {
        console.warn('⚠️ localStorage kaydı başarısız (private mode)');
      }
      return sessionStored;
    }
  } catch (e) {
    console.warn('sessionStorage okunamadı:', e);
  }

  // SEVIYE 3: Yeni UUID üret
  const newUUID = generateMachineId();
  cachedMachineId = newUUID;

  // SEVIYE 4: Tüm seviyelere kaydetmeye çalış (non-blocking)
  let savedCount = 0;

  // localStorage
  try {
    localStorage.setItem(storageKey, newUUID);
    console.log('✅ MachineID localStorage\'a kaydedildi');
    savedCount++;
  } catch (e) {
    console.warn('⚠️ localStorage kaydı başarısız (private mode olabilir):', e);
  }

  // sessionStorage (her zaman çalışmalı)
  try {
    sessionStorage.setItem(storageKey, newUUID);
    console.log('✅ MachineID sessionStorage\'a kaydedildi');
    savedCount++;
  } catch (e) {
    console.warn('⚠️ sessionStorage kaydı başarısız:', e);
  }

  // IndexedDB (async, non-blocking)
  saveToIndexedDB(storageKey, newUUID)
    .then((success) => {
      if (success) {
        console.log('✅ MachineID IndexedDB\'e kaydedildi');
      }
    })
    .catch((e) => {
      console.warn('⚠️ IndexedDB kaydı başarısız:', e);
    });

  if (savedCount === 0) {
    console.warn('⚠️ MachineID hiçbir yere kaydedilemedi! Tarayıcı ayarlarını kontrol edin.');
  }

  return newUUID;
}

export function clearMachineId(): void {
  try {
    localStorage.removeItem('license_machine_id');
  } catch (e) {
    console.error('MachineID silme hatası:', e);
  }
}

export function renewMachineId(): string {
  // Eski machine ID'yi sil
  clearMachineId();

  // Yeni machine ID oluştur ve kaydet
  const newMachineId = generateMachineId();
  try {
    localStorage.setItem('license_machine_id', newMachineId);
    console.log('✅ Yeni MachineID oluşturuldu:', newMachineId);
  } catch (e) {
    console.error('Yeni MachineID kaydedilemedi:', e);
  }

  return newMachineId;
}
