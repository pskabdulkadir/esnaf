# 🚀 Lisans Yönetim Paneli - Hızlı Başlangıç

## ⚡ 1 Dakikada Başlayın

### ✅ Yapılan İşler

Lisans Yönetim Paneli tamamen entegre edildi! Aşağıdaki dosyalar oluşturuldu ve bağlandı:

```
✓ src/components/LicensePanel.tsx       → Ana panel bileşeni
✓ src/lib/license-manager.ts            → Lisans işlemleri
✓ Dashboard.tsx (güncellendi)           → Panel entegrasyonu
✓ index.html / App.tsx                  → Değiştirilmedi, PWA uyumlu
```

### 🎯 Kullanıcı Açısından Ne Değişti?

1. **Dashboard açıldığında** lisans paneli görünüyor
2. Kullanıcı **"Süreyi Uzat"** butonuyla lisans süresi uzatabiliyor
3. **Uygulamayı kapatmadan** lisans güncelleniyor
4. Yeni süre mevcut sürenin **üzerine ekleniyor**

---

## 📊 Yapı Şeması

```
App.tsx
└── Dashboard.tsx
    ├── LicensePanel.tsx  ← ÖZELLİKLE AYDAN
    │   └── license-manager.ts (utility)
    │       ├── loadLicenseData()
    │       ├── saveLicenseData()
    │       ├── decodeLicenseKey()
    │       ├── calculateDaysRemaining()
    │       ├── combineLicensePeriods()
    │       └── ... (diğer fonksiyonlar)
    │
    └── (diğer dashboard bileşenleri)
```

---

## 🔧 Teknik Detaylar

### Storage (localStorage) Yapısı

```json
{
  "license_data": {
    "id": "A1B2C3D4E5F6G7H8",
    "exp": "2025-12-31T00:00:00.000Z",
    "type": "professional"
  },
  "license_key_submitted": "eyJpZCI6IkExQjJDM0Q0RTV...",
  "license_machine_id": "X1Y2Z3A4B5C6D7E8",
  "isLicenseValid": "true"
}
```

### Lisans Anahtarı Formatı

Örnek geçerli lisans anahtarı (Base64):
```
eyJpZCI6IkExQjJDM0Q0RTV...[çok uzun]...8DEY2QWREX1Q=
```

Decode edildiğinde:
```json
{
  "id": "A1B2C3D4E5F6G7H8",
  "exp": "2025-04-30T00:00:00.000Z",
  "type": "professional"
}
```

---

## 🎨 Panel Görünümü

### Kapalı Durum
```
┌─────────────────────────────────────┐
│ 🔵 Lisans Bilgisi              ▼    │
└─────────────────────────────────────┘
```

### Açık Durum
```
┌─────────────────────────────────────┐
│ 🟢 Lisans Bilgisi              ▲    │
├─────────────────────────────────────┤
│ Cihaz Kimliği (MachineID)           │
│ [A1B2C3D4E5F6G7H8]           [Kopyala]
│                                     │
│ Lisans Bitiş Tarihi                 │
│ [31.12.2025]                        │
│                                     │
│ Kalan Süre                          │
│ [365 gün]                           │
│                                     │
│              [Süreyi Uzat]          │
└─────────────────────────────────────┘
```

### Uzatma Formu
```
┌─────────────────────────────────────┐
│ Lisans Anahtarı Girin               │
│ [___________________________]        │
│                                     │
│     [Doğrula ve Uzat] [İptal]      │
└─────────────────────────────────────┘
```

---

## 💾 localStorage Depolama

### Kontrol Etme (DevTools)

1. **Açın:** F12 → Application → Local Storage
2. **Görüntüle:**
   ```javascript
   // Console'a yazın:
   localStorage.getItem('license_data')
   localStorage.getItem('license_machine_id')
   ```

### Silme

```javascript
// Console'a yazın:
localStorage.removeItem('license_data');
localStorage.removeItem('license_machine_id');
localStorage.removeItem('license_key_submitted');
```

---

## ⚙️ API Fonksiyonları

### Lisans Yükleme
```typescript
import { loadLicenseData } from './lib/license-manager';

const license = loadLicenseData();
console.log(license.exp); // "2025-12-31T00:00:00Z"
```

### Lisans Kaydetme
```typescript
import { saveLicenseData } from './lib/license-manager';

saveLicenseData({
  id: 'MACHINE_ID',
  exp: '2025-12-31T00:00:00Z',
  type: 'professional'
});
```

### Kalan Gün Hesaplama
```typescript
import { calculateDaysRemaining } from './lib/license-manager';

const days = calculateDaysRemaining('2025-12-31T00:00:00Z');
console.log(days); // 365
```

### Anahtarı Decode Etme
```typescript
import { decodeLicenseKey } from './lib/license-manager';

const license = decodeLicenseKey('eyJpZCI6IkExQj...');
console.log(license.exp); // "2025-12-31T00:00:00Z"
```

### Dönemleri Birleştirme
```typescript
import { combineLicensePeriods } from './lib/license-manager';

const newExp = combineLicensePeriods(
  '2025-03-31T00:00:00Z',  // Mevcut
  '2025-04-30T00:00:00Z'   // Yeni (+30 gün)
);
console.log(newExp); // "2025-04-30T00:00:00Z"
```

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Normal Kullanıcı

```
1. Uygulamayı aç
   ↓
2. Dashboard yüklenir
   ↓
3. Lisans Paneli görülür (en üstte)
   ↓
4. Paneli aç/kapa (Ok butonuyla)
   ↓
5. Cihaz kimliğini kopyala
   ↓
6. Lisans üreticide yeni anahtarını al
   ↓
7. "Süreyi Uzat" tıkla
   ↓
8. Anahtarı yapıştır
   ↓
9. "Doğrula ve Uzat" tıkla
   ↓
10. ✅ Başarı mesajı
    Kalan gün güncellendi!
```

### Senaryo 2: Lisans Süresi Dolma

```
1. Lisans Paneli açılır
   ↓
2. Kalan Gün: "SÜRESİ DOLDU"
   Renk: 🔴 Kırmızı
   ↓
3. LicenseGate'de (App.tsx) kontrol yapılır
   ↓
4. Lisans Gate'i yeniden giriş ister
   ↓
5. Yeni anahtarı gir
   ↓
6. ✅ Uygulamaya erişim
```

### Senaryo 3: Lisans Süresi Tükeniyor

```
1. Kalan Gün: 5 gün
   Renk: 🟡 Sarı (uyarı)
   ↓
2. Kullanıcı "Süreyi Uzat" tıklar
   ↓
3. 30 günlük yeni anahtarı yapıştırır
   ↓
4. Yeni Bitiş Tarihi: Mevcut + 30 gün
   ↓
5. ✅ Şimdi 35 gün kaldı
```

---

## 🧪 Test Etme

### Hızlı Test
```javascript
// 1. localStorage'a sahte verisi koy
localStorage.setItem('license_data', JSON.stringify({
  id: 'TEST123456789ABC',
  exp: '2025-12-31T00:00:00Z',
  type: 'professional'
}));

// 2. Sayfayı yenile (F5)
// 3. Panel'de veriler görülmeli

// 4. Temizle
localStorage.removeItem('license_data');
```

### Console Test
```javascript
// License Manager'ı test et
import { 
  calculateDaysRemaining,
  isLicenseExpired 
} from './lib/license-manager';

// 365 gün kaldığını kontrol et
console.log(calculateDaysRemaining('2025-12-31T00:00:00Z')); // 365+

// Süresi doldu kontrolü
console.log(isLicenseExpired('2020-01-01T00:00:00Z')); // true
```

---

## ✨ Özellikler

| Özellik | Durum | Not |
|---------|-------|-----|
| Panel Gösterimi | ✅ | Dashboard'ün üstünde |
| Cihaz Kimliği | ✅ | Kopyalanabilir |
| Bitiş Tarihi | ✅ | Dil'e göre formatlandı |
| Kalan Gün | ✅ | Gerçek zamanlı güncellenir |
| Lisans Uzatma | ✅ | Uygulamayı kapatmadan |
| Süre Birleştirme | ✅ | Mevcut + Yeni |
| localStorage | ✅ | Otomatik saklama |
| Dil Desteği | ✅ | TR/EN/DE |
| Renk Durumu | ✅ | Yeşil/Sarı/Kırmızı |

---

## 🔐 Güvenlik Özellikleri

✅ **Yerel Depolama**
- Tüm veriler localStorage'da (tarayıcı belleği)
- Sunucuya gönderilmez

✅ **MachineID Kontrol**
- Her cihaz için benzersiz kimlik
- Anahtarların cihaza bağlı olması

✅ **Base64 Kodlama**
- Anahtarlar Base64'te kodlanmış
- Taşınması kolay

⚠️ **Dikkat:**
- Private Mode'da localStorage depolanmaz
- Tarayıcı cache temizlerse veriler silinir
- Cihazdan cihaza transfer etmek için anahtarı kaydedin

---

## 🆘 Sorun Giderme

### Panel Görünmüyor?

```javascript
// 1. localStorage kontrol et
localStorage.getItem('license_data');

// 2. Lisans geçerliliğini kontrol et
localStorage.getItem('isLicenseValid');

// 3. Hata varsa sayfayı yenile
window.location.reload();
```

### Lisans Dosyası Bozuldu?

```javascript
// localStorage'ı temizle
localStorage.clear();

// Sayfayı yenile
window.location.reload();

// Lisans anahtarını yeniden gir
```

### Kalan Gün Güncellenmiyor?

```javascript
// Paneli aç/kapa
// Sayfayı yenile (F5)
// Konsolda hata var mı kontrol et (F12)
```

---

## 📚 Daha Fazla Bilgi

- **Detaylı Rehber:** `LICENSE_PANEL_GUIDE.md`
- **Test Kontrol Listesi:** `LICENSE_PANEL_TESTING.md`
- **PWA Kurulumu:** `PWA_SETUP.md`

---

## 🎉 Tamamlandı!

Lisans Yönetim Paneli başarıyla uygulamaya entegre edildi.

**Şimdi neler yapabilirsin?**

1. ✅ Uygulamayı aç → Panel görülecek
2. ✅ Paneli aç/kapa → Ok butonuyla
3. ✅ Lisans süresi uzat → "Süreyi Uzat" butonuyla
4. ✅ Kalan günleri takip et → Gerçek zamanlı güncelleme

**Sorular?** WhatsApp: https://wa.me/905425783748

---

**Sürüm:** 1.0  
**Tarih:** Aralık 2024  
**Dil Desteği:** 🇹🇷 🇬🇧 🇩🇪
