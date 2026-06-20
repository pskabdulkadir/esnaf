import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, AlertCircle, Loader } from 'lucide-react';

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
        `✅ BAŞARILI! Google Analytics (${gaId}) ve Google Ads (${adsId}) başarıyla bağlandı. Sayfayı yenileyerek değişiklikleri aktif hale getirebilirsiniz.`
      );

      // Callback
      if (onSuccess) {
        onSuccess(gaId, adsId);
      }

      // Auto-refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setErrorMessage(
        `❌ Bağlantı Hatası: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <h2 className="text-xl font-extrabold text-blue-900 mb-2">
          🚀 Google Entegrasyon Sihirbazı
        </h2>
        <p className="text-sm text-blue-800 leading-relaxed">
          İşletmenizi saniyeler içinde Google Analytics ve Google Ads'e bağlayın. 
          Müşteri tıklamalarını otomatik olarak izleyin ve reklam performansını ölçün.
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
            <div
              className="group relative cursor-help"
              title="Yardım için tıklayın"
            >
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
              <><Check className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Geçerli format</span></>
            )}
            {gaId && !validationStatus.ga && (
              <><AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-700">G- ile başlamalı, 10-12 karakter</span></>
            )}
          </div>
        </div>

        {/* Google Ads ID */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-700">
              Google Ads Dönüşüm Kimliği (AW-ID)
            </label>
            <div
              className="group relative cursor-help"
              title="Yardım için tıklayın"
            >
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
              <><Check className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Geçerli format</span></>
            )}
            {adsId && !validationStatus.ads && (
              <><AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-700">AW- ile başlamalı, rakam içermeli</span></>
            )}
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
            {successMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isLoading || !validationStatus.ga || !validationStatus.ads
          }
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

      {/* Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          💡 Neler Olacak?
        </p>
        <ul className="text-xs text-slate-600 space-y-1.5">
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>Müşteri tıklamalarını otomatik izleme başlayacak</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>Google Analytics'de ziyaretçi verilerini görüntüleyebileceksin</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>Google Ads'de reklam performansı ölçülebilecek</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>Tamamen güvenli ve geri alınabilir</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
