# Lisans Yönetim Paneli - Kullanıcı ve Geliştirici Rehberi

## 📋 İçindekiler
1. [Kullanıcı Kılavuzu](#kullanıcı-kılavuzu)
2. [Teknik Detaylar](#teknik-detaylar)
3. [Sorun Giderme](#sorun-giderme)

---

## 👥 Kullanıcı Kılavuzu

### Lisans Bilgisi Paneli Nedir?

Lisans Bilgisi Paneli, uygulamanın Dashboard'unda her zaman görünen bir panel olup:
- **Cihaz Kimliğinizi** gösterir
- **Lisans Bitiş Tarihini** gösterir
- **Kalan Gün Sayısını** gösterir (gerçek zamanlı güncellenir)
- **Lisans Süresini Uzatmanızı** sağlar

### Panel Konumu

Panel, Dashboard'ün en üstünde yer alır. Uygulamaya her giriş yaptığınızda görülebilir.

### Paneli Nasıl Kullanırım?

#### 1. Paneli Açmak/Kapatmak

Panel başında **Yukarı/Aşağı Ok** butonunu tıklayarak paneli açıp kapatabilirsiniz.

#### 2. Cihaz Kimliğini Kopyalamak

- Panel açıkken **"Kopyala"** butonunu tıklayın
- Cihaz Kimliği (16 karakterli kod) panoya kopyalanacak
- "Kopyalandı!" mesajı görülecek

#### 3. Lisans Süresini Uzatmak

**Adım 1:** Panel açıkken **"Süreyi Uzat"** butonunu tıklayın

**Adım 2:** Lisans Anahtarını Girin
- Yeni lisans anahtarınızı giriş alanına yapıştırın
- Anahtarı bir lisans üretici sisteminden almalısınız

**Adım 3:** Doğrulayın
- **"Doğrula ve Uzat"** butonunu tıklayın
- Sistem anahtarı kontrol edecek

**Adım 4:** Başarı Mesajı
- Başarılıysa: "✅ Lisans süresi başarıyla uzatıldı!" mesajı görülecek
- Panel otomatik olarak güncellenecek
- Yeni bitiş tarihi ve kalan gün gösterilecek

### Renkler Ne Anlama Geliyor?

Panel başındaki renkli nokta lisans durumunu gösterir:

| Renk | Anlamı | Durum |
|------|--------|-------|
| 🟢 Yeşil | Yeterli | 7 gün veya daha fazla kaldı |
| 🟡 Sarı | Uyarı | 1-7 gün kaldı |
| 🔴 Kırmızı | Kritik | Süresi doldu |

### Hata Mesajları

| Hata | Çözümü |
|------|--------|
| "Bu lisans bu cihaza ait değil!" | Yanlış cihaz için üretilen anahtarı kullanıyorsunuz. Cihaz Kimliğinizi kontrol edin. |
| "Geçersiz lisans anahtarı formatı!" | Anahtarın formatı hatalı. Anahtarı tamamen kopyaladığınızdan emin olun. |
| "Lisans anahtarı bozuk veya hatalı format!" | Anahtarı yanlış yapıştırdınız. Tekrar deneyin. |

---

## 🔧 Teknik Detaylar

### Bileşen Yapısı

```
src/components/
├── LicensePanel.tsx          # Ana lisans paneli bileşeni
└── Dashboard.tsx              # Panel'i içeren ana dashboard

src/lib/
├── license-manager.ts         # Lisans işlemleri utility fonksiyonları
└── machine-id.ts              # Cihaz kimliği yönetimi
```

### localStorage Yapısı

Panel şu verileri localStorage'da saklarır:

```javascript
// Lisans Verisi
{
  "license_data": {
    "id": "XXXXXXXXXXXXXXXX",      // MachineID
    "exp": "2025-12-31T00:00:00",  // ISO format bitiş tarihi
    "type": "professional"          // Lisans türü
  },
  
  // Son gönderilen anahtarı hafızada tutma
  "license_key_submitted": "eyJpZCI6IlhYWFhYWFhYWFhYWFhYWFgiLCJleHAi..."
}
```

### Lisans Anahtarı Formatı

Lisans Anahtarı şu yapıda Base64 encoded JSON'dur:

```javascript
{
  "id": "XXXXXXXXXXXXXXXX",       // 16 karakterli MachineID
  "exp": "2025-12-31T00:00:00",   // ISO format bitiş tarihi
  "type": "professional"          // Lisans türü
}
```

### Süresi Uzatma Mantığı

Yeni lisans eklendiğinde:

1. **Mevcut Bitiş Tarihi**: 2025-03-31
2. **Yeni Lisanstaki Tarih**: 2025-04-30 (30 gün)
3. **Sonuç**: 2025-03-31 + 30 gün = **2025-04-30**

Yani yeni lisanstaki gün sayısı mevcut bitiş tarihine eklenir.

### Kullanılan Fonksiyonlar

#### `loadLicenseData()`
localStorage'dan lisans verilerini yükler.

#### `saveLicenseData(data)`
Lisans verilerini localStorage'a kaydeder.

#### `decodeLicenseKey(key)`
Base64 anahtarını decode eder ve JSON'a dönüştürür.

#### `calculateDaysRemaining(expiryDateStr)`
Verilen tarihten kalan gün sayısını hesaplar.

#### `combineLicensePeriods(current, new)`
Mevcut ve yeni dönemleri birleştirir.

#### `validateMachineId(licenseId, currentMachineId)`
MachineID'lerin eşleşip eşleşmediğini kontrol eder.

#### `validateLicenseFormat(data)`
Lisans verisi formatının doğru olup olmadığını kontrol eder.

---

## 🐛 Sorun Giderme

### Panel Görünmüyor

**Çözüm:**
1. Dashboard açık mı kontrol edin
2. Uygulamayı yenileyin (F5)
3. localStorage'ı temizleyin: DevTools → Application → localStorage → Clear All

### Lisans Bilgileri Güncellenmedi

**Çözüm:**
1. Sayfayı yenileyin
2. Paneli kapat/aç
3. localStorage'da `license_data` var mı kontrol edin

### Süre Uzatma Başarısız Oldu

**Çözüm:**
1. Anahtarı tamamen kopyaladığınızdan emin olun (sonunda space olmasın)
2. Cihaz Kimliğiniz doğru mu kontrol edin
3. Anahtarın bu cihaz için üretilmiş olduğundan emin olun

### Cihaz Kimliği Değişti

**Çözüm:**
localStorage'daki `license_machine_id` değişirse yeni bir lisans anahtarı gerekir.

```javascript
// Cihaz Kimliğini sıfırlamak için konsola yazın:
localStorage.removeItem('license_machine_id');
```

---

## 📱 Dil Desteği

Panel otomatik olarak uygulamanın dil seçimine uyar:
- 🇹🇷 Türkçe
- 🇬🇧 İngilizce  
- 🇩🇪 Almanca

---

## 🔐 Güvenlik

✅ Tüm veriler **yerel olarak** (localStorage) saklanır
✅ Lisans anahtarınız hiçbir sunucuya gönderilmez
✅ MachineID şifrelenmiş değildir ama uygulamaya özel benzersizdir

---

## 📊 İstatistikler

Panel süreyi "gerçek zamanlı" olarak gösterir:
- Her saniye yenilenir
- Gece yarısında otomatik olarak gün sayısı güncellenir
- Tarayıcı kapansa bile localStorage'dan tekrar yüklenir

---

## 🚀 Gelişmiş Kullanım

### Lisansı Sıfırlamak

localStorage'ı tamamen temizlemek istiyorsanız DevTools'ı kullanın:

```javascript
localStorage.clear();
```

### Birden Fazla Cihazda Kullanmak

Her cihazın kendine ait bir MachineID vardır. Her cihaz için ayrı bir lisans anahtarı gereklidir.

### Lisans Verilerini Yedeklemek

```javascript
// Console'a yazın:
JSON.parse(localStorage.getItem('license_data'))
```

---

## 📞 Destek

Sorularınız için WhatsApp: https://wa.me/905425783748

---

**Son Güncelleme:** Aralık 2024
