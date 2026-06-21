# AKN Global - PWA Kurulumu ve Rehberi

## 📱 PWA Nedir?

PWA (Progressive Web App), tarayıcı tabanlı bir web uygulamasının masaüstüne yüklenebilir bir "native app" gibi çalışmasını sağlar.

## ✅ Kurulu Özellikler

### 1. **Manifest.json** (`public/manifest.json`)
- Uygulamayı tanımlayan bilgiler
- İkon, başlık, renk şemaları
- Kişisel kısayollar (Envanter, Satış)

### 2. **Service Worker** (`public/service-worker.js`)
- Offline çalışma desteği
- Dosya caching
- Network hataları için fallback

### 3. **İkonlar** (`public/icon-*.svg`)
- 192x192 ve 512x512 boyutlarında SVG simgeler
- Maskable simgeler (modern Android cihazlar için)
- Renkli gradient tasarım

### 4. **Deployment Ayarları** (`vercel.json`)
- Doğru HTTP headers
- Service Worker cache kontrol
- URL rewriting

## 🖼️ Kendi PNG Simgelerini Eklemek

### Adım 1: Simgelerinizi Hazırlayın
Şu boyutlarda PNG dosyaları oluşturun (önerilen):
- **192x192 px** - Varsayılan simge
- **512x512 px** - Splash screen ve başlangıç simgesi
- **144x144 px** (opsiyonel) - Bazı cihazlar için
- **96x96 px** (opsiyonel) - Küçük simgeler

### Adım 2: Dosyaları Ekleyin
Simge dosyalarını `public/` klasörüne kopyalayın:
```
public/
├── icon-192.png
├── icon-512.png
├── icon-144.png
└── icon-96.png
```

### Adım 3: manifest.json'u Güncelleyin
`public/manifest.json` içindeki `icons` bölümünü şu şekilde değiştirin:

```json
"icons": [
  {
    "src": "/icon-96.png",
    "sizes": "96x96",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icon-192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icon-192-maskable.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "maskable"
  }
]
```

### Adım 4: index.html'yi Güncelleyin
`index.html` içindeki apple-touch-icon'u değiştirin:

```html
<link rel="apple-touch-icon" href="/icon-192.png" />
```

## 🎨 İyi PNG Simge Tasarımı İpuçları

1. **Kontrast**: Koyu arka planda açık renk, açık arka planda koyu renk kullanın
2. **Güvenlik Alanı**: Simgenin etrafında 10-20px boşluk bırakın
3. **Köşeler**: PNG simgeler için köşeleri yumuşak yapın (border-radius)
4. **Renk Uyumu**: Manifest'teki theme_color ile uyumlu renkler seçin
5. **PNG Optimizasyonu**: Dosyaları https://tinypng.com ile sıkıştırın

## 🧪 PWA'nızı Test Etmek

### Chrome/Edge:
1. DevTools açın (F12)
2. Application sekmesine gidin
3. Manifest ve Service Worker'ı kontrol edin

### Firefox:
1. about:debugging yazın adres çubuğuna
2. This Firefox'ı seçin
3. Service Workers'ı kontrol edin

### Telefonda:
1. Uygulamayı tarayıcıda açın
2. Üç nokta menüsü → "Uygulamayı yükle" veya "Ana ekrana ekle"
3. Masaüstüne simge eklenecek

## 📋 Checklist

- [ ] manifest.json doğru yapılandırılmış
- [ ] Service Worker başarıyla kaydedildi
- [ ] İkonlar görüntüleniyor
- [ ] Offline mod çalışıyor
- [ ] Telefonda yükleme seçeneği görünüyor

## 🔧 Sorun Giderme

### Simgeler görünmüyor
- İcon dosyalarının `public/` klasöründe olduğunu kontrol edin
- manifest.json'daki src yollarını doğrulayın
- Tarayıcı cache'ini temizleyin (Ctrl+Shift+Del)

### Service Worker kaydolmuyor
- Console'da hataları kontrol edin
- service-worker.js dosyasının `public/` klasöründe olduğunu kontrol edin
- HTTPS üzerinde yayında olduğundan emin olun

### Yükleme butonu görünmüyor
- Manifest dosyası geçerli olduğundan emin olun
- İkonlar var mı kontrol edin
- En az 30 saniye kullanıcı uygulama ile etkileşimde olmuş mu

## 📚 Kaynaklar

- [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Google Developers - App Manifest](https://developers.google.com/web/fundamentals/web-app-manifest)

---

**Geçerli Yapılandırma:** SVG simgeler + Service Worker + Offline desteği aktif ✅
