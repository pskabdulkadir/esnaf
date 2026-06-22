/**
 * Cihaz Tanıma Modülü
 * Benzersiz MachineID üretimi ve localStorage'de saklama
 */

function generateRandomUUID(): string {
  // RFC 4122 v4 UUID benzeri random string
  // 16 karakterli hex string
  return 'xxxxxxxxxxxxxxxx'.replace(/x/g, () => {
    return Math.floor(Math.random() * 16).toString(16).toUpperCase();
  });
}

export function generateMachineId(): string {
  // Random UUID üret (tarayıcı localStorage'a kaydedecek)
  return generateRandomUUID();
}

export function getOrCreateMachineId(): string {
  const storageKey = 'license_machine_id';

  try {
    // ADIM 1: localStorage'da kaydedilen değer varsa onu döndür
    const stored = localStorage.getItem(storageKey);
    if (stored && stored.trim().length === 16) {
      return stored;
    }
  } catch (e) {
    // localStorage erişilemez (private mode vs.)
    console.warn('localStorage okunamadı:', e);
  }

  // ADIM 2: localStorage'da yoksa, yeni UUID üret
  const newUUID = generateMachineId();

  // ADIM 3: localStorage'a kaydetmeye çalış
  try {
    localStorage.setItem(storageKey, newUUID);
    console.log('MachineID localStorage\'a kaydedildi:', newUUID);
  } catch (e) {
    // Private mode, localStorage dolu veya kapalı
    console.warn('MachineID localStorage\'a kaydedilemedi (private mode veya depolama dolu?):', e);
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
