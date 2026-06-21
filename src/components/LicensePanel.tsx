import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { getOrCreateMachineId } from '../lib/machine-id';
import {
  loadLicenseData,
  saveLicenseData,
  decodeLicenseKey,
  calculateDaysRemaining,
  combineLicensePeriods,
  validateMachineId,
  validateLicenseFormat,
  formatDate,
  ensureLicensePersistency,
  restoreFromBackup,
  LicenseData,
} from '../lib/license-manager';

interface LicensePanelProps {
  language: 'tr' | 'en' | 'de';
  onLicenseUpdated?: () => void;
}

export default function LicensePanel({ language, onLicenseUpdated }: LicensePanelProps) {
  const machineId = getOrCreateMachineId();
  const [isExpanded, setIsExpanded] = useState(false);
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [newLicenseKey, setNewLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copied, setCopied] = useState(false);

  // Lisans verilerini yükle
  useEffect(() => {
    loadLicenseDataFromStorage();
  }, []);

  // Her saniye kalan süreyi güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      if (licenseData?.exp) {
        calculateTimeRemaining();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [licenseData]);

  const loadLicenseDataFromStorage = () => {
    let data = loadLicenseData();

    // Eğer ana veri yoksa, backup'tan yükle
    if (!data) {
      console.warn('Ana lisans verisi bulunamadı, backup\'tan yüklenmeye çalışılıyor...');
      data = restoreFromBackup();
      if (data) {
        console.log('✅ Lisans backup\'tan geri yüklendi');
      }
    }

    if (data) {
      setLicenseData(data);
      calculateTimeRemaining(data);
    }
  };

  const calculateTimeRemaining = (data?: LicenseData) => {
    const currentData = data || licenseData;
    if (!currentData?.exp) return;

    const expiry = new Date(currentData.exp);
    const days = calculateDaysRemaining(currentData.exp);

    setExpiryDate(expiry);
    setDaysRemaining(days);
  };

  const handleCopyMachineId = () => {
    navigator.clipboard.writeText(machineId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRenewLicense = async () => {
    if (!newLicenseKey.trim()) {
      setMessage({
        text:
          language === 'tr'
            ? 'Lütfen bir lisans anahtarı girin.'
            : language === 'de'
            ? 'Bitte geben Sie einen Lizenzschlüssel ein.'
            : 'Please enter a license key.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Base64 çöz
      const newLicense = decodeLicenseKey(newLicenseKey);

      // Validasyonlar
      if (!validateLicenseFormat(newLicense)) {
        throw new Error('invalid_format');
      }

      if (!validateMachineId(newLicense.id, machineId)) {
        throw new Error('machine_id_mismatch');
      }

      // Mevcut lisansla birleştir
      if (licenseData?.exp) {
        newLicense.exp = combineLicensePeriods(licenseData.exp, newLicense.exp);
      }

      // localStorage'a kaydet ve kalıcılığını sağla
      saveLicenseData(newLicense);
      localStorage.setItem('license_key_submitted', newLicenseKey);

      // ⭐ ÖZEL: Lisans kalıcılığını sağla (tarayıcı sıfırlanırsa da saklanır)
      ensureLicensePersistency(newLicense);

      setLicenseData(newLicense);
      calculateTimeRemaining(newLicense);
      setNewLicenseKey('');
      setShowRenewForm(false);

      setMessage({
        text:
          language === 'tr'
            ? '✅ Lisans süresi başarıyla uzatıldı!'
            : language === 'de'
            ? '✅ Lizenzdauer erfolgreich verlängert!'
            : '✅ License renewed successfully!',
        type: 'success',
      });

      if (onLicenseUpdated) {
        onLicenseUpdated();
      }

      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      let errorMsg = '';
      if (e.message === 'invalid_format') {
        errorMsg =
          language === 'tr'
            ? 'Geçersiz lisans anahtarı formatı!'
            : language === 'de'
            ? 'Ungültiges Lizenzschlüsselformat!'
            : 'Invalid license key format!';
      } else if (e.message === 'machine_id_mismatch') {
        errorMsg =
          language === 'tr'
            ? '❌ Bu lisans bu cihaza ait değil!'
            : language === 'de'
            ? '❌ Diese Lizenz gehört nicht zu diesem Gerät!'
            : '❌ This license does not belong to this device!';
      } else if (e instanceof SyntaxError) {
        errorMsg =
          language === 'tr'
            ? 'Lisans anahtarı bozuk veya hatalı format!'
            : language === 'de'
            ? 'Lizenzschlüssel ist beschädigt oder hat falsches Format!'
            : 'License key is corrupted!';
      } else {
        errorMsg =
          language === 'tr'
            ? 'Lisans doğrulaması başarısız!'
            : language === 'de'
            ? 'Lizenzvalidierung fehlgeschlagen!'
            : 'License validation failed!';
      }

      setMessage({ text: errorMsg, type: 'error' });
      setTimeout(() => setMessage(null), 4000);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenewLicense();
    }
  };

  // Koşullu renk sınıfları
  const getStatusColor = () => {
    if (daysRemaining <= 0) return 'text-red-400';
    if (daysRemaining <= 7) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const getStatusBg = () => {
    if (daysRemaining <= 0) return 'bg-red-950/30';
    if (daysRemaining <= 7) return 'bg-yellow-950/30';
    return 'bg-emerald-950/30';
  };

  const getStatusBorder = () => {
    if (daysRemaining <= 0) return 'border-red-600/30';
    if (daysRemaining <= 7) return 'border-yellow-600/30';
    return 'border-emerald-600/30';
  };

  const translations = {
    tr: {
      licenseInfo: 'Lisans Bilgisi',
      machineId: 'Cihaz Kimliği',
      expiryDate: 'Lisans Bitiş Tarihi',
      daysRemaining: 'Kalan Süre',
      days: 'gün',
      expired: 'SÜRESİ DOLDU',
      renewButton: 'Süreyi Uzat',
      renewTitle: 'Lisans Süresini Uzat',
      enterLicenseKey: 'Lisans Anahtarı Girin',
      renewSubmit: 'Doğrula ve Uzat',
      cancel: 'İptal',
      copy: 'Kopyala',
      copied: 'Kopyalandı!',
      noLicense: 'Lisans bilgisi bulunamadı',
    },
    en: {
      licenseInfo: 'License Information',
      machineId: 'Machine ID',
      expiryDate: 'License Expiry Date',
      daysRemaining: 'Days Remaining',
      days: 'days',
      expired: 'EXPIRED',
      renewButton: 'Renew License',
      renewTitle: 'Renew License Period',
      enterLicenseKey: 'Enter License Key',
      renewSubmit: 'Verify and Renew',
      cancel: 'Cancel',
      copy: 'Copy',
      copied: 'Copied!',
      noLicense: 'No license information found',
    },
    de: {
      licenseInfo: 'Lizenzinformation',
      machineId: 'Maschinen-ID',
      expiryDate: 'Lizenz-Ablaufdatum',
      daysRemaining: 'Verbleibende Tage',
      days: 'Tage',
      expired: 'ABGELAUFEN',
      renewButton: 'Lizenz verlängern',
      renewTitle: 'Lizenzdauer verlängern',
      enterLicenseKey: 'Geben Sie den Lizenzschlüssel ein',
      renewSubmit: 'Verifizieren und verlängern',
      cancel: 'Abbrechen',
      copy: 'Kopieren',
      copied: 'Kopiert!',
      noLicense: 'Lizenzinformation nicht gefunden',
    },
  };

  const t = translations[language] || translations.tr;

  if (!licenseData) {
    return (
      <div className={`${getStatusBg()} border ${getStatusBorder()} rounded-lg p-4 text-sm text-slate-300`}>
        {t.noLicense}
      </div>
    );
  }

  return (
    <div className={`${getStatusBg()} border ${getStatusBorder()} rounded-lg transition-all`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
          <span className="font-semibold text-slate-200">{t.licenseInfo}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Machine ID */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">{t.machineId}</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-950/50 rounded px-3 py-2 text-xs text-amber-400 font-mono break-all">
                {machineId}
              </code>
              <button
                onClick={handleCopyMachineId}
                className={`flex-shrink-0 h-8 w-8 rounded flex items-center justify-center transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title={t.copy}
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">{t.expiryDate}</label>
            <div className="bg-slate-950/50 rounded px-3 py-2 text-sm font-mono">
              {expiryDate?.toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'de' ? 'de-DE' : 'en-US')}
            </div>
          </div>

          {/* Days Remaining */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">{t.daysRemaining}</label>
            <div className={`${getStatusColor()} bg-slate-950/50 rounded px-3 py-2 text-sm font-bold font-mono`}>
              {daysRemaining > 0 ? `${daysRemaining} ${t.days}` : t.expired}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-600/30 text-emerald-300'
                  : 'bg-red-950/40 border border-red-600/30 text-red-300'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              )}
              {message.text}
            </div>
          )}

          {/* Renew Form */}
          {!showRenewForm ? (
            <button
              onClick={() => setShowRenewForm(true)}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t.renewButton}
            </button>
          ) : (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">{t.enterLicenseKey}</label>
                <input
                  type="text"
                  value={newLicenseKey}
                  onChange={(e) => setNewLicenseKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Lisans anahtarını yapıştırın..."
                  disabled={isLoading}
                  className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-indigo-500/80 rounded px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none transition-all disabled:opacity-60"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRenewLicense}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-all ${
                    isLoading
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="h-3 w-3 rounded-full border-2 border-emerald-300 border-t-emerald-600 animate-spin" />
                      {t.renewSubmit}
                    </span>
                  ) : (
                    t.renewSubmit
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowRenewForm(false);
                    setNewLicenseKey('');
                    setMessage(null);
                  }}
                  disabled={isLoading}
                  className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded transition-all disabled:opacity-60"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
