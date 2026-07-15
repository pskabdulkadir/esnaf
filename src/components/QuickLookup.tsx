import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import CameraBarcodeScanner from './CameraBarcodeScanner';
import { TRANSLATIONS } from '../lib/translations';
import { 
  Search, 
  Settings, 
  Barcode, 
  Eye, 
  Tag, 
  Layers, 
  DollarSign, 
  Sparkles, 
  Activity, 
  Info,
  ChevronRight,
  TrendingUp,
  Camera
} from 'lucide-react';

interface QuickLookupProps {
  products: Product[];
  brandName?: string;
  language?: 'tr' | 'en' | 'de';
}

export default function QuickLookup({ products, brandName = 'AKN Global Group', language = 'tr' }: QuickLookupProps) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;
  // User settings state simulator matching USERSETTINGS("ScanInput")
  const [scanInput, setScanInput] = useState<string>(() => {
    // default to first product for clean initial display
    return products.length > 0 ? products[0].barcode : '';
  });

  // Settings ScanInput form state
  const [settingsScanInput, setSettingsScanInput] = useState<string>(scanInput);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Apply settings trigger
  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    setScanInput(settingsScanInput.trim());
  };

  // Slice simulation logic:
  // [Barcode] = LOOKUP(USERSETTINGS("ScanInput"), "Products", "Barcode", "Barcode")
  const lookupProduct = useMemo(() => {
    if (!scanInput) return null;
    return products.find(p => p.barcode === scanInput) || null;
  }, [scanInput, products]);

  // Virtual column calculation: ProfitMargin = ([SalePrice] - [PurchasePrice])
  const profitMargin = useMemo(() => {
    if (!lookupProduct) return 0;
    return lookupProduct.salePrice - lookupProduct.purchasePrice;
  }, [lookupProduct]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* View Header with corporate branding */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 text-indigo-600 mb-1">
          <Eye className="h-5 w-5" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">UX VIEW: QUICK LOOKUP</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
          {t.lookupHeaderTitle}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t.lookupHeaderSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* User Settings configuration block */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Settings className="h-4.5 w-4.5 text-slate-600" />
              <h3 className="font-bold text-slate-800 text-sm">USER SETTINGS ({language === 'tr' ? 'Kullanıcı Ayarları' : language === 'de' ? 'Benutzereinstellungen' : 'User Settings'})</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              {language === 'tr' ? 'Uygulama genelinde kullanılmak üzere barkod bilgisini USERSETTINGS("ScanInput") alanında saklayın.' : language === 'de' ? 'Speichern Sie Barcode-Daten in USERSETTINGS("ScanInput"), um sie in der gesamten Anwendung zu verwenden.' : 'Store barcode data in USERSETTINGS("ScanInput") for application-wide context.'}
            </p>

            <form onSubmit={handleApplySettings} className="space-y-4">
              <div>
                <label className="block text-slate-450 font-bold uppercase text-[10px] tracking-wider font-mono mb-1.5">
                  ScanInput ({language === 'tr' ? 'Sorgulanan Barkod' : language === 'de' ? 'Gesuchter Barcode' : 'Queried Barcode'})
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={t.barcodeSearchPlaceholder || "Örn: 840134789012"}
                    className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500 bg-slate-50/55"
                    value={settingsScanInput}
                    onChange={(e) => setSettingsScanInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-100"
                >
                  <Camera className="h-4 w-4" /> {t.scanCameraLabel || 'KAMERA İLE TARA'}
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-amber-500 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-amber-500/10 font-mono font-bold"
                >
                  {language === 'tr' ? 'SORGULA' : language === 'de' ? 'ABFRAGEN' : 'QUERY'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick-test Barkod Selector */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 block">
              {language === 'tr' ? 'Mevcut Ürün Barkodları (Hızlı Test)' : language === 'de' ? 'Verfügbare Barcodes (Schnelltest)' : 'Available Barcodes (Quick Test)'}
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSettingsScanInput(p.barcode);
                    setScanInput(p.barcode);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all duration-100 flex items-center justify-between text-xs cursor-pointer ${
                    scanInput === p.barcode 
                      ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/5' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`font-bold truncate ${scanInput === p.barcode ? 'text-indigo-700' : 'text-slate-700'}`}>{p.name}</p>
                    <p className="font-mono text-[9px] text-slate-400 mt-0.5">{language === 'tr' ? 'Barkod' : 'Barcode'}: {p.barcode}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${scanInput === p.barcode ? 'text-indigo-500' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Slice View: ProductLookup Display */}
        <div className="lg:col-span-7">
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[340px] flex flex-col">
            
            {/* Table/Slice view Header mockup */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="p-1 px-2 bg-indigo-500 text-xs text-white rounded font-bold">SLICE</span>
                <span className="text-xs font-bold tracking-wider text-slate-200">ProductLookup</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {language === 'tr' ? 'Süzgeç' : 'Filter'}: [Barcode] = {scanInput ? `"${scanInput}"` : 'BOŞ'}
              </span>
            </div>

            {/* Displaying Detail View of slice */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              
              {lookupProduct ? (
                <div className="space-y-6">
                  
                  {/* Item Basic Banner */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-600">
                          {lookupProduct.id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">• {lookupProduct.category}</span>
                      </div>
                      <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                        {lookupProduct.name}
                      </h2>
                    </div>
                    <div className="flex-shrink-0 bg-emerald-50 text-emerald-700 p-3 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center font-mono font-bold text-center">
                      <span className="text-[9px] text-emerald-600 font-sans uppercase">{language === 'tr' ? 'MEVCUT STOK' : language === 'de' ? 'CURRENT BESTAND' : 'CURRENT STOCK'}</span>
                      <span className="text-xl mt-0.5">{lookupProduct.currentStock}</span>
                    </div>
                  </div>

                  {/* AppSheet Spec: Detail View Includes Name, SalePrice, CurrentStock, ProfitMargin */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    
                    {/* Detail 1: Sale Price */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                        {language === 'tr' ? 'SATIŞ FİYATI' : language === 'de' ? 'VERKAUFSPREIS' : 'SALE PRICE'}
                      </span>
                      <p className="text-lg font-bold font-mono text-indigo-600 mt-1">
                        ₺{lookupProduct.salePrice.toFixed(2)}
                      </p>
                    </div>

                    {/* Detail 2: Current Stock Indicator */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                        {language === 'tr' ? 'GÜNCEL STOK DURUMU' : language === 'de' ? 'BESTANDSSTATUS' : 'STOCK STATUS'}
                      </span>
                      <p className={`text-base font-bold mt-1.5 ${
                        lookupProduct.currentStock < lookupProduct.lowStockThreshold 
                          ? 'text-red-500' 
                          : 'text-slate-800'
                      }`}>
                        {lookupProduct.currentStock < lookupProduct.lowStockThreshold 
                          ? (language === 'tr' ? '⚠️ Kritik Limit' : '⚠️ Critical Level') 
                          : (language === 'tr' ? '🟢 Yeterli Stok' : '🟢 Adequate Stock')}
                      </p>
                    </div>

                    {/* Detail 3: Profit Margin (Virtual Column) */}
                    <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-150 text-center relative overflow-hidden">
                      <span className="text-[9px] font-mono font-extrabold tracking-widest text-indigo-500 uppercase block">
                        {language === 'tr' ? 'KÂR MARJI (Sanal)' : language === 'de' ? 'MARGE (Virtuell)' : 'PROFIT MARGIN (Virtual)'}
                      </span>
                      <p className="text-lg font-bold font-mono text-indigo-700 mt-1">
                        ₺{profitMargin.toFixed(2)}
                      </p>
                      <span className="absolute bottom-1 right-1 text-[8px] font-mono text-indigo-400/70">
                        [SalePrice] - [PurchasePrice]
                      </span>
                    </div>

                  </div>

                  {/* Formula and details block */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-2">
                    <div className="flex items-center gap-1 text-slate-700 font-bold">
                      <Info className="h-3.5 w-3.5 text-indigo-500" />
                      <span>AppSheet Slices Log:</span>
                    </div>
                    <code className="block bg-slate-100 p-2 rounded text-slate-600 font-mono text-[10px] break-all leading-relaxed">
                      ROW_FILTER: [Barcode] = LOOKUP(USERSETTINGS("ScanInput"), "Products", "Barcode", "Barcode")
                    </code>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <Barcode className="h-12 w-12 text-slate-300 stroke-[1.5] mb-2 animate-pulse" />
                  <p className="text-slate-700 text-xs font-bold">{t.lookupNotFound || 'Ürün Bulunamadı'}</p>
                  <p className="text-slate-400 text-[11px] max-w-sm mt-1">
                    {language === 'tr' 
                      ? `USERSETTINGS("ScanInput") değeri olan "${scanInput}" barkodu envanterde yer almıyor.` 
                      : `The barcode "${scanInput}" stored in USERSETTINGS("ScanInput") does not exist in inventory.`}
                  </p>
                </div>
              )}

              {/* Status and logs */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-[10px] uppercase text-slate-500 bg-slate-100 py-1 px-2.5 rounded-lg border border-slate-250">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                  UX VIEW TYP: DETAIL
                </span>
                <span className="font-mono text-slate-400">Status: OK</span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {isCameraOpen && (
        <CameraBarcodeScanner 
          onScan={(barcode) => {
            setSettingsScanInput(barcode);
            setScanInput(barcode);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
          brandName={brandName}
          placeholderText="Cihaz kamerasını barkoda veya QR koda tutun."
        />
      )}

    </div>
  );
}
