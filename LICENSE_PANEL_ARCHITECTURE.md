# 🏗️ Lisans Yönetim Paneli - Mimarisi ve Akış Diyagramları

## 1. Bileşen Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                      App.tsx                             │
│                  (Ana Uygulama)                          │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼────────┐   ┌───────▼──────────┐
    │LicenseGate   │   │   Dashboard      │ ◄─── STATE: isLicenseValid
    │(Sayfa)       │   │  (Dashboard)     │
    │              │   │                  │
    │ • Validation │   │ ┌──────────────┐ │
    │ • Input      │   │ │LicensePanel  │ │ ◄─── YENİ
    │ • Redirect   │   │ │(Panel)       │ │
    └──────────────┘   │ │              │ │
                       │ │ • Bilgiler   │ │
                       │ │ • Süre Uzat  │ │
                       │ │ • localStorage│ │
                       │ └──┬───────────┘ │
                       │    │             │
                       │    └─────┬───────┤
                       │          │ │     │
                       │          ▼ │     │
                       │     ┌────────┐  │
                       │     │library │  │
                       │     │manager │  │
                       │     └────────┘  │
                       └──────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
              ┌─────▼──────┐    ┌───────▼───────┐
              │browser local│    │  machine-id   │
              │  storage    │    │   generator   │
              └─────────────┘    └───────────────┘
```

---

## 2. Data Flow Diyagramı

### 2.1 Lisans Bilgileri Yükleme

```
┌─────────────────────────────────────────┐
│  Dashboard Açılır / Sayfa Yenilenir    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  LicensePanel useEffect Çalışır         │
│  loadLicenseDataFromStorage() Çağırılır │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  localStorage.getItem('license_data')   │
│  Veri var mı?                           │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────┐
      │             │
   VAR │           │ YOK
      │             │
      ▼             ▼
┌─────────────┐  ┌──────────────────┐
│ JSON.parse  │  │"Lisans bilgisi   │
│ Başarılı?   │  │ bulunamadı"      │
└──┬──────┬───┘  └──────────────────┘
   │      │
   │      └──────────────────┐
   │                         │
 EV │                       │ HAYIR
   │                         │
   ▼                         ▼
┌────────────────┐   ┌──────────────────┐
│setLicenseData()│   │Panel Görüntüleme │
│setExpiryDate() │   │ (Veri Yok Mesajı)
│setDaysRemaining│   └──────────────────┘
└────┬───────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Panel Güncellenir                      │
│  • Cihaz Kimliği                        │
│  • Bitiş Tarihi                         │
│  • Kalan Gün + Renk Durumu              │
└─────────────────────────────────────────┘
```

### 2.2 Lisans Süresi Uzatma Süreci

```
┌──────────────────────────────────────────┐
│ Kullanıcı "Süreyi Uzat" Butonuna Tıklar │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ showRenewForm = true                     │
│ Giriş Formu Görüntülenir                 │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Kullanıcı Lisans Anahtarını Yapıştırır   │
│ newLicenseKey State'ine Yazılır          │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ "Doğrula ve Uzat" Butonuna Tıklar        │
│ handleRenewLicense() Çağırılır           │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ VALIDATION                               │
│                                          │
│ 1. Anahtarı Kontrol Et                   │
│    trim() ve boşluk kontrolü             │
│    ❌ Boşsa → Hata: "Lütfen girin"      │
└────────────┬─────────────────────────────┘
             │ ✓ Dolu
             ▼
┌──────────────────────────────────────────┐
│ 2. Base64 Decode                         │
│    atob(key) → JSON Parse                │
│    ❌ Başarısızsa → Hata: "Bozuk"       │
└────────────┬─────────────────────────────┘
             │ ✓ Başarılı
             ▼
┌──────────────────────────────────────────┐
│ 3. Format Kontrol                        │
│    id + exp + type var mı?               │
│    ❌ Yoksa → Hata: "Geçersiz format"   │
└────────────┬─────────────────────────────┘
             │ ✓ Var
             ▼
┌──────────────────────────────────────────┐
│ 4. MachineID Eşleştirmesi                │
│    newLicense.id === machineId ?         │
│    ❌ Değilse → Hata: "Başka cihaza"    │
└────────────┬─────────────────────────────┘
             │ ✓ Eşleşti
             ▼
┌──────────────────────────────────────────┐
│ 5. Süresi Uzatma (ÖZEL MANTI)            │
│    combineLicensePeriods() Çağırılır     │
│                                          │
│    Mevcut: 2025-03-31                    │
│    Yeni:   2025-04-30 (+30 gün)         │
│                                          │
│    Formula:                              │
│    Mevcut + (Yeni - Bugün)              │
│    = 2025-03-31 + 35 gün                │
│    = 2025-05-05                          │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ 6. localStorage'a Kaydet                 │
│    saveLicenseData(newLicense)           │
│    localStorage.setItem(...)             │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ 7. State Güncelle                        │
│    setLicenseData(newLicense)            │
│    calculateTimeRemaining(newLicense)    │
│    setNewLicenseKey('')                  │
│    setShowRenewForm(false)               │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ 8. Başarı Mesajı Göster                  │
│    message = {                           │
│      text: "✅ Başarıyla uzatıldı!",    │
│      type: 'success'                     │
│    }                                     │
│                                          │
│    4 saniye sonra kaybolur               │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ 9. Callback Çağırılır (Opsiyonel)        │
│    onLicenseUpdated?.()                  │
│    Dashboard'da state güncellenir        │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ 10. Panel Güncellenir                    │
│    • Bitiş Tarihi: 05.05.2025           │
│    • Kalan Gün: 35                       │
│    • Renk: 🟢 Yeşil                     │
└──────────────────────────────────────────┘
```

---

## 3. State Management Diyagramı

### LicensePanel State'leri

```
┌─────────────────────────────────────────────────┐
│             LicensePanel State                   │
└─────────────────────────────────────────────────┘

┌─ License Data ─────────────────────────────────┐
│                                                │
│ licenseData: {                                  │
│   id: string                                    │
│   exp: string (ISO Date)                        │
│   type: string                                  │
│ } | null                                        │
│                                                │
│ expiryDate: Date | null                         │
│ daysRemaining: number (0-∞)                     │
│                                                │
└────────────────────────────────────────────────┘

┌─ UI State ────────────────────────────────────┐
│                                                │
│ isExpanded: boolean (Panel aç/kapalı)         │
│ showRenewForm: boolean (Form gösterilsin mi)  │
│ copied: boolean (Kopyala butonu durumu)       │
│                                                │
└────────────────────────────────────────────────┘

┌─ Form State ──────────────────────────────────┐
│                                                │
│ newLicenseKey: string (Giriş alanı)           │
│ isLoading: boolean (Doğrulama sırasında)      │
│                                                │
│ message: {                                     │
│   text: string                                 │
│   type: 'success' | 'error'                   │
│ } | null                                       │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 4. localStorage Yapı Diyagramı

```
┌────────────────────────────────────────────────┐
│              Browser localStorage               │
└────────────────────────────────────────────────┘

┌─ License Data (Ana) ───────────────────────────┐
│                                                │
│ Key: "license_data"                            │
│                                                │
│ Value: {                                       │
│   "id": "A1B2C3D4E5F6G7H8",                   │
│   "exp": "2025-12-31T00:00:00.000Z",          │
│   "type": "professional"                       │
│ }                                              │
│                                                │
│ Kullanım:                                      │
│ • Panel açılışında yüklenir                   │
│ • Lisans süresi uzatıldığında güncellenir     │
│ • Sayfa yenilenince yeniden yüklenir          │
│                                                │
└────────────────────────────────────────────────┘

┌─ Cihaz Kimliği ────────────────────────────────┐
│                                                │
│ Key: "license_machine_id"                      │
│                                                │
│ Value: "X1Y2Z3A4B5C6D7E8"                      │
│        (16 karakterli benzersiz kod)           │
│                                                │
│ Kullanım:                                      │
│ • LicenseGate'de oluşturulur                  │
│ • Lisans anahtarıyla eşleştirilir             │
│ • Tarayıcıda kalıcı                           │
│                                                │
└────────────────────────────────────────────────┘

┌─ Gönderilen Anahtarın Kaydı ───────────────────┐
│                                                │
│ Key: "license_key_submitted"                   │
│                                                │
│ Value: "eyJpZCI6IkExQjJDM0Q0RTV...[çok uzun]" │
│        (Base64 encoded JSON)                   │
│                                                │
│ Kullanım:                                      │
│ • Referans tutmak için                        │
│ • Debugging / audit trail                     │
│                                                │
└────────────────────────────────────────────────┘

┌─ Geçerlilik Bayrağı ───────────────────────────┐
│                                                │
│ Key: "isLicenseValid"                          │
│                                                │
│ Value: "true" | "false" (string)               │
│                                                │
│ Kullanım:                                      │
│ • App.tsx'te lisans kontrolü                  │
│ • LicenseGate'e yönlendirme                   │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 5. Renk Durumu Diyagramı

```
┌─────────────────────────────────────────┐
│         Panel Renk Sistemı              │
└─────────────────────────────────────────┘

     Kalan Gün >= 7
             │
             ▼
    ┌────────────────┐
    │    🟢 YEŞİL    │
    │   (Normal)     │
    │                │
    │ • Panel başı   │
    │ • Kalan Gün    │
    │ • Pano border  │
    │                │
    │ Hex: #10b981   │
    └────────────────┘


  7 > Kalan Gün > 0
             │
             ▼
    ┌────────────────┐
    │   🟡 SARI      │
    │   (Uyarı)      │
    │                │
    │ • Panel başı   │
    │ • Kalan Gün    │
    │ • Pano border  │
    │                │
    │ Hex: #f59e0b   │
    └────────────────┘


     Kalan Gün <= 0
             │
             ▼
    ┌────────────────┐
    │    🔴 KIRMIZI  │
    │   (Kritik)     │
    │                │
    │ • Panel başı   │
    │ • "SÜRESİ      │
    │   DOLDU"       │
    │ • Pano border  │
    │                │
    │ Hex: #ef4444   │
    └────────────────┘
```

---

## 6. Effect Hook'ları Diyagramı

```
┌──────────────────────────────────────────┐
│   LicensePanel useEffect Hooks           │
└──────────────────────────────────────────┘

┌─ Effect 1: Başlangıç Yüklemesi ────────┐
│                                         │
│ Trigger: [] (mount)                    │
│                                         │
│ loadLicenseDataFromStorage()            │
│   ↓                                      │
│ localStorage'dan veri yükle             │
│   ↓                                      │
│ setLicenseData()                        │
│   ↓                                      │
│ calculateTimeRemaining()                │
│                                         │
│ Cleanup: Yok                            │
│                                         │
└─────────────────────────────────────────┘

┌─ Effect 2: Gerçek Zamanlı Güncelleme ──┐
│                                         │
│ Trigger: [licenseData]                  │
│                                         │
│ setInterval(() => {                     │
│   calculateTimeRemaining()              │
│ }, 1000)                                │
│                                         │
│ Her 1 saniyede:                         │
│   • Kalan gün yeniden hesaplanır       │
│   • State güncellenir                   │
│                                         │
│ Cleanup: clearInterval()                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 7. Validasyon Akış Şeması

```
┌─────────────────────────────────────────┐
│    License Key Validation Flow          │
└─────────────────────────────────────────┘

User Input: "eyJpZCI6IkExQj..."
            │
            ▼
    ┌──────────────────┐
    │ Boş mu?          │
    │ trim().length === 0
    └──────┬───────────┘
           │
      EVET │ ❌ ERROR: "Lütfen girin"
           │
           NO ▼
    ┌──────────────────┐
    │ Base64 Decode    │
    │ atob()           │
    └──────┬───────────┘
           │
      FAIL │ ❌ ERROR: "Bozuk format"
           │
       OK  ▼
    ┌──────────────────┐
    │ JSON Parse       │
    │ JSON.parse()     │
    └──────┬───────────┘
           │
      FAIL │ ❌ ERROR: "JSON geçersiz"
           │
       OK  ▼
    ┌──────────────────┐
    │ Format Check     │
    │ id+exp+type      │
    └──────┬───────────┘
           │
      FAIL │ ❌ ERROR: "Geçersiz format"
           │
       OK  ▼
    ┌──────────────────┐
    │ MachineID Check  │
    │ id === machineId │
    └──────┬───────────┘
           │
      FAIL │ ❌ ERROR: "Başka cihaza"
           │
       OK  ▼
    ┌──────────────────┐
    │ ALL PASSED ✓     │
    │ Süresi Uzat      │
    └──────────────────┘
```

---

## 8. Component Lifecycle

```
┌──────────────────────────────────────────┐
│     LicensePanel Lifecycle               │
└──────────────────────────────────────────┘

┌─ MOUNT ───────────────────────────────────┐
│                                           │
│ 1. Component oluşturulur                  │
│ 2. State initialize edilir                │
│ 3. useEffect[mount] çalışır               │
│    ↓ loadLicenseDataFromStorage()         │
│    ↓ localStorage'dan veri yükle         │
│ 4. Component render edilir                │
│                                           │
└───────────────────┬───────────────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
    ┌─────▼─────┐      ┌──────▼──────┐
    │ UPDATE    │      │ useEffect   │
    │ (User     │      │ [licenseData]
    │  Actions) │      │ çalışır     │
    │           │      │             │
    │ • Panel   │      │ setInterval │
    │   açıl    │      │ (1s)        │
    │ • Kopyala │      │             │
    │ • Form    │      │ Kalan Gün   │
    │   aç      │      │ güncellenir │
    │ • Doğrula │      └──────┬──────┘
    │           │             │
    │ Render    │        Her 1 saniye
    │ Tekrarla  │        güncellenir
    └─────┬─────┘
          │
          └──────┬──────────┐
                 │          │
          ┌──────▼─┐  ┌─────▼────┐
          │UNMOUNT │  │CLEANUP   │
          │Component  │clearInterval()
          │silinir │  │          │
          └────────┘  └──────────┘
```

---

## 9. Fonksiyon Çağrı Sırası

### Başlangıç Yükleme

```
loadLicenseDataFromStorage()
  ↓
loadLicenseData() (utility)
  ↓
localStorage.getItem('license_data')
  ↓
JSON.parse()
  ↓
return LicenseData
  ↓
setLicenseData()
  ↓
calculateTimeRemaining()
  ↓
calculateDaysRemaining() (utility)
  ↓
return günler
  ↓
setExpiryDate()
  ↓
setDaysRemaining()
```

### Lisans Uzatma

```
handleRenewLicense()
  ↓
decodeLicenseKey() (utility)
  ↓
atob() → JSON.parse()
  ↓
validateLicenseFormat() (utility)
  ↓
validateMachineId() (utility)
  ↓
combineLicensePeriods() (utility) ⭐ ÖZEL
  ↓
saveLicenseData() (utility)
  ↓
localStorage.setItem()
  ↓
setLicenseData()
  ↓
calculateTimeRemaining()
  ↓
setMessage() → Success
  ↓
setTimeout(() => setMessage(null))
```

---

## 10. Error Handling Ağacı

```
┌────────────────────────────────┐
│  handleRenewLicense()          │
└────────┬───────────────────────┘
         │
    try-catch
         │
    ┌────┴────────────────────────┐
    │                              │
   TRY                          CATCH
    │                              │
    ├─ Validation              ├─ SyntaxError
    │  └─ MachineID            │  (JSON parse hatası)
    │  └─ Format               │
    │  └─ Expiry               ├─ Error('invalid_format')
    │                          │  (Geçersiz format)
    ├─ Combine                 │
    │  └─ Period               ├─ Error('machine_id_mismatch')
    │                          │  (Başka cihaz)
    ├─ Save                    │
    │  └─ localStorage          └─ Generic Error
    │                              (Diğer hatalar)
    ├─ Update UI
    │  └─ State update        ✓ SUCCESS
    │                         │
    └─ Success Message        ├─ setMessage()
       └─ 4s timeout          │
                              ├─ setTimeout clear
                              │
                              └─ Retry option
```

---

## 11. localStorage Sync Şeması

```
┌─────────────────────────────────┐
│    localStorage ↔ React State   │
└─────────────────────────────────┘

WRITE PATH (Lisans Uzatma):
────────────────────────────
  React Component
         │
         ↓
  saveLicenseData()
         │
         ↓
  localStorage.setItem()
         │
         ↓
  Browser Storage (Persistent)
         │
         ↓
  Sayfa kapansa bile korunur ✓


READ PATH (Sayfa Yükleme):
────────────────────────────
  Page Load
         │
         ↓
  loadLicenseDataFromStorage()
         │
         ↓
  localStorage.getItem()
         │
         ↓
  JSON.parse()
         │
         ↓
  setLicenseData()
         │
         ↓
  React State güncellenir
         │
         ↓
  Component render edilir ✓
```

---

**Mimarı Tasarımı Tamamlandı** ✅

Bu diyagramlar Lisans Paneli'nin tam yapısını ve iş akışını göstermektedir.
