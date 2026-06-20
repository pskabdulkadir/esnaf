# Firestore Kullanıcı Erişim Kontrolü - Yönetim Rehberi

## 📋 Genel Bilgi

Sistem artık **cihaz/kullanıcı bazlı erişim kontrolü** (isDeviceAuthorized → isAccessAllowed) yapısına geçmiştir. Sunucuyu genel olarak kapamak yerine, her kullanıcının/esnafın erişim durumunu bağımsız olarak kontrol edebilirsiniz.

---

## 🗄️ Firestore Yapısı

### Users Koleksiyonu

```
Firestore
└── Users
    └── [deviceId]  (document ID = cihaz kimliği)
        ├── deviceId: string
        ├── isAccessAllowed: boolean  ⭐ (true/false)
        ├── currentVersion: string
        ├── platform: string
        ├── createdAt: timestamp
        └── lastOnlineTime: timestamp
```

---

## 🎮 Nasıl Çalışır?

### 1️⃣ Uygulama Başlangıcında

```
Kullanıcı uygulamayı açar
     ↓
Firebase bağlantısı kontrol edilir
     ↓
Users koleksiyonunda cihaz aranır
     ↓
isAccessAllowed değeri kontrol edilir
     ↓
```

### 2️⃣ İzin Varsa (isAccessAllowed = true)
- ✅ Uygulama normal şekilde açılır
- ✅ Tüm özellikler kullanılabilir
- ✅ Veriler SQLite'de saklanır

### 3️⃣ İzin Yoksa (isAccessAllowed = false)
- 🔒 **"Erişiminiz geçici olarak durdurulmuştur"** ekranı gösterilir
- ❌ Hiçbir özellik kullanılamaz
- ✅ Yerel veriler **silinmez**, korunur

---

## 🔧 Firebase Üzerinden Yönetim

### Adım 1: Firebase Console'a Giriş Yap
1. https://console.firebase.google.com adresine git
2. Proje adını seç

### Adım 2: Firestore Database'e Git
- Sol menüden **Firestore Database** tıkla

### Adım 3: Kullanıcı Erişimini Düzenle

#### Erişim Vermek (isAccessAllowed = true)
```
1. "Users" koleksiyonuna tıkla
2. İlgili cihaz ID'sini seç
3. "isAccessAllowed" alanını true olarak ayarla
4. Kaydet
```

#### Erişimi Kesmek (isAccessAllowed = false)
```
1. "Users" koleksiyonuna tıkla
2. İlgili cihaz ID'sini seç
3. "isAccessAllowed" alanını false olarak ayarla
4. Kaydet
👤 Kullanıcı uygulamayı açtığında erişim reddedilir
```

---

## 💡 Örnek Senaryolar

### Senaryo 1: Esnafın Erişimini Geçici Kesmek
```
Firebase > Firestore > Users > [Esnafın Cihaz ID'si]
isAccessAllowed: false ← değiştir

Sonuç: Esnaf uygulamayı açamamaz ✗
Sunucu çalışır, diğer esnaflar etkilenmez ✓
```

### Senaryo 2: Yeniden Erişim Sağlamak
```
Firebase > Firestore > Users > [Esnafın Cihaz ID'si]
isAccessAllowed: true ← değiştir

Sonuç: Esnaf uygulamayı açabilir ✓
Kaldığı yerden devam eder ✓
```

### Senaryo 3: İlk Kez Açılan Cihaz
```
Yeni cihaz uygulamayı açar
↓
Firebase > Users > Yeni bir document otomatik oluşturulur
↓
isAccessAllowed: true (varsayılan)
↓
Uygulamaya erişim sağlanır ✓
```

---

## 🔄 Offline Modu

### İnternet Bağlantısı Yokken Ne Olur?
- ✅ Eğer daha önce izin verilmişse → Uygulamaya erişim sağlanır (3 gün)
- ❌ Eğer daha önce izin verilmemişse → Erişim reddedilir

### 3 Günlük Offline Grace Süresi
- Son online kontrol tarihinden itibaren 3 gün boyunca
- İnternet olmadan da uygulamaya erişim sağlanır
- 3 gün sonra → İnternet gerekli

---

## 🛠️ Geliştirici Notları

### Kod Değişiklikleri
- **runSovereigntyAuthCheck()** fonksiyonu güncellenmiştir
- `Users` koleksiyonundan `isAccessAllowed` alanı kontrol edilir
- Eski `Devices.isAuthorized` yapısı kaldırılmıştır

### Storage Keys
- `akn_cached_user_access` → isAccessAllowed cache'i
- `akn_cached_auth_state` → Bağlantı durumu

---

## ⚠️ Önemli Notlar

1. **Sunucu Devre Dışı Bırakmak Yerine**
   - Belirli kullanıcıları kesmek için isAccessAllowed kullan
   - Sistemin tamamını kapatmaya gerek yok

2. **Veriler Silinmez**
   - Erişim reddedilse bile yerel SQLite veriler korunur
   - Yönetici erişim sağladığında kaldığı yerden devam eder

3. **Cihaz ID'si**
   - localStorage'da `akn_device_id` olarak saklanır
   - Her cihazın benzersiz kimliği vardır

4. **Otomatik Kayıt**
   - İlk açılışta cihaz otomatik Users'a eklenir
   - Manuel oluşturmaya gerek yok

---

## 📞 Hızlı Başvuru

| İşlem | Firebase Yolu | Ayar |
|-------|---------------|------|
| Erişimi Kesmek | Users > [ID] > isAccessAllowed | `false` |
| Erişimi Vermek | Users > [ID] > isAccessAllowed | `true` |
| Cihaz İD'sini Bulmak | Uygulamada footer bölümünde | "Cihaz Kimliği" |

---

**Son Güncelleme:** 2026
**Versiyon:** 1.2.0
