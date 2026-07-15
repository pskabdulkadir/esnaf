# 🔐 Lisans Sistemi Test Rehberi

## 2. Aşama: Anahtar Çözme ve Doğrulama

Lisans sistemi şu işlemleri yapıyor:

### ✅ Entegre Edilen İşlemler:

1. **Base64 Decode** (`atob()`)
   - Girilen anahtarı Base64'ten çöz
   - JSON formatına dönüştür

2. **MachineID Eşleştirme**
   - Çözülen anahtardaki `id` değeri
   - Cihazın mevcut `MachineID` ile kontrol et
   - **Eşleşmiyor ise** → ❌ "Bu lisans bu cihaza ait değil!"

3. **Tarih Kontrolü**
   - Çözülen anahtardaki `exp` (expiry) değeri
   - Bugünün tarihi ile karşılaştır
   - **Geçmiş tarihi ise** → ⏰ "Lisans süreniz dolmuştur!"

4. **Hata Yönetimi**
   - Geçersiz Base64 → "Lisans anahtarı bozuk veya hatalı format!"
   - Geçersiz JSON → "Geçersiz lisans anahtarı!"
   - Eksik alanlar → "Geçersiz lisans anahtarı formatı!"

---

## 🧪 TEST SENARYOLARI

### 1️⃣ **BAŞARILI TEST** ✅
**Doğru MachineID + Geçerli Tarih**

**Adımlar:**
1. Uygulamayı aç → Lisans Giriş Ekranı görünür
2. **MachineID'yi kopyala** (Kopyala butonuna tıkla)
3. `anahtar_uretici.html` dosyasını tarayıcıda aç
4. MachineID'yi yapıştır
5. Bitiş tarihini **bugünden sonraki bir tarih** seç (örn: 30 gün sonra)
6. **"Anahtarı Üret"** butonuna tıkla
7. Oluşturulan anahtarı **kopyala**
8. Uygulamaya dön, anahtarı **yapıştır**
9. **"Doğrula ve Başlat"** butonuna tıkla

**Beklenen Sonuç:**
- ✅ "Lisans anahtarı alındı!" mesajı görünür (yeşil)
- ✅ 1 saniye sonra ana uygulama sayfasına geç
- ✅ Lisans giriş ekranı artık gösterilmez (localStorage kaydı vardır)

---

### 2️⃣ **BAŞARISIZ TEST: Yanlış MachineID** ❌
**Başka bir cihazın MachineID'si ile anahtar üret**

**Adımlar:**
1. `anahtar_uretici.html` dosyasını aç
2. **BAŞKA BİR (saçma) MachineID** yapıştır
   - Örn: `FFFFFFFFFFFFFFFF` (16 F karakteri)
3. Geçerli bir tarih seç
4. **"Anahtarı Üret"** butonuna tıkla
5. Oluşturulan anahtarı kopyala
6. Uygulamaya dön, anahtarı yapıştır
7. **"Doğrula ve Başlat"** butonuna tıkla

**Beklenen Sonuç:**
- ❌ **"Bu lisans bu cihaza ait değil!"** mesajı görünür (kırmızı)
- ❌ Uygulama açılmaz
- ❌ Lisans giriş ekranında kalır

---

### 3️⃣ **BAŞARISIZ TEST: Geçmiş Tarih** ⏰
**Dün veya daha önceki tarih ile anahtar üret**

**Adımlar:**
1. `anahtar_uretici.html` dosyasını aç
2. Doğru MachineID'yi yapıştır
3. **Bitiş tarihi olarak DÜNÜ seç** (veya daha eski bir tarih)
   - Örn: Eğer bugün 21 Haziran 2026 ise, 20 Haziran 2026'yı seç
4. **"Anahtarı Üret"** butonuna tıkla
5. Oluşturulan anahtarı kopyala
6. Uygulamaya dön, anahtarı yapıştır
7. **"Doğrula ve Başlat"** butonuna tıkla

**Beklenen Sonuç:**
- ⏰ **"Lisans süreniz dolmuştur!"** mesajı görünür (kırmızı)
- ❌ Uygulama açılmaz
- ❌ Lisans giriş ekranında kalır

---

### 4️⃣ **BAŞARISIZ TEST: Bozuk Anahtar** 💥
**Rastgele veya geçersiz anahtar gir**

**Adımlar:**
1. Uygulamaya dön
2. Lisans anahtarı input alanına **rastgele yazılar** yaz
   - Örn: `asdlkasjdlkjasldk123!@#`
3. **"Doğrula ve Başlat"** butonuna tıkla

**Beklenen Sonuç:**
- 💥 **"Lisans anahtarı bozuk veya hatalı format!"** mesajı görünür (kırmızı)
- ❌ Uygulama açılmaz

---

### 5️⃣ **BAŞARISIZ TEST: Boş Anahtar** ⚠️
**Hiçbir şey yazmadan buton tıkla**

**Adımlar:**
1. Uygulamaya dön
2. Lisans anahtarı input alanını **boş bırak**
3. **"Doğrula ve Başlat"** butonuna tıkla

**Beklenen Sonuç:**
- ⚠️ **"Lütfen bir lisans anahtarı girin."** mesajı görünür (kırmızı)
- ❌ Uygulama açılmaz

---

## 🔧 **localStorage VERİSİ**

Başarılı doğrulama sonrası browser'ın localStorage'nda şu veriler kaydedilir:

```javascript
// localStorage'da kaydedilen veriler:
localStorage.getItem('license_key_submitted')  // Girilen anahtar (Base64)
localStorage.getItem('license_data')           // Çözülen veri {id, exp, type}
localStorage.getItem('isLicenseValid')         // "true"
```

### localStorage'ı Temizlemek:
Tarayıcı DevTools'ta (F12):
```javascript
// Console'da çalıştır:
localStorage.removeItem('isLicenseValid');
localStorage.removeItem('license_key_submitted');
localStorage.removeItem('license_data');
```

Sonra sayfayı yenile → Lisans giriş ekranı tekrar görünür

---

## 📝 **Anahtar Formatı**

Oluşturulan anahtar şu JSON'un Base64 kodlanmış hali:

```json
{
  "id": "A1B2C3D4E5F6G7H8",
  "exp": "2026-07-21",
  "type": "standard"
}
```

**Base64 Kodlanmış Hali (örnek):**
```
eyJpZCI6IkExQjJDM0Q0RTVGNkc3SDgiLCJleHAiOiIyMDI2LTA3LTIxIiwidHlwZSI6InN0YW5kYXJkIn0=
```

---

## 🎯 **Tüm Kontroller Başarılı Olduğunda:**

1. ✅ Anahtar Base64'ten çözülür
2. ✅ JSON parse edilir
3. ✅ MachineID eşleşir
4. ✅ Tarih geçmiş değildir
5. ✅ Tüm gerekli alanlar var

**→ localStorage'a kaydedilir**
**→ Uygulamaya giriş yapılır**
**→ Dashboard açılır**

---

## 🔒 **Güvenlik Notları**

- 🔐 Tüm işlemler **tamamen offline** (tarayıcı içinde)
- 🔐 MachineID veya anahtar **hiçbir sunucuya gönderilmez**
- 🔐 Base64 kodlama **şifreleme değildir**, sadece veri formatıdır
- 🔐 Anahtarı çalmış biri başka bir cihazda kullanamaz (MachineID kontrolü)
- 🔐 Lisans süresi dolduğunda otomatik olarak erişim kesilir

---

## ✨ **Başarı Kriterleri**

Aşağıdaki testlerin hepsi **geçerse**, 2. Aşama başarılı:

- [x] Test 1: Doğru anahtar → Uygulamaya giriş ✅
- [x] Test 2: Yanlış MachineID → Hata mesajı ❌
- [x] Test 3: Geçmiş tarih → Hata mesajı ⏰
- [x] Test 4: Bozuk anahtar → Hata mesajı 💥
- [x] Test 5: Boş anahtar → Hata mesajı ⚠️
