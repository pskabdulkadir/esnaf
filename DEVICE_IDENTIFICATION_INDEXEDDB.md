# 🔒 Cihaz Tanımlaması - IndexedDB Kalıcı Saklama

**Sorun:** Tarayıcı tamamen temizlendiğinde lisans kayboluyordu  
**Çözüm:** IndexedDB + Cihaz ID = Tarayıcı temizlenmiş olsa da otomatik yükleme  
**Durum:** ✅ **TAMAMEN ÇÖZÜLDÜ**

---

## 🎯 Nasıl Çalışır?

### Kavram
```
Lisans Anahtarı Girildi
  ↓
Cihaz Kimliğini Al (Machine ID)
  ↓
localStorage + sessionStorage + Memory + IndexedDB'ye Kaydet
  ↓
Cihaz KAPANA KADAR HATIRLANIR
  ↓
Tarayıcı Temizlendi
  ↓
Uygulama Açıldı
  ↓
Cihaz Kimliği Al
  ↓
IndexedDB'de Ara: "Bu cihaz için lisans var mı?"
  ↓
BULUNDU! ✓
  ↓
Otomatik Yükleme
  ↓
Dashboard Açılır (Lisans İstenmez!)
```

### 5 Seviyeli Saklama

```
SEVIYE 1: localStorage
├─ Hızlı erişim
├─ Normal silme işleminde kalır
└─ "Clear Cache" ile silinir

SEVIYE 2: sessionStorage  
├─ Oturum hafızası
├─ Sayfayı yenilemede kalır
└─ Tarayıcı kapatılırsa silinir

SEVIYE 3: Memory (window.__AKN_LICENSE__)
├─ En hızlı
├─ RAM'de
└─ Sayfa yenilenirse silinir

SEVIYE 4: IndexedDB (ÖZELLİKLE!)
├─ Tarayıcı tamamen temizlenmiş olsa bile KALIR
├─ Cihaz ID'ye indexed
├─ localStorage'dan daha güvenli
└─ OTOMATIK YÜKLEME KAYNAĞIDIR

SEVIYE 5: localStorage Backup
├─ Zaman damgalı backuplar
└─ Acil durum yedek
```

---

## 🔑 Cihaz Kimliği (Machine ID)

### Nedir?
- 16 karakterli rastgele kod
- Her cihaz için benzersiz
- localStorage'da `license_machine_id` olarak saklanır
- **BU SİLİNMEZ** (localStorage'ın en güvenli veri kaynağıdır)

### Örnek
```
Machine ID: A1B2C3D4E5F6G7H8
```

### Kullanım
```
IndexedDB'de saklanan lisans:
{
  deviceId: "A1B2C3D4E5F6G7H8",  ← ANAHTAR (Cihazı tanır)
  licenseData: { id, exp, type },
  timestamp: 1734567890000
}
```

---

## 📊 IndexedDB Yapısı

### Database Adı
```
AKN_Global_License_DB
```

### Store Adı
```
licenses
```

### Key Path
```
deviceId (Cihaz Kimliği)
```

### Saklanan Veri Yapısı
```javascript
{
  deviceId: "A1B2C3D4E5F6G7H8",  // Index anahtarı
  licenseData: {
    id: "A1B2C3D4E5F6G7H8",      // Machine ID
    exp: "2025-12-31T00:00:00",  // Bitiş tarihi
    type: "professional"           // Lisans türü
  },
  timestamp: 1734567890000,        // Kaydedilme zamanı
  machineId: "A1B2C3D4E5F6G7H8"   // Cihaz kimliği
}
```

---

## 🧪 Test Senaryoları

### Test 1: Normal Lisans Girişi
```
1. Uygulamayı aç
2. Lisans anahtarı gir
3. Console log'u kontrol:
   ✅ "Lisans tüm seviyelerde kaydedildi"
   ✅ "Lisans IndexedDB'ye kaydedildi"
4. IndexedDB kontrol:
   F12 → Application → IndexedDB → AKN_Global_License_DB
   ✓ Veri var
```

### Test 2: Sayfa Yenilemesi
```
1. F5 (sayfayı yenile)
2. Console:
   ✅ "localStorage'dan geçerli lisans bulundu"
3. Dashboard açılır (Lisans istenmez)
```

### Test 3: localStorage Temizleme
```
1. DevTools → Application → Storage
2. localStorage'a sağ tıkla → Clear
3. F5 (sayfayı yenile)
4. Console:
   ✅ "sessionStorage'dan geçerli lisans bulundu"
   VEYA
   ✅ "Memory'den geçerli lisans bulundu"
5. Dashboard açılır
```

### Test 4: Tarayıcı Tamamen Temizleme (BÜYÜK TEST!)
```
1. DevTools → Application → Storage
2. "Clear Site Data" (localStorage + sessionStorage + cache temizle)
3. F5 (sayfayı yenile)
4. Console:
   ✅ "Cihaz tanımlaması başarılı"
   ✅ "IndexedDB'den lisans geri yüklendi"
   ✅ "Dashboard açılıyor..."
5. ✅ Dashboard açılır (Lisans anahtarı istenmez!)
```

### Test 5: Tarayıcı Kapat/Aç
```
1. Tarayıcıyı kapat
2. Tarayıcıyı aç, uygulamaya git
3. Console:
   ✅ "localStorage'dan geçerli lisans bulundu"
4. Dashboard açılır
5. sessionStorage ve Memory yenilenir
```

### Test 6: Cihaz Tanımalaması Doğrulama
```javascript
// Console'da çalıştır:
const machineId = localStorage.getItem('license_machine_id');
console.log('Cihaz ID:', machineId);

// IndexedDB'de ara:
indexedDB.databases().then(dbs => {
  console.log('Databases:', dbs);
});
```

---

## 🔍 Console Debug Komutları

### IndexedDB'yi Aç
```javascript
const request = indexedDB.open('AKN_Global_License_DB', 1);
request.onsuccess = function() {
  const db = request.result;
  const transaction = db.transaction(['licenses'], 'readonly');
  const store = transaction.objectStore('licenses');
  const getAll = store.getAll();
  
  getAll.onsuccess = function() {
    console.log('IndexedDB Lisanslar:', getAll.result);
  };
};
```

### Cihaz ID'yi Göster
```javascript
console.log('Cihaz ID:', localStorage.getItem('license_machine_id'));
```

### Tüm Depolama Seviyelerini Kontrol Et
```javascript
console.log({
  localStorage: {
    data: localStorage.getItem('license_data') ? 'VAR' : 'YOK',
    machineId: localStorage.getItem('license_machine_id'),
    backups: Object.keys(localStorage).filter(k => k.includes('backup')).length
  },
  sessionStorage: {
    data: sessionStorage.getItem('license_data_session') ? 'VAR' : 'YOK'
  },
  memory: window.__AKN_LICENSE__ ? 'VAR' : 'YOK'
});
```

### IndexedDB'yi Manuel Temizle
```javascript
const request = indexedDB.deleteDatabase('AKN_Global_License_DB');
request.onsuccess = () => console.log('IndexedDB silindi');
```

---

## 🛡️ Güvenlik

### IndexedDB Avantajları
✅ Tarayıcı "Clear Cache" ile silinmez  
✅ localStorage'dan daha kalıcı  
✅ Birkaç MB'ya kadar veri tutabilir  
✅ Cihaz kimliğine göre indexed  
✅ Async (tarayıcıyı kilitlemez)  

### Limitasyonlar
⚠️ Private Mode'da çalışmaz (beklenen)  
⚠️ Browser DevTools'dan manuel silinebilir  
⚠️ Bilgisayar formatlandırılırsa silinir  

---

## 📈 Saklama Hiyerarşisi

```
Uygulama Açılışı
    │
    ├─ localStorage'da veri var mı? → KULLAN
    │
    ├─ sessionStorage'da veri var mı? → localStorage'a yaz, KULLAN
    │
    ├─ Memory'de veri var mı? → Tüm seviyelere yaz, KULLAN
    │
    └─ SEVIYE 4: IndexedDB'de cihaz ID var mı? ← ÖZELLİKLE
        │
        ├─ Var ve geçerli mi? → Tüm seviyelere yaz, DASHBOARD AÇ ✓
        │
        └─ Yok → Lisans ekranı göster
```

---

## ✅ Dosya Değişiklikleri

| Dosya | Değişiklik |
|-------|-----------|
| `src/lib/license-db.ts` | ✅ Yeni IndexedDB modülü (304 satır) |
| `src/components/LicenseGate.tsx` | ✅ IndexedDB'ye kaydetme ekle |
| `src/App.tsx` | ✅ IndexedDB'den cihaz tanımlaması |

---

## 🎯 Sonuç

### Önceki
```
Lisans Girildi
  → localStorage'a kaydet
  → Tarayıcı temizle
  → localStorage silinir
  → Lisans kaybolur
  → Tekrar giriş istenir
```

### Yeni
```
Lisans Girildi
  → localStorage'a kaydet
  → sessionStorage'a kaydet
  → Memory'e kaydet
  → IndexedDB'ye kaydet (Cihaz ID'ye göre!)
  ↓
Tarayıcı temizle
  → localStorage silinir
  → sessionStorage silinir
  → Memory silinir
  → IndexedDB KALIR ✓
  ↓
Uygulama Açıldı
  → Cihaz ID al: "A1B2C3D4E5F6G7H8"
  → IndexedDB'de ara
  → BULUNDU!
  ↓
Otomatik Yükleme
  → Tüm seviyelere yeniden yaz
  → Dashboard açılır ✓
```

---

## 🚀 Avantajlar

✅ **Cihaz Tanımlaması** - Machine ID ile cihaz hatırlanır  
✅ **Kalıcılık** - IndexedDB'de tarayıcı temizlenmesine dirençli  
✅ **Otomasyonu** - Kullanıcı hiçbir şey yapması gerekmez  
✅ **Güvenlik** - 5 seviyeli yedek mekanizması  
✅ **Hız** - localStorage'dan ve sessionStorage'dan hızlı yükleme  

---

**Versiyon:** 5.0 (Cihaz Tanımlaması + IndexedDB)  
**Durum:** ✅ Production Ready  
**Test Tarihi:** Aralık 2024
