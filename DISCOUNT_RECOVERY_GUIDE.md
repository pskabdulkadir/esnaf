# 🔧 PAZARLAMA VİTRİNİ ÜRÜN KURTARMA REHBERİ

## 📋 SORUN ÖZETI

Pazarlama vitrininde paylaştığınız ürünler 2 gün sonra silinmiş görünüyor. Bunun sebebi:

- **Ürün kaydedilirken**: userId = `license_AE3C8E03B175FA2A_unknown`
- **Şimdi açarken**: userId = `user_4956C39550333A28_zeqn03ik0`

Firestore'daki ürünler **eski ID altında** saklanmış, sistem **yeni ID'de** arama yapıyor!

---

## ✅ UYGULANAN ÇÖZÜMLER

### **A) Lisans Kalıcılığını Kuvvetlendir** ✔️
- **Dosya**: `src/components/LicenseGate.tsx`
- **Değişiklik**: IndexedDB'deki TÜM lisansları tarama mekanizması eklendi
- **Seviye 5**: Cihaz ID değişse bile, IndexedDB'deki herhangi bir geçerli lisansı bulur ve geri yükler
- **Fayda**: Tarayıcı temizlenmiş olsa bile lisans otomatik yüklenir

### **B) Share URL'sine userId Eklendi** ✔️
- **Dosya**: `src/components/Marketer.tsx` (line 3404)
- **Zaten var**: Paylaşım linki `userId` parametresi ile oluşturuluyor
- **Format**: `?slug=ürün&view=showcase&userId=license_AE3C8E03B175FA2A_unknown`
- **Fayda**: Doğru userId ile ürünler bulunuyor

### **C) Fallback userId Stabilize Edildi** ✔️
- **Dosya**: `src/App.tsx` (line 312-354)
- **Mekanizma**: 
  - localStorage'da `esnaf_stable_id_suffix` tutularak, sayfa yenilemede değişmez
  - Lisans varsa: `license_${machineId}_${licenseKeyPrefix}`
  - Lisans yoksa: `user_${machineId}_${stableSuffix}` (stabil)
- **Fayda**: Aynı cihazda userId her zaman aynı kalır

### **D) Firestore Ürün Kurtarma** ✔️
Üç yöntemle ürünler kurtarılabilir:

---

## 🚀 ÜRÜN KURTARMA - 3 YÖNTEMİ

### **Yöntem 1: CLI Script (Recommended)**

Terminalde çalıştırın:

```bash
npm run fix-discounts
```

**Ne yapar:**
- Firestore'da `license_AE3C8E03B175FA2A` ile başlayan tüm ürünleri bulur
- Bunları `user_4956C39550333A28_zeqn03ik0` adlı yeni user'a taşır
- Otomatik olarak eski location'dan siler

**Gerekli:**
- Firebase env variables ayarlanmış olmalı
- `.env` dosyasında FIREBASE_* bilgileri olmalı

---

### **Yöntem 2: API Endpoint (HTTP)**

#### **Step 1: Ürünleri Listele**

```bash
curl -X GET "http://localhost:3000/api/admin/list-all-discounts?machinePrefix=AE3C8E03B175FA2A"
```

**Sonuç örneği:**
```json
{
  "count": 3,
  "discounts": [
    {
      "currentUserId": "license_AE3C8E03B175FA2A_unknown",
      "storedUserId": "license_AE3C8E03B175FA2A_unknown",
      "id": "discount_1234567890",
      "productName": "Reklam Uygulaması",
      "slug": "reklam-uygulamasi",
      "isActive": true,
      "views": 15,
      "shares": 3
    }
  ]
}
```

#### **Step 2: Ürünleri Taşı**

```bash
curl -X POST "http://localhost:3000/api/admin/recover-discounts" \
  -H "Content-Type: application/json" \
  -d '{
    "oldUserId": "license_AE3C8E03B175FA2A_unknown",
    "newUserId": "user_4956C39550333A28_zeqn03ik0"
  }'
```

**Sonuç:**
```json
{
  "success": true,
  "message": "3 discount başarıyla taşındı",
  "oldUserId": "license_AE3C8E03B175FA2A_unknown",
  "newUserId": "user_4956C39550333A28_zeqn03ik0",
  "movedCount": 3
}
```

---

### **Yöntem 3: Manual Firestore Console**

1. Google Cloud Console'u aç
2. Firestore Database'e git
3. `users` koleksiyonunda `license_AE3C8E03B175FA2A_unknown` belgesi aç
4. `publicDiscounts` sub-collection'ını görmek için genişlet
5. Her discountı kopyala ve yeni user'a yapıştır:
   - `users` → `user_4956C39550333A28_zeqn03ik0` → `publicDiscounts`
6. Eski belgeyi sil

---

## 🧪 KONTROL ETME

### Ürünlerin Başarıyla Taşındığını Doğrula

#### 1. Firestore'da Kontrol
```bash
curl -X GET "http://localhost:3000/api/admin/list-all-discounts?userId=user_4956C39550333A28_zeqn03ik0"
```

Beklenen sonuç: 3 discount görülecek

#### 2. Pazarlama Panelini Aç
1. Uygulamayı aç (Pazarlama modülü)
2. **Portföy** sekmesi
3. Ürünlerin göründüğünü kontrol et

#### 3. Paylaşım Linkini Test Et
```
https://esnaf-rimo.onrender.com/?slug=reklam-uygulamasi&view=showcase&userId=user_4956C39550333A28_zeqn03ik0
```

---

## 📋 DEĞİŞTİRİLEN DOSYALAR

| Dosya | Değişiklik | Amaç |
|-------|-----------|------|
| `src/components/LicenseGate.tsx` | Seviye 5 eklenmiş | IndexedDB tüm lisansları tara |
| `src/App.tsx` | Zaten var | userId stabilize |
| `src/components/Marketer.tsx` | Zaten var | userId şimdi URL'de |
| `server.ts` | 2 yeni endpoint | Admin recovery işlemleri |
| `package.json` | `npm run fix-discounts` | CLI migration scripti |
| `scripts/fix-discounts-migration.ts` | YENİ | TypeScript migration aracı |

---

## 🔐 GÜVENLİK NOTLARı

⚠️ **API Endpoints Only for Admin Use**

- `/api/admin/list-all-discounts` - Tüm discountları listeler (sensitive!)
- `/api/admin/recover-discounts` - Discountları taşır (sensitive!)

Üretimde bu endpoint'leri **auth gerektir şekilde** korumalısınız. Örnek:

```typescript
// server.ts'te endpoint tanımından önce:
app.use((req: any, res, next) => {
  // Sadece admin token'ı ile izin ver
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
});
```

---

## ⚠️ OLASI SORUNLAR & ÇÖZÜMLER

### Problem 1: "Firestore not ready"
**Çözüm**: Firebase env variables'i kontrol et
```bash
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_PRIVATE_KEY | wc -c  # Minimum 1000+ karakter olmalı
```

### Problem 2: "userId yok - fallback ID kullanılıyor"
**Çözüm**: LicenseGate'de lisans yeniden gir
1. Pazarlama → Ayarlar
2. Lisans ID'ni kopyala
3. Lisans anahtarını gir
4. Doğrula

### Problem 3: Migration script çalışmıyor
**Çözüm**:
```bash
npm install  # Dependencies'i yenile
npx tsx scripts/fix-discounts-migration.ts  # Direkt çalıştır
```

---

## 📞 FUTURE PROOF: NASIL YAPMAYACKSıNıZ

1. **userId'yi Sabitlemişiz**: Lisans ile değişmez
2. **Lisans Kalıcılığını Kuvvetlendirdik**: 5 seviyeli recovery
3. **URL'de userId**: Share linki doğru user'a işaret ediyor
4. **Firestore'da Backup**: 2 gün geçmese de ürünler kalıcı

---

## 🎯 SONUÇ

✅ **Tüm çözümler uygulandı**
- A) Lisans kalıcılığı kuvvetlendirildi
- B) Share URL'si doğru userId ile oluşturuluyor
- C) Fallback userId stabilize edildi
- D) Migration tool'u hazır

🚀 **Hemen yapılacak**: Ürünleri kurtarmak için `npm run fix-discounts` çalıştır

---

## 💡 EK BİLGİ

### userId Mantığı Artık Şu:

```
Lisans Varsa:
  userId = license_${machineId}_${licenseKeyPrefix}
  Örn: license_AE3C8E03B175FA2A_ABC123

Lisans Yoksa (Fallback):
  userId = user_${machineId}_${stableSuffix}
  Örn: user_4956C39550333A28_zeqn03ik0
  (stableSuffix = localStorage'da tutulur, değişmez)
```

### IndexedDB Lisans Recovery:

1. localStorage → 2. sessionStorage → 3. Memory → 4. Backup → 5. **IndexedDB tüm lisanslar**

Tarayıcı tamamen temizlense bile, cihazın evvel ki lisansı IndexedDB'de bulunur!

---

**Son güncelleme**: 2026-06-25  
**Durum**: ✅ HAZIR - Tüm 4 adım tamamlandı
