# Lisans Yönetim Paneli - Test ve Entegrasyon Kontrol Listesi

## ✅ Entegrasyon Kontrol Listesi

### 1. Dosyalar Oluşturuldu
- [ ] `src/components/LicensePanel.tsx` - Ana lisans paneli bileşeni
- [ ] `src/lib/license-manager.ts` - Lisans işlemleri utility fonksiyonları
- [ ] `Dashboard.tsx` - LicensePanel import ve entegrasyonu yapıldı

### 2. İmport'lar Kontrolü
- [ ] `Dashboard.tsx`'te `LicensePanel` import edildi
- [ ] `LicensePanel.tsx`'te tüm utility fonksiyonları import edildi
- [ ] `license-manager.ts` tüm fonksiyonları export ediyor

### 3. Durum Yönetimi
- [ ] `LicensePanel` state'ler doğru şekilde tanımlı
- [ ] `Dashboard` `handleLicenseUpdated` callback'i tanımlı
- [ ] localStorage okuma/yazma işlemleri çalışıyor

---

## 🧪 Fonksiyonel Test Adımları

### Test 1: Panel Görünürlüğü

**Adım 1:** Uygulamayı açın
- [ ] Dashboard yükleniyor
- [ ] Lisans Bilgisi Paneli görülüyor (en üstte)
- [ ] Panel başında mavi nokta var

**Adım 2:** Paneli aç/kapa
- [ ] Ok butonuna tıklayın
- [ ] Panel genişliyor
- [ ] Bilgiler görünüyor: Cihaz Kimliği, Bitiş Tarihi, Kalan Gün

### Test 2: Cihaz Kimliğini Kopyalama

**Adım 1:** Panel açık olduğundan emin olun
- [ ] Lisans Bilgisi Paneli açık

**Adım 2:** Kopyala butonuna tıklayın
- [ ] Kopyala butonunun rengi değişti (yeşil)
- [ ] "Kopyalandı!" mesajı göründü
- [ ] Cihaz Kimliği panoya kopyalandı

**Adım 3:** Doğru koşullar
- [ ] 2 saniye sonra buton normale döndü
- [ ] Panoya yapıştırabilirsiniz (Ctrl+V)

### Test 3: Lisans Bitiş Tarihi Gösterimi

**Adım 1:** Panel açık olduğundan emin olun
- [ ] Bitiş Tarihi görülüyor
- [ ] Format: GG.AA.YYYY (Türkçe) veya MM/DD/YYYY (İngilizce)

**Adım 2:** Kalan Gün Sayısı
- [ ] Kalan gün gösteriliyor
- [ ] Renk duruma göre değişiyor

### Test 4: Kalan Gün Renk Kontrolleri

**Durum 1:** 7+ gün kaldığında
- [ ] Kalan Gün bölümü **yeşil** renk
- [ ] Panel başındaki nokta **yeşil**

**Durum 2:** 1-7 gün kaldığında
- [ ] Kalan Gün bölümü **sarı** renk
- [ ] Panel başındaki nokta **sarı**

**Durum 3:** Süresi dolmuşsa
- [ ] Kalan Gün "SÜRESİ DOLDU" yazıyor
- [ ] Renkler **kırmızı**

### Test 5: Lisans Süresi Uzatma - Başarılı

**Ön Koşul:** Geçerli bir lisans anahtarınız olmalı

**Adım 1:** "Süreyi Uzat" butonuna tıklayın
- [ ] Giriş alanı ve buton görülüyor
- [ ] "Doğrula ve Uzat" ve "İptal" butonları var

**Adım 2:** Lisans Anahtarını Girin
- [ ] Anahtarı giriş alanına yapıştırın
- [ ] Anahtarın başı ve sonu doğru görünüyor

**Adım 3:** Doğrulayın
- [ ] "Doğrula ve Uzat" butonuna tıklayın
- [ ] Loading spinner göründü

**Adım 4:** Başarı Mesajı
- [ ] "✅ Lisans süresi başarıyla uzatıldı!" mesajı görüldü
- [ ] Panel otomatik olarak kapandı
- [ ] Kalan Gün sayısı arttı
- [ ] Bitiş Tarihi güncellendi

### Test 6: Lisans Süresi Uzatma - Hata Senaryoları

**Hata 1:** Boş Anahtarla Doğrulama
- [ ] Giriş alanı boş bırakın
- [ ] "Doğrula ve Uzat" tıklayın
- [ ] Hata mesajı: "Lütfen bir lisans anahtarı girin."

**Hata 2:** Yanlış Format
- [ ] Rastgele metinler yazın
- [ ] "Doğrula ve Uzat" tıklayın
- [ ] Hata mesajı: "Lisans anahtarı bozuk veya hatalı format!"

**Hata 3:** Yanlış Cihaz
- [ ] Başka cihazdan üretilen anahtarı yapıştırın
- [ ] "Doğrula ve Uzat" tıklayın
- [ ] Hata mesajı: "❌ Bu lisans bu cihaza ait değil!"

### Test 7: localStorage Entegrasyonu

**Adım 1:** Panel Açılışında Yükleme
- [ ] Uygulamayı açın
- [ ] Lisans bilgileri panel'de görülüyor
- [ ] localStorage'da `license_data` var (DevTools kontrol edin)

**Adım 2:** Sayfa Yenilemeden Sonra
- [ ] Sayfa yenilenin (F5)
- [ ] Lisans bilgileri hala görülüyor
- [ ] Bitiş tarihi değişmedi

**Adım 3:** localStorage Kontrol
```javascript
// DevTools Console'a yazın:
localStorage.getItem('license_data')
```
- [ ] JSON formatında veriler çıkıyor
- [ ] `id`, `exp`, `type` alanları var

### Test 8: Dil Değiştirme

**Adım 1:** Türkçe Mode
- [ ] Paneli açın
- [ ] Tüm metinler Türkçe
- [ ] Tarih formatı: GG.AA.YYYY

**Adım 2:** İngilizce Mode
- [ ] Dili İngilizceye değiştirin
- [ ] Paneli açın
- [ ] Tüm metinler İngilizce
- [ ] Tarih formatı: MM/DD/YYYY

**Adım 3:** Almanca Mode
- [ ] Dili Almancaya değiştirin
- [ ] Paneli açın
- [ ] Tüm metinler Almanca
- [ ] Tarih formatı: DD.MM.YYYY

### Test 9: Gerçek Zamanlı Güncelleme

**Adım 1:** Panel Açık Bırakın
- [ ] Paneli açık bırakın (10+ dakika)
- [ ] Kalan gün sayısı değişmedi (aynı gün içinde)

**Adım 2:** Gece Yarısı
- [ ] Sistem saatini gece yarısına ayarlayın
- [ ] Sayfayı yenileyip panel açın
- [ ] Kalan Gün sayısı 1 azaldı

### Test 10: Hata Durumunda Recovery

**Adım 1:** localStorage Bozukluk
```javascript
// DevTools Console'a yazın:
localStorage.setItem('license_data', 'BROKEN_DATA');
```
- [ ] Sayfayı yenileyip panel açın
- [ ] "Lisans bilgisi bulunamadı" mesajı görülüyor
- [ ] Uygulama çökmedi

**Adım 2:** Tamir
- [ ] "Süreyi Uzat" butonuna tıklayın
- [ ] Geçerli anahtarı yapıştırın
- [ ] Lisans yenilenir

---

## 🔍 Bileşen Davranış Kontrolleri

### LicensePanel Bileşeni

**Props Kontrolü:**
```typescript
interface LicensePanelProps {
  language: 'tr' | 'en' | 'de';  // ✓ Geçiyor
  onLicenseUpdated?: () => void;  // ✓ Optional callback
}
```

**State Kontrolü:**
- [ ] `licenseData` - Lisans verisi
- [ ] `expiryDate` - Bitiş tarihi
- [ ] `daysRemaining` - Kalan gün
- [ ] `showRenewForm` - Form gösterimi
- [ ] `newLicenseKey` - Input değeri
- [ ] `isLoading` - Yükleme durumu
- [ ] `message` - Hata/başarı mesajı

**Effect Kontrolü:**
- [ ] `useEffect` sayfa yüklemede çalışıyor
- [ ] `useEffect` her saniye kalan günleri güncelliyor

---

## 🎯 Performance Kontroller

- [ ] Panel açılması < 200ms
- [ ] Licensekey doğrulaması < 500ms
- [ ] localStorage erişimi < 50ms
- [ ] Panel kapatılması < 100ms
- [ ] Memory leak yok (DevTools ile kontrol)

---

## 🔐 Güvenlik Kontroller

- [ ] Base64 anahtarı decode edilemiyor → error handling
- [ ] MachineID eşleşmesi kontrol edildi
- [ ] Tarih validasyonu yapılıyor
- [ ] localStorage'a kaydedilen veriler encode edilmiyor (ama Public)

---

## 📊 Tarayıcı Uyumluluğu

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## 🚀 Son Kontroller

- [ ] Tüm türler (types) doğru tanımlandı
- [ ] Hiçbir `any` type kullanılmadı
- [ ] Console'da error yok
- [ ] Console'da warning yok
- [ ] Tüm bağlantılar çalışıyor

---

## 📝 Test Sonucu

**Test Tarihi:** ___________

**Tester Adı:** ___________

**Sonuç:** 
- [ ] Tüm testler başarılı
- [ ] Bazı testler başarısız (lütfen detay yazın)

**Notlar:**
```
_________________________________________
_________________________________________
_________________________________________
```

---

**Kontrol Listesi Tamamlanmıştır:** ✅
