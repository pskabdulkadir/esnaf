import React, { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { getOrCreateMachineId } from '../lib/machine-id';
import { ensureLicensePersistency, restoreFromBackup, validateLicenseFormat, isLicenseExpired } from '../lib/license-manager';
import { saveLicenseToIndexedDB, initLicenseDB } from '../lib/license-db';

interface LicenseGateProps {
  onLicenseValid: () => void;
  language: 'tr' | 'en' | 'de';
}

export default function LicenseGate({ onLicenseValid, language }: LicenseGateProps) {
  const machineId = getOrCreateMachineId();
  const [licenseKey, setLicenseKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sayfa yüklendiğinde tüm seviyelerde lisansı kontrol et
  React.useEffect(() => {
    try {
      console.log('🔍 LicenseGate: Lisans kontrol ediliyor...');

      // SEVIYE 1: localStorage kontrol
      try {
        const storedLicense = localStorage.getItem('isLicenseValid');
        if (storedLicense === 'true') {
          const licenseDataStr = localStorage.getItem('license_data');
          if (licenseDataStr) {
            const licenseData = JSON.parse(licenseDataStr);
            if (validateLicenseFormat(licenseData) && !isLicenseExpired(licenseData.exp)) {
              console.log('✅ LicenseGate: localStorage\'dan lisans bulundu');
              onLicenseValid();
              return;
            }
          }
        }
      } catch (e1) {
        console.warn('localStorage kontrol hatası:', e1);
      }

      // SEVIYE 2: sessionStorage kontrol
      try {
        const sessionLicense = sessionStorage.getItem('license_data_session');
        if (sessionLicense) {
          const licenseData = JSON.parse(sessionLicense);
          if (validateLicenseFormat(licenseData) && !isLicenseExpired(licenseData.exp)) {
            console.log('✅ LicenseGate: sessionStorage\'dan lisans bulundu');
            // localStorage'a da yaz
            localStorage.setItem('license_data', sessionLicense);
            localStorage.setItem('isLicenseValid', 'true');
            onLicenseValid();
            return;
          }
        }
      } catch (e2) {
        console.warn('sessionStorage kontrol hatası:', e2);
      }

      // SEVIYE 3: Memory kontrol
      try {
        const memoryData = (window as any).__AKN_LICENSE__;
        if (memoryData && memoryData.data) {
          if (validateLicenseFormat(memoryData.data) && !isLicenseExpired(memoryData.data.exp)) {
            console.log('✅ LicenseGate: Memory\'den lisans bulundu');
            const dataStr = JSON.stringify(memoryData.data);
            localStorage.setItem('license_data', dataStr);
            localStorage.setItem('isLicenseValid', 'true');
            sessionStorage.setItem('license_data_session', dataStr);
            onLicenseValid();
            return;
          }
        }
      } catch (e3) {
        console.warn('Memory kontrol hatası:', e3);
      }

      // SEVIYE 4: Backup'tan geri yükle
      try {
        const backupData = restoreFromBackup();
        if (backupData && validateLicenseFormat(backupData) && !isLicenseExpired(backupData.exp)) {
          console.log('✅ LicenseGate: Backup\'tan lisans geri yüklendi');
          localStorage.setItem('isLicenseValid', 'true');
          sessionStorage.setItem('license_data_session', JSON.stringify(backupData));
          onLicenseValid();
          return;
        }
      } catch (e4) {
        console.warn('Backup kontrol hatası:', e4);
      }

      console.warn('❌ LicenseGate: Hiçbir seviyede geçerli lisans bulunamadı');
    } catch (e) {
      console.warn('LicenseGate genel kontrol hatası:', e);
    }
  }, [onLicenseValid]);

  const translations = {
    tr: {
      title: 'LİSANS VERİFİKASYON',
      subtitle: 'Uygulama Erişimi için Lisans Anahtarınızı Girin',
      machineIdLabel: 'Cihaz Kimliği (MachineID)',
      machineIdDesc: 'Bu kodu kopyalayıp lisans anahtarı üreticisine yapıştırın',
      copyButton: 'Kopyala',
      copied: 'Kopyalandı!',
      licenseKeyLabel: 'Lisans Anahtarı',
      licenseKeyPlaceholder: 'Lisans anahtarını yapıştırın...',
      validateButton: 'Doğrula ve Başlat',
      validating: 'Doğrulanıyor...',
      step1: '1. MachineID\'yi Kopyalayın',
      step2: '2. Lisans Üreticisine Yapıştırın',
      step3: '3. Oluşturulan Anahtarı Yapıştırın',
      step4: '4. Doğrulayın ve Başlayın',
      instructions: 'Aşağıdaki adımları takip ederek lisans anahtarınızı oluşturun:',
      generatorUrl: 'Lisans Anahtarı Üretici: anahtar_uretici.html',
      keySubmittedSuccess: 'Lisans anahtarı alındı!',
      keySubmittedError: 'Lütfen bir lisans anahtarı girin.',
    },
    en: {
      title: 'LICENSE VERIFICATION',
      subtitle: 'Enter Your License Key to Access the Application',
      machineIdLabel: 'Machine ID',
      machineIdDesc: 'Copy this code and paste it to the license key generator',
      copyButton: 'Copy',
      copied: 'Copied!',
      licenseKeyLabel: 'License Key',
      licenseKeyPlaceholder: 'Paste your license key...',
      validateButton: 'Verify and Start',
      validating: 'Verifying...',
      step1: '1. Copy Machine ID',
      step2: '2. Paste to License Generator',
      step3: '3. Paste Generated Key',
      step4: '4. Verify and Start',
      instructions: 'Follow the steps below to generate your license key:',
      generatorUrl: 'License Key Generator: anahtar_uretici.html',
      keySubmittedSuccess: 'License key received!',
      keySubmittedError: 'Please enter a license key.',
    },
    de: {
      title: 'LIZENZVERIFIZIERUNG',
      subtitle: 'Geben Sie Ihren Lizenzschlüssel ein, um auf die Anwendung zuzugreifen',
      machineIdLabel: 'Maschinen-ID',
      machineIdDesc: 'Kopieren Sie diesen Code und fügen Sie ihn in den Lizenzschlüssel-Generator ein',
      copyButton: 'Kopieren',
      copied: 'Kopiert!',
      licenseKeyLabel: 'Lizenzschlüssel',
      licenseKeyPlaceholder: 'Lizenzschlüssel einfügen...',
      validateButton: 'Überprüfen und Starten',
      validating: 'Wird überprüft...',
      step1: '1. Maschinen-ID kopieren',
      step2: '2. In Lizensgenerator einfügen',
      step3: '3. Generierten Schlüssel einfügen',
      step4: '4. Überprüfen und Starten',
      instructions: 'Führen Sie die folgenden Schritte aus, um Ihren Lizenzschlüssel zu generieren:',
      generatorUrl: 'Lizenzschlüssel-Generator: anahtar_uretici.html',
      keySubmittedSuccess: 'Lizenzschlüssel erhalten!',
      keySubmittedError: 'Bitte geben Sie einen Lizenzschlüssel ein.',
    },
  };

  const t = translations[language] || translations.tr;

  const handleCopyMachineId = () => {
    navigator.clipboard.writeText(machineId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleValidateLicense = () => {
    if (!licenseKey.trim()) {
      setValidationMessage({ text: t.keySubmittedError, type: 'error' });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        // Base64 çöz
        const decodedKey = atob(licenseKey.trim());
        const licenseData = JSON.parse(decodedKey);

        // Gerekli alanları kontrol et
        if (!licenseData.id || !licenseData.exp || !licenseData.type) {
          setValidationMessage({
            text: language === 'tr'
              ? 'Geçersiz lisans anahtarı formatı!'
              : language === 'de'
              ? 'Ungültiges Lizenzschlüsselformat!'
              : 'Invalid license key format!',
            type: 'error'
          });
          setIsLoading(false);
          return;
        }

        // MachineID eşleştirme
        if (licenseData.id !== machineId) {
          setValidationMessage({
            text: language === 'tr'
              ? '❌ Bu lisans bu cihaza ait değil!'
              : language === 'de'
              ? '❌ Diese Lizenz gehört nicht zu diesem Gerät!'
              : '❌ This license does not belong to this device!',
            type: 'error'
          });
          setIsLoading(false);
          return;
        }

        // Tarih kontrolü
        const expiryDate = new Date(licenseData.exp);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);

        if (expiryDate < today) {
          setValidationMessage({
            text: language === 'tr'
              ? '⏰ Lisans süreniz dolmuştur!'
              : language === 'de'
              ? '⏰ Ihre Lizenz ist abgelaufen!'
              : '⏰ Your license has expired!',
            type: 'error'
          });
          setIsLoading(false);
          return;
        }

        // Tüm kontroller başarılı
        // ⭐ KRITIK: Lisansı tüm seviyelerde hemen kaydet
        const licenseJSON = JSON.stringify(licenseData);
        const timestamp = new Date().getTime();

        // SEVIYE 1: localStorage (SENKRON - AYNI ANDA)
        try {
          localStorage.setItem('license_key_submitted', licenseKey);
          localStorage.setItem('license_data', licenseJSON);
          localStorage.setItem('isLicenseValid', 'true');
          localStorage.setItem('license_backup_' + timestamp, licenseJSON);
          console.log('✅ localStorage\'a kaydedildi');
        } catch (e) {
          console.error('localStorage kaydetme hatası:', e);
        }

        // SEVIYE 2: sessionStorage (SENKRON)
        try {
          sessionStorage.setItem('license_data_session', licenseJSON);
          sessionStorage.setItem('license_valid_session', 'true');
          console.log('✅ sessionStorage\'a kaydedildi');
        } catch (e) {
          console.error('sessionStorage kaydetme hatası:', e);
        }

        // SEVIYE 3: Memory (SENKRON)
        try {
          (window as any).__AKN_LICENSE__ = {
            data: licenseData,
            timestamp: timestamp,
            valid: true
          };
          console.log('✅ Memory\'e kaydedildi');
        } catch (e) {
          console.error('Memory kaydetme hatası:', e);
        }

        // ⭐ SEVIYE 4: IndexedDB (ASYNC - AYRIDA ÇALIŞACAK)
        // Bu seviye en güvenli, tarayıcı tamamen temizlenmiş olsa da orada kalır
        // Ama ana işlemi bloke etmesin diye async bırakıyoruz
        (async () => {
          try {
            await initLicenseDB();
            const success = await saveLicenseToIndexedDB(machineId, licenseData, machineId);
            if (success) {
              console.log('🔒 Lisans IndexedDB\'ye kaydedildi (Cihaz tanımlaması)');
            }
          } catch (e) {
            console.error('IndexedDB kaydetme hatası:', e);
            // Hata olsa da devam et, localStorage vardır
          }
        })();

        console.log('✅ Lisans tüm seviyelerde kaydedildi:', licenseData);

        setValidationMessage({ text: t.keySubmittedSuccess, type: 'success' });

        // 1 saniye sonra uygulamaya git
        setTimeout(() => {
          onLicenseValid();
        }, 1000);
      } catch (e: any) {
        console.error('Lisans çözümleme hatası:', e);
        const errorMsg = e instanceof SyntaxError
          ? language === 'tr'
            ? 'Lisans anahtarı bozuk veya hatalı format!'
            : language === 'de'
            ? 'Lizenzschlüssel ist beschädigt oder hat falsches Format!'
            : 'License key is corrupted or has wrong format!'
          : language === 'tr'
          ? 'Geçersiz lisans anahtarı!'
          : language === 'de'
          ? 'Ungültiger Lizenzschlüssel!'
          : 'Invalid license key!';

        setValidationMessage({ text: errorMsg, type: 'error' });
      }

      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidateLicense();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-2xl">
        
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-2xl font-bold">🔐</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            {t.title}
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-2xl p-8 md:p-10 space-y-8 animate-scale-up">
          
          {/* Instructions */}
          <div className="bg-slate-950/50 border border-slate-800/30 rounded-2xl p-6 space-y-3">
            <p className="text-slate-300 font-semibold text-sm flex items-center gap-2">
              <span className="text-indigo-400">ℹ️</span>
              {t.instructions}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex gap-3 text-xs text-slate-300">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">1</span>
                <span className="pt-0.5">{t.step1}</span>
              </div>
              <div className="flex gap-3 text-xs text-slate-300">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">2</span>
                <span className="pt-0.5">{t.step2}</span>
              </div>
              <div className="flex gap-3 text-xs text-slate-300">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">3</span>
                <span className="pt-0.5">{t.step3}</span>
              </div>
              <div className="flex gap-3 text-xs text-slate-300">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">4</span>
                <span className="pt-0.5">{t.step4}</span>
              </div>
            </div>
          </div>

          {/* Machine ID Section */}
          <div className="space-y-3">
            <label className="block text-slate-200 font-bold text-sm uppercase tracking-wide">
              {t.machineIdLabel}
            </label>
            <p className="text-slate-400 text-xs">{t.machineIdDesc}</p>
            <div className="flex gap-3 items-center">
              <div className="flex-1 bg-slate-950 border border-slate-700/50 rounded-xl p-4 font-mono text-sm text-amber-400 break-all select-all">
                {machineId}
              </div>
              <button
                onClick={handleCopyMachineId}
                className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-all font-bold text-white font-semibold ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                }`}
                title={t.copyButton}
              >
                {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* License Key Input Section */}
          <div className="space-y-3">
            <label className="block text-slate-200 font-bold text-sm uppercase tracking-wide">
              {t.licenseKeyLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.licenseKeyPlaceholder}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-700/50 focus:border-indigo-500/80 rounded-xl p-4 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Validation Message */}
          {validationMessage && (
            <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 animate-fade-in ${
              validationMessage.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-600/30 text-emerald-300'
                : 'bg-red-950/40 border border-red-600/30 text-red-300'
            }`}>
              {validationMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <span className="h-5 w-5 flex-shrink-0 text-center">⚠️</span>
              )}
              {validationMessage.text}
            </div>
          )}

          {/* Validation Info Panel */}
          <div className="bg-slate-950/30 border border-slate-800/40 rounded-xl p-4 space-y-2 text-xs text-slate-400">
            <p className="font-bold text-slate-300 flex items-center gap-2">
              <span>🔍</span>
              {language === 'tr'
                ? 'Doğrulama Kontrolleri'
                : language === 'de'
                ? 'Validierungsprüfungen'
                : 'Validation Checks'}
            </p>
            <ul className="space-y-1.5 font-mono text-[11px] text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">1.</span>
                {language === 'tr'
                  ? 'Base64 Decode → JSON Parse'
                  : language === 'de'
                  ? 'Base64 Dekodierung → JSON Analyse'
                  : 'Base64 Decode → JSON Parse'}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">2.</span>
                {language === 'tr'
                  ? 'MachineID eşleştirmesi'
                  : language === 'de'
                  ? 'Maschinen-ID-Abgleich'
                  : 'Machine ID matching'}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">3.</span>
                {language === 'tr'
                  ? 'Lisans süresi kontrolü'
                  : language === 'de'
                  ? 'Lizenzablaufdatum überprüfen'
                  : 'License expiry date check'}
              </li>
            </ul>
          </div>

          {/* Validate Button */}
          <button
            onClick={handleValidateLicense}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white text-sm uppercase tracking-wide transition-all shadow-lg ${
              isLoading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-500/40 active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
                {t.validating}
              </span>
            ) : (
              t.validateButton
            )}
          </button>

          {/* Info Text */}
          <p className="text-center text-xs text-slate-500 font-mono">
            {t.generatorUrl}
          </p>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
            {language === 'tr'
              ? '🔒 Lisans sistemi tamamen yerel olarak çalışır. Cihaz kimliğiniz veya lisans anahtarınız hiçbir zaman sunucuya gönderilmez.'
              : language === 'de'
              ? '🔒 Das Lizenzsystem funktioniert vollständig lokal. Ihre Maschinen-ID oder Ihr Lizenzschlüssel werden niemals an einen Server gesendet.'
              : '🔒 The license system runs completely locally. Your Machine ID or license key is never sent to any server.'}
          </p>
        </div>
      </div>
    </div>
  );
}
