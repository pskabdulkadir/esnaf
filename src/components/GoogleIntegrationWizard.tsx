import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, AlertCircle, Loader, ExternalLink } from 'lucide-react';

interface GoogleIntegrationWizardProps {
  onSuccess?: (gaId: string, adsId: string) => void;
  initialGaId?: string;
  initialAdsId?: string;
}

export default function GoogleIntegrationWizard({ 
  onSuccess, 
  initialGaId = "", 
  initialAdsId = "" 
}: GoogleIntegrationWizardProps) {
  const [gaId, setGaId] = useState(initialGaId);
  const [adsId, setAdsId] = useState(initialAdsId);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [validationStatus, setValidationStatus] = useState<{
    ga?: boolean;
    ads?: boolean;
  }>({});

  // Regex validation patterns
  const GA_REGEX = /^G-[A-Z0-9]{10,12}$/i;
  const ADS_REGEX = /^AW-\d{8,12}$/;

  // Real-time validation
  useEffect(() => {
    setValidationStatus({
      ga: gaId ? GA_REGEX.test(gaId) : false,
      ads: adsId ? ADS_REGEX.test(adsId) : false,
    });
  }, [gaId, adsId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    if (!gaId || !adsId) {
      setErrorMessage("❌ Her iki kimlik alanı da doldurulmalıdır.");
      return;
    }

    if (!GA_REGEX.test(gaId)) {
      setErrorMessage("❌ Google Analytics Kimliği geçersiz. 'G-' ile başlamalı ve 10-12 karakter olmalıdır.");
      return;
    }

    if (!ADS_REGEX.test(adsId)) {
      setErrorMessage("❌ Google Ads Kimliği geçersiz. 'AW-' ile başlamalı ve rakam içermelidir.");
      return;
    }

    setIsLoading(true);

    try {
      // Save to backend/Firestore
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleAnalyticsId: gaId,
          googleAdsId: adsId,
          integrationCompleted: true,
          integrationCompletedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setSuccessMessage(
        `✅ BAŞARILI! Google Analytics (${gaId}) ve Google Ads (${adsId}) başarıyla bağlandı.`
      );

      // Callback
      if (onSuccess) {
        onSuccess(gaId, adsId);
      }

      setCurrentStep(3);
      // Auto-redirect to next step after 1 second
      setTimeout(() => {
        setCurrentStep(4);
      }, 1000);
    } catch (err) {
      setErrorMessage(
        `❌ Bağlantı Hatası: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Welcome & Info
  if (currentStep === 1) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Step Indicator */}
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all ${
                step <= currentStep ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold text-blue-900 mb-2">
            🚀 Google Entegrasyon Sihirbazı (Adım 1/4)
          </h2>
          <p className="text-sm text-blue-800 leading-relaxed">
            İşletmenizi saniyeler içinde Google Analytics ve Google Ads'e bağlayın. 
            Müşteri tıklamalarını otomatik olarak izleyin ve reklam performansını ölçün.
          </p>
        </div>

        {/* Welcome Content */}
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Bu Sihirbaz Neler Yapacak?</h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold text-lg">✓</span>
                <div>
                  <p className="font-semibold text-slate-900">Google Analytics Bağlantısı</p>
                  <p className="text-xs text-slate-600 mt-1">Tüm müşteri ziyaretlerini ve satın alımlarını otomatik olarak Google Analytics'e gönder</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-600 font-bold text-lg">✓</span>
                <div>
                  <p className="font-semibold text-slate-900">Google Ads Bağlantısı</p>
                  <p className="text-xs text-slate-600 mt-1">Reklam kampanyalarının performansını ölç ve dönüşümleri takip et</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-600 font-bold text-lg">✓</span>
                <div>
                  <p className="font-semibold text-slate-900">Google Search Console Hazırlığı</p>
                  <p className="text-xs text-slate-600 mt-1">İşletmenizi Google Arama sonuçlarına yayınlayın (sonraki adımda)</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4">
            <p className="text-sm text-amber-900 font-semibold">
              ⏱️ <strong>Toplam Süre:</strong> 5 dakika. Tüm veri Google'a güvenli bir şekilde gönderilir.
            </p>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentStep(2)}
          className="w-full py-3 px-4 rounded-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Başla ✨
        </button>
      </div>
    );
  }

  // Step 2: Form
  if (currentStep === 2) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Step Indicator */}
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all ${
                step <= currentStep ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold text-blue-900 mb-2">
            🔑 Kimliklerinizi Girin (Adım 2/4)
          </h2>
          <p className="text-sm text-blue-800 leading-relaxed">
            Google Analytics ve Google Ads kimliklerinizi yapıştırın
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Google Analytics ID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-700">
                Google Analytics Kimliği (G-ID)
              </label>
              <div className="group relative cursor-help" title="Yardım için tıklayın">
                <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                <div className="absolute right-0 top-6 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg p-3 w-48 z-10 shadow-lg">
                  <p className="font-semibold mb-1">Google Analytics ID nasıl bulunur?</p>
                  <ol className="list-decimal list-inside space-y-1 text-[10px]">
                    <li>Google Analytics paneline gir</li>
                    <li>Sol tarafta "Yönetici" seçeneğine tıkla</li>
                    <li>"Veri Akışları" bölümünü aç</li>
                    <li>"Ölçüm Kimliği"ni kopyala (G-... ile başlar)</li>
                  </ol>
                </div>
              </div>
            </div>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={gaId}
              onChange={(e) => setGaId(e.target.value.toUpperCase())}
              className={`w-full px-4 py-2.5 rounded-lg border-2 font-mono transition-all ${
                gaId && !validationStatus.ga
                  ? "border-red-300 bg-red-50"
                  : gaId && validationStatus.ga
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            />
            <div className="flex items-center gap-2 text-xs">
              {gaId && validationStatus.ga && (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Geçerli format</span>
                </>
              )}
              {gaId && !validationStatus.ga && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-700">G- ile başlamalı, 10-12 karakter</span>
                </>
              )}
            </div>
          </div>

          {/* Google Ads ID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-700">
                Google Ads Dönüşüm Kimliği (AW-ID)
              </label>
              <div className="group relative cursor-help" title="Yardım için tıklayın">
                <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                <div className="absolute right-0 top-6 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg p-3 w-48 z-10 shadow-lg">
                  <p className="font-semibold mb-1">Google Ads Kimliği nasıl bulunur?</p>
                  <ol className="list-decimal list-inside space-y-1 text-[10px]">
                    <li>Google Ads paneline gir</li>
                    <li>Sol üst köşede hesap kimliğini (AW-...) kopyala</li>
                    <li>VEYA "Araçlar" → "Dönüşüm İzleme"'ye git</li>
                    <li>Hesap kimliğini buradan da kopyalayabilirsin</li>
                  </ol>
                </div>
              </div>
            </div>
            <input
              type="text"
              placeholder="AW-XXXXXXXXXX"
              value={adsId}
              onChange={(e) => setAdsId(e.target.value.toUpperCase())}
              className={`w-full px-4 py-2.5 rounded-lg border-2 font-mono transition-all ${
                adsId && !validationStatus.ads
                  ? "border-red-300 bg-red-50"
                  : adsId && validationStatus.ads
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            />
            <div className="flex items-center gap-2 text-xs">
              {adsId && validationStatus.ads && (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Geçerli format</span>
                </>
              )}
              {adsId && !validationStatus.ads && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-700">AW- ile başlamalı, rakam içermeli</span>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !validationStatus.ga || !validationStatus.ads}
            className={`w-full py-3 px-4 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 ${
              isLoading || !validationStatus.ga || !validationStatus.ads
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-95"
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Bağlantı kuruluyor...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Bağlantıyı Tamamla ✨
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Step 3: Processing
  if (currentStep === 3) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all ${
                step <= currentStep ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-blue-900 mb-2">
              Google'a Kaydediliyor...
            </h2>
            <p className="text-sm text-blue-800">
              {successMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Google Search Console Guide
  if (currentStep === 4) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all ${
                step <= currentStep ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
          <h2 className="text-xl font-extrabold text-emerald-900 mb-2">
            ✅ Google Entegrasyon Tamamlandı! (Adım 4/4)
          </h2>
          <p className="text-sm text-emerald-800 leading-relaxed">
            Artık Google Analytics ve Google Ads bağlı. Son adım: Google Arama Sonuçlarında görünmek!
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              🗺️ Adım 1: Google Search Console'a Sitemap Gönder
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-slate-700">
                <strong>Sitemap nedir?</strong> Bu, Google'a tüm ürünlerinizin bir listesi. Google bu harita sayesinde dükkanınızı bulur ve Google Arama sonuçlarında gösterir.
              </p>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded space-y-2">
                <p className="font-semibold text-blue-900 text-sm">Yapılması Gerekenler:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>
                    <a 
                      href="https://search.google.com/search-console/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      Google Search Console'a Git <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Oturum aç (Google hesabını kullan)</li>
                  <li>Sol taraftaki menüden <strong>"Sitemap'lar"</strong> sekmesine tıkla</li>
                  <li>Sağ üstte <strong>"Yeni sitemap ekle"</strong> kutucuğuna tıkla</li>
                  <li>Şu URL'yi yapıştır: <code className="bg-white px-2 py-1 rounded text-xs font-mono border">sitemap.xml</code></li>
                  <li><strong>"Gönder"</strong> butonuna bas</li>
                </ol>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                <p className="text-xs text-amber-800 font-semibold">
                  💡 <strong>İpucu:</strong> Sitemap zaten sunucuda aktif. Linkini kopyalayıp Google'a bildirmek yeterli. Google bundan sonra tüm ürünlerinizi tarar.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              🔍 Adım 2: Arama Görünürlüğünü Kontrol Et
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-slate-700">
                Sitemap gönderdikten sonra, Google 24-48 saatte tüm ürünlerinizi indeksler. Şu adımlarla kontrol edebilirsin:
              </p>

              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                <li>Search Console'da <strong>"Kapsam"</strong> sekmesine git</li>
                <li>Sitemaptan kaç ürünün bulunduğunu gör</li>
                <li><strong>"Sitemap Raporu"</strong>'nda detaylı bilgi al</li>
                <li>Eğer 0 ürün görüyorsan, 24 saat daha bekle</li>
              </ol>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded">
                <p className="text-xs text-emerald-800 font-semibold">
                  ✅ <strong>Bitti!</strong> Tüm ürünleriniz artık Google Arama'da görünmeye başlayacak.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-4 rounded-xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          Sayfayı Yenile ve Başla ✨
        </button>
      </div>
    );
  }

  return null;
}
