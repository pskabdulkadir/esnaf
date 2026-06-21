import React, { useMemo, useState } from 'react';
import { Product, Sale, Expense, Currency } from '../types';
import { TRANSLATIONS } from '../lib/translations';
import LicensePanel from './LicensePanel';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Percent,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  Truck,
  FileText,
  MessageCircle,
  Download,
  Server
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  onNavigate: (view: string) => void;
  brandName?: string;
  language?: 'tr' | 'en' | 'de';
  onDownloadBackup?: () => void;
}

// Helper function to get currency symbol
const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case 'TL': return '₺';
    case 'USD': return '$';
    case 'EUR': return '€';
    default: return '₺';
  }
};

export default function Dashboard({ products, sales, expenses, onNavigate, brandName = 'AKN Global Group Ltd', language = 'tr', onDownloadBackup }: DashboardProps) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;
  const [, setLicenseUpdated] = useState(0);

  const handleLicenseUpdated = () => {
    setLicenseUpdated(prev => prev + 1);
  };

  // Calculations
  const totalSalesAmount = useMemo(() => {
    return sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  }, [sales]);

  const totalExpensesAmount = useMemo(() => {
    return expenses.reduce((acc, exp) => acc + exp.amount, 0);
  }, [expenses]);

  const netProfit = useMemo(() => {
    return totalSalesAmount - totalExpensesAmount;
  }, [totalSalesAmount, totalExpensesAmount]);

  // Inventory stats
  const criticalStockItems = useMemo(() => {
    return products.filter(p => p.currentStock < p.lowStockThreshold);
  }, [products]);

  // Expenses categories break down
  const expenseBreakdown = useMemo(() => {
    const categories: Record<string, number> = { Vergi: 0, Lojistik: 0, Operasyonel: 0 };
    expenses.forEach(exp => {
      if (categories[exp.category] !== undefined) {
        categories[exp.category] += exp.amount;
      } else {
        categories[exp.category] = exp.amount;
      }
    });
    return categories;
  }, [expenses]);

  // Sales by product breakdown for charts / mini leaderboards
  const topSellingProducts = useMemo(() => {
    const counts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    sales.forEach(s => {
      const prod = products.find(p => p.id === s.productId);
      const name = prod ? prod.name : `Kayıtsız Ürün (${s.productId})`;
      if (!counts[s.productId]) {
        counts[s.productId] = { name, quantity: 0, revenue: 0 };
      }
      counts[s.productId].quantity += s.quantity;
      counts[s.productId].revenue += s.totalAmount;
    });
    return Object.values(counts).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  }, [sales, products]);

  // Daily Sales trends calculations
  const dailySalesTrends = useMemo(() => {
    const dates: Record<string, number> = {};
    sales.forEach(s => {
      const dateStr = s.date;
      dates[dateStr] = (dates[dateStr] || 0) + s.totalAmount;
    });
    return Object.entries(dates)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sales]);

  // Profit Margins (Theoretical based on sales vs. purchase price of those specific sold items)
  const costOfGoodsSold = useMemo(() => {
    return sales.reduce((acc, sale) => {
      const prod = products.find(p => p.id === sale.productId);
      const cost = prod ? prod.purchasePrice : 0;
      return acc + (cost * sale.quantity);
    }, 0);
  }, [sales, products]);

  const profitMarginPercent = useMemo(() => {
    if (totalSalesAmount === 0) return 0;
    const grossProfit = totalSalesAmount - costOfGoodsSold;
    return Math.round((grossProfit / totalSalesAmount) * 100);
  }, [totalSalesAmount, costOfGoodsSold]);

  // Custom premium SVG charts
  const maxSaleValue = useMemo(() => {
    if (dailySalesTrends.length === 0) return 100;
    return Math.max(...dailySalesTrends.map(t => t.amount), 500);
  }, [dailySalesTrends]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* License Information Panel */}
      <LicensePanel language={language} onLicenseUpdated={handleLicenseUpdated} />

      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            {t.controlPanel}
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">{brandName}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.overviewSubtitle}</p>
        </div>
        <div className="flex flex-col gap-2 items-start md:items-end">
          <div className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            {t.systemTime || 'SİSTEM SAATİ'}: {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'de' ? 'de-DE' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <a
            href="https://wa.me/905425783748"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 shadow-sm hover:shadow-md"
          >
            <MessageCircle className="h-4 w-4" />
            {language === 'tr' ? 'WhatsApp İletişim' : language === 'de' ? 'WhatsApp Kontakt' : 'WhatsApp Contact'}
          </a>
        </div>
      </div>

      {/* Daily Backup & Safe Local Storage Alert Banner */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200/80 p-5 text-amber-900 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 flex-shrink-0">
              <Server className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5 font-sans uppercase tracking-wider">
                ⚠️ Güvenlik Uyarısı & Günlük Yedekleme Hatırlatıcı
              </p>
              <p className="text-xs text-amber-800 leading-relaxed font-medium mt-1">
                Bu sistem tarayıcınızın kendi güvenli belleğinde çalışıyor. Tarayıcınızı sıfırlamadan veya çerezleri temizlemeden önce mutlaka <span className="font-bold underline">"Günlük Yedek Al"</span> butonuna tıklayarak verilerinizi indirin.
              </p>
            </div>
          </div>
          {onDownloadBackup && (
            <button
              onClick={onDownloadBackup}
              className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black tracking-wide px-5 py-3 rounded-xl transition-all shadow-md shadow-amber-600/20 active:scale-[0.98] cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" />
              GÜNLÜK YEDEK AL
            </button>
          )}
        </div>
      </div>

      {/* Main KPI metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Card 1: Total Sales */}
        <div id="kpi-total-sales" className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{t.kpiSalesVolume}</p>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
                ₺{totalSalesAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-emerald-600 bg-emerald-50/50 p-2 rounded-lg">
            <span className="font-semibold flex items-center gap-1">
              {language === 'tr' ? 'Aktif Siparişler' : language === 'de' ? 'Aktive Bestellungen' : 'Active Orders'}: {sales.length}
            </span>
            <span className="text-slate-400 font-mono">{language === 'tr' ? 'Brüt Gelir' : language === 'de' ? 'Bruttoeinnahmen' : 'Gross Revenue'}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* KPI Card 2: Total Expenses */}
        <div id="kpi-total-expenses" className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{t.kpiTotalExpenses}</p>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
                ₺{totalExpensesAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-650">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-red-600 bg-red-50/50 p-2 rounded-lg">
            <span className="font-semibold flex items-center gap-1">
              {language === 'tr' ? 'Kayıtlı Faturalar' : language === 'de' ? 'Registrierte Rechnungen' : 'Registered Invoices'}: {expenses.length}
            </span>
            <span className="text-slate-400 font-mono">{language === 'tr' ? 'Gider Toplamı' : language === 'de' ? 'Ausgabensumme' : 'Total Expenses'}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500" />
        </div>

        {/* KPI Card 3: Net Profit */}
        <div id="kpi-net-profit" className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${netProfit >= 0 ? "bg-slate-900 border-slate-800 text-white" : "bg-red-955 border-red-900 text-white"}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${netProfit >= 0 ? "text-slate-400" : "text-red-300"}`}>{t.kpiNetProfit}</p>
              <h3 className="text-3xl font-bold tracking-tight mt-2">
                ₺{netProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${netProfit >= 0 ? "bg-amber-500 text-slate-900" : "bg-red-500 text-white"}`}>
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs p-2 rounded-lg bg-white/10">
            <span className="font-semibold">
              {t.kpiProfitMargin}: {profitMarginPercent}%
            </span>
            <span className="opacity-75 font-mono">{language === 'tr' ? 'Formül: Satışlar - Giderler' : language === 'de' ? 'Formel: Verkäufe - Ausgaben' : 'Formula: Sales - Expenses'}</span>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${netProfit >= 0 ? "bg-amber-500" : "bg-red-500"}`} />
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend SVG Area Chart */}
        <div id="sales-trend-chart" className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{t.salesChartTitle || 'Operasyonel Gelir Akışları'}</h3>
                <p className="text-xs text-slate-500">{language === 'tr' ? 'Satış hacmi ve günlük işlem zaman çizelgesi' : language === 'de' ? 'Umsatzvolumen und tägliche Transaktions-Timeline' : 'Sales volume and daily transaction timeline'}</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> {language === 'tr' ? 'Günlük Tutar' : language === 'de' ? 'Täglicher Betrag' : 'Daily Amount'}
                </span>
              </div>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="mt-6 h-60 w-full relative">
              {dailySalesTrends.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                  <p>{language === 'tr' ? 'Henüz geçmiş satış kaydı bulunamadı.' : language === 'de' ? 'Noch keine Verkaufsdaten gefunden.' : 'No sales records found yet.'}</p>
                  <button 
                    onClick={() => onNavigate('sales')}
                    className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    {language === 'tr' ? 'İlk satışı kaydet →' : language === 'de' ? 'Ersten Verkauf buchen →' : 'Record first sale →'}
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col justify-between">
                  {/* SVG Chart Drawing */}
                  <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Simple Grid Lines */}
                    <line x1="0" y1="0" x2="500" y2="0" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="33" x2="500" y2="33" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="66" x2="500" y2="66" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#e2e8f0" strokeWidth="1.5" />

                    {/* Area Polygon */}
                    <polygon
                      fill="url(#chartGrad)"
                      points={`
                        0,100
                        ${dailySalesTrends.map((t, idx) => {
                          const xRatio = dailySalesTrends.length > 1 ? idx / (dailySalesTrends.length - 1) : 0;
                          const x = xRatio * 500;
                          const y = 100 - (t.amount / maxSaleValue) * 85;
                          return `${x},${y}`;
                        }).join(' ')}
                        500,100
                      `}
                    />

                    {/* Line path */}
                    <path
                      d={dailySalesTrends.map((t, idx) => {
                        const xRatio = dailySalesTrends.length > 1 ? idx / (dailySalesTrends.length - 1) : 0;
                        const x = xRatio * 500;
                        const y = 100 - (t.amount / maxSaleValue) * 85;
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Nodes and Dots */}
                    {dailySalesTrends.map((t, idx) => {
                      const xRatio = dailySalesTrends.length > 1 ? idx / (dailySalesTrends.length - 1) : 0;
                      const x = xRatio * 500;
                      const y = 100 - (t.amount / maxSaleValue) * 85;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                          <circle cx={x} cy={y} r="1.5" fill="#10b981" />
                        </g>
                      );
                    })}
                  </svg>

                  {/* X Axis Labels */}
                  <div className="flex justify-between px-2 text-[10px] font-mono text-slate-400 mt-2 select-none">
                    {dailySalesTrends.map((t, idx) => (
                      <span key={idx} className="text-center font-medium">
                        {t.date.substring(5)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {language === 'tr' ? 'Otomatik envanter döküm entegrasyonu AKTİF' : language === 'de' ? 'Automatische Bestandsaktualisierung AKTIV' : 'Automatic stock reduction integration ACTIVE'}
            </span>
            <span className="font-mono text-xs text-indigo-600 hover:underline cursor-pointer" onClick={() => onNavigate('sales')}>
              {language === 'tr' ? 'Doğrudan Kasa Satış Girişi →' : language === 'de' ? 'Direkte Kassenbuchung →' : 'Direct POS Entry →'}
            </span>
          </div>
        </div>

        {/* Expenses Category Breakdown */}
        <div id="expenses-category-breakdown" className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{t.expensesChartTitle || 'Gider Dağılımı'}</h3>
            <p className="text-xs text-slate-500">{language === 'tr' ? 'Kategorilere göre sıralanmış operasyonel harcamalar' : language === 'de' ? 'Betriebsausgaben sortiert nach Kategorien' : 'Operational expenses classified by categories'}</p>

            <div className="mt-6 space-y-5">
              {/* Category: Tax */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />
                    {t.expenseCategoryTax || 'Vergi, Ruhsat ve Harçlar'}
                  </span>
                  <span className="font-mono text-slate-600 font-medium">
                    ₺{expenseBreakdown.Vergi.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${totalExpensesAmount > 0 ? (expenseBreakdown.Vergi / totalExpensesAmount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Category: Logistics */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                    {t.expenseCategoryLogistics || 'Sevkiyat ve Lojistik Giderleri'}
                  </span>
                  <span className="font-mono text-slate-600 font-medium">
                    ₺{expenseBreakdown.Lojistik.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${totalExpensesAmount > 0 ? (expenseBreakdown.Lojistik / totalExpensesAmount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Category: Operational */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                    {t.expenseCategoryOps || 'Operasyonel Giderler'}
                  </span>
                  <span className="font-mono text-slate-600 font-medium">
                    ₺{expenseBreakdown.Operasyonel.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${totalExpensesAmount > 0 ? (expenseBreakdown.Operasyonel / totalExpensesAmount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>{language === 'tr' ? 'Toplam Vergi:' : language === 'de' ? 'Gesamtsteuer:' : 'Total Tax:'}</span>
              <span>₺{expenseBreakdown.Vergi}</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>{language === 'tr' ? 'Toplam Lojistik:' : language === 'de' ? 'Gesamtlogistik:' : 'Total Logistics:'}</span>
              <span>₺{expenseBreakdown.Lojistik}</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>{language === 'tr' ? 'Toplam Operasyonel:' : language === 'de' ? 'Gesamtbetrieb:' : 'Total Operational:'}</span>
              <span>₺{expenseBreakdown.Operasyonel}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <a
                href="https://wa.me/905425783748"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150"
              >
                <MessageCircle className="h-4 w-4" />
                {language === 'tr' ? "WhatsApp'tan İletişime Geç" : language === 'de' ? 'Auf WhatsApp kontaktieren' : 'Contact on WhatsApp'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Health & Quick Slices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Critical Stock Summary Panel */}
        <div id="critical-stock-preview" className="lg:col-span-1 bg-white rounded-2xl border border-red-100 p-6 flex flex-col justify-between bg-gradient-to-br from-red-50/20 to-white">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {t.criticalNoticeTitle}
              </h3>
              <span className="text-xs bg-red-100 text-red-600 py-0.5 px-2 rounded-full font-bold">
                {criticalStockItems.length} {language === 'tr' ? 'Kritik Ürün' : language === 'de' ? 'Kritische Artikel' : 'Critical Items'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{t.criticalNoticeSubtitle}</p>

            <div className="mt-4 space-y-3">
              {criticalStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 border border-red-100">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{language === 'tr' ? 'Barkod' : 'Barcode'}: {item.barcode}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-red-650 block font-mono">{language === 'tr' ? 'Stok' : language === 'de' ? 'Bestand' : 'Stock'}: {item.currentStock}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Limit: {item.lowStockThreshold}</span>
                  </div>
                </div>
              ))}
              {criticalStockItems.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  <span className="inline-block p-2 bg-emerald-50 rounded-full text-emerald-500 mb-2">✓</span>
                  <p>{language === 'tr' ? 'Tüm ürün stokları güvenli aralıktadır.' : language === 'de' ? 'Alle Bestände sind im grünen Bereich.' : 'All stock levels are secure.'}</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('inventory')}
            className={`w-full mt-4 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 ${criticalStockItems.length > 0 ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
          >
            {t.resolveNowBtn}
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Top Products Volume Leaderboard */}
        <div id="product-leaderboard" className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800">{t.topProductsTitle}</h3>
          <p className="text-xs text-slate-500 mt-1">{t.topProductsSubtitle}</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {topSellingProducts.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-xs text-slate-400">
                {language === 'tr' ? 'En çok satanlar listesi için henüz satış işlemi bulunmuyor.' : language === 'de' ? 'Keine Verkaufsdaten für die Bestsellerliste vorhanden.' : 'No sales records found for bestseller list yet.'}
              </div>
            ) : (
              topSellingProducts.map((p, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span>{language === 'tr' ? 'Kasa Satışı' : language === 'de' ? 'Kassenverkauf' : 'POS Sales'}: {p.quantity} {language === 'tr' ? 'adet' : language === 'de' ? 'Stück' : 'units'}</span>
                      <span className="font-mono font-bold text-emerald-600">₺{p.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
