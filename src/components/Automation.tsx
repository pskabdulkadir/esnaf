import React, { useState, useMemo, useEffect } from 'react';
import { Product, Sale, Expense } from '../types';
import { jsPDF } from 'jspdf';
import {
  Cpu,
  Mail,
  FileText,
  Calendar,
  Clock,
  Send,
  CheckCircle,
  Download,
  Lock,
  Building2,
  FileCheck,
  ChevronRight,
  AlertCircle,
  Play,
  RotateCcw,
  Printer,
  Activity,
  Settings,
  MessageCircle
} from 'lucide-react';

interface AutomationProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  userEmail?: string;
  brandName?: string;
}

interface CartSale {
  id: string;
  date: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  totalAmount: number;
}

export default function Automation({ products, sales, expenses, userEmail = "abdulkadirkqn@gmail.com", brandName = "AKN Global Group Ltd" }: AutomationProps) {
  // Active Automation Tab state
  const [activeBot, setActiveBot] = useState<'GenerateReceipt' | 'WeeklyReport'>('GenerateReceipt');

  // Trigger states
  const [receiptViewMode, setReceiptViewMode] = useState<'single' | 'cart'>('single');
  const [selectedSaleReceipt, setSelectedSaleReceipt] = useState<Sale | null>(() => {
    return sales.length > 0 ? sales[sales.length - 1] : null;
  });
  const [selectedCartSale, setSelectedCartSale] = useState<CartSale | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isCartReceiptModalOpen, setIsCartReceiptModalOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  // Document Settings State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [docSettings, setDocSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('automation_doc_settings');
      return saved ? JSON.parse(saved) : {
        // Şirket Bilgileri
        companyName: brandName,
        companyAddress: 'İstanbul, Türkiye',
        companyPhone: '+90 542 578 3748',
        companyEmail: userEmail,
        invoiceEmail: 'fatura@aknglobal.com',
        taxId: 'Vergi No: 1234567890',
        websiteUrl: 'www.aknglobal.com',
        // Müşteri Bilgileri
        customerName: 'Müşteri Adı Soyadı',
        customerCompany: 'Müşteri Şirketi',
        customerAddress: 'Müşteri Adresi',
        customerPhone: 'Müşteri Telefonu',
        customerEmail: 'musteri@example.com',
        customerTaxId: 'Müşteri Vergi No',
        customerWhatsApp: '+90 5XX XXX XXXX'
      };
    } catch {
      return {
        companyName: brandName,
        companyAddress: 'İstanbul, Türkiye',
        companyPhone: '+90 542 578 3748',
        companyEmail: userEmail,
        invoiceEmail: 'fatura@aknglobal.com',
        taxId: 'Vergi No: 1234567890',
        websiteUrl: 'www.aknglobal.com',
        customerName: 'Müşteri Adı Soyadı',
        customerCompany: 'Müşteri Şirketi',
        customerAddress: 'Müşteri Adresi',
        customerPhone: 'Müşteri Telefonu',
        customerEmail: 'musteri@example.com',
        customerTaxId: 'Müşteri Vergi No',
        customerWhatsApp: '+90 5XX XXX XXXX'
      };
    }
  });

  const [tempSettings, setTempSettings] = useState(docSettings);


  // Helper code to calculate WEEKNUM of date
  const getWeekNumber = (dateStr: string): number => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 0;
      const target = new Date(d.valueOf());
      const dayNr = (d.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
      }
      return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    } catch {
      return 0;
    }
  };

  const currentWeekNumber = useMemo(() => {
    return getWeekNumber(new Date().toISOString().split('T')[0]);
  }, []);

  // Compute Weekly totals based on formulas
  // SUM(SELECT(Sales[TotalAmount], WEEKNUM([Date]) = WEEKNUM(TODAY())))
  const weeklySales = useMemo(() => {
    const todayWeek = currentWeekNumber;
    return sales.filter(s => getWeekNumber(s.date) === todayWeek);
  }, [sales, currentWeekNumber]);

  const weeklySalesTotal = useMemo(() => {
    return weeklySales.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [weeklySales]);

  // SUM(SELECT(Expenses[Amount], WEEKNUM([Date]) = WEEKNUM(TODAY())))
  const weeklyExpenses = useMemo(() => {
    const todayWeek = currentWeekNumber;
    return expenses.filter(e => getWeekNumber(e.date) === todayWeek);
  }, [expenses, currentWeekNumber]);

  const weeklyExpensesTotal = useMemo(() => {
    return weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [weeklyExpenses]);

  // Net Profit: Total Revenue - Total Expense
  const netWeeklyProfit = useMemo(() => {
    return weeklySalesTotal - weeklyExpensesTotal;
  }, [weeklySalesTotal, weeklyExpensesTotal]);

  const handleSaveDocSettings = () => {
    try {
      localStorage.setItem('automation_doc_settings', JSON.stringify(tempSettings));
      setDocSettings(tempSettings);
      setIsSettingsModalOpen(false);
      alert('Belge ayarları başarıyla kaydedildi!');
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error);
      alert('Ayarlar kaydedilirken hata oluştu.');
    }
  };

  const handleResetDocSettings = () => {
    setTempSettings(docSettings);
  };

  const handleSimulateEmail = (to: string, subject: string, body: string) => {
    alert(`📧 Test E-Postası Gönderiliyor:\n\nAlıcı: ${to}\nKonu: ${subject}\n\n${body}`);
  };

  // Group consecutive sales with same date into cart sales
  const cartSalesFromSales = useMemo(() => {
    const cartMap = new Map<string, CartSale>();

    sales.forEach(sale => {
      const key = sale.date;
      if (!cartMap.has(key)) {
        cartMap.set(key, {
          id: `CART-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: sale.date,
          items: [],
          totalAmount: 0
        });
      }

      const cartSale = cartMap.get(key)!;
      const existingItem = cartSale.items.find(item => item.productId === sale.productId);

      if (existingItem) {
        existingItem.quantity += sale.quantity;
      } else {
        cartSale.items.push({
          productId: sale.productId,
          quantity: sale.quantity
        });
      }

      cartSale.totalAmount += sale.totalAmount;
    });

    return Array.from(cartMap.values()).reverse();
  }, [sales]);


  const generatePDFDocument = (isCart: boolean = false) => {
    try {
      // docSettings'teki boş değerleri kontrol et ve default değerler ata
      const safeDocSettings = {
        companyName: docSettings.companyName || 'AKN Global Group Ltd',
        companyAddress: docSettings.companyAddress || 'İstanbul, Türkiye',
        companyPhone: docSettings.companyPhone || '+90 542 578 3748',
        companyEmail: docSettings.companyEmail || 'info@aknglobal.com',
        invoiceEmail: docSettings.invoiceEmail || 'fatura@aknglobal.com',
        websiteUrl: docSettings.websiteUrl || 'www.aknglobal.com',
        taxId: docSettings.taxId || 'Vergi No: 1234567890',
        customerName: docSettings.customerName || 'Müşteri Adı',
        customerCompany: docSettings.customerCompany || 'Müşteri Şirketi',
        customerAddress: docSettings.customerAddress || 'Müşteri Adresi',
        customerTaxId: docSettings.customerTaxId || 'Müşteri Vergi No'
      };

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;

      // Header decoration
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, pageWidth, 8, 'F');

      // Company Logo & Info
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(safeDocSettings.companyName, 15, yPosition + 5);

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Gümrük, Lojistik ve Tedarik Zinciri`, 15, yPosition + 10);
      doc.text(`${safeDocSettings.companyAddress}`, 15, yPosition + 14);
      doc.text(`Tel: ${safeDocSettings.companyPhone} | ${safeDocSettings.companyEmail}`, 15, yPosition + 18);

      yPosition += 28;

      // Document Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      if (isCart && selectedCartSale) {
        doc.text(`ÇOKLU ÜRÜN FATURASI - ${selectedCartSale.id}`, 15, yPosition);
      } else if (selectedSaleReceipt) {
        doc.text(`FATURA - ${selectedSaleReceipt.id}`, 15, yPosition);
      }

      yPosition += 8;

      // Invoice details
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 116, 139);
      if (isCart && selectedCartSale) {
        doc.text(`Tarih: ${selectedCartSale.date}`, 15, yPosition);
      } else if (selectedSaleReceipt) {
        doc.text(`Tarih: ${selectedSaleReceipt.date}`, 15, yPosition);
      }

      yPosition += 10;

      // Company & Customer details
      doc.setDrawColor(200, 213, 224);
      doc.rect(15, yPosition - 2, pageWidth - 30, 35);

      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('SAĞLAYICI:', 18, yPosition + 2);
      doc.text('ALICI:', (pageWidth / 2) + 5, yPosition + 2);

      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      yPosition += 6;
      doc.text(safeDocSettings.companyName, 18, yPosition);
      doc.text(safeDocSettings.customerName, (pageWidth / 2) + 5, yPosition);

      yPosition += 4;
      doc.text(safeDocSettings.companyAddress, 18, yPosition);
      doc.text(safeDocSettings.customerCompany, (pageWidth / 2) + 5, yPosition);

      yPosition += 4;
      doc.text(safeDocSettings.taxId, 18, yPosition);
      doc.text(safeDocSettings.customerTaxId, (pageWidth / 2) + 5, yPosition);

      yPosition += 10;

      // Items table
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('ÜRÜN', 15, yPosition);
      doc.text('ADETİ', 90, yPosition, { align: 'center' });
      doc.text('BİRİM FİYATI', 120, yPosition, { align: 'center' });
      doc.text('TOPLAM', 150, yPosition, { align: 'right' });

      yPosition += 3;
      doc.setDrawColor(200, 213, 224);
      doc.line(15, yPosition, pageWidth - 15, yPosition);

      yPosition += 5;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(15, 23, 42);

      if (isCart && selectedCartSale) {
        selectedCartSale.items.forEach((item) => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            // Sayfa biterse yeni sayfa ekle
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 15;
            }

            const itemTotal = item.quantity * product.salePrice;
            doc.text(product.name, 15, yPosition);
            doc.text(item.quantity.toString(), 90, yPosition, { align: 'center' });
            doc.text(`₺${product.salePrice.toFixed(2)}`, 120, yPosition, { align: 'center' });
            doc.text(`₺${itemTotal.toFixed(2)}`, 150, yPosition, { align: 'right' });
            yPosition += 6;
          }
        });
      } else if (selectedSaleReceipt) {
        const product = products.find(p => p.id === selectedSaleReceipt.productId);
        if (product) {
          doc.text(product.name, 15, yPosition);
          doc.text(selectedSaleReceipt.quantity.toString(), 90, yPosition, { align: 'center' });
          const unitPrice = selectedSaleReceipt.totalAmount / selectedSaleReceipt.quantity;
          doc.text(`₺${unitPrice.toFixed(2)}`, 120, yPosition, { align: 'center' });
          doc.text(`₺${selectedSaleReceipt.totalAmount.toFixed(2)}`, 150, yPosition, { align: 'right' });
        }
      }

      yPosition += 10;
      doc.setDrawColor(200, 213, 224);
      doc.line(15, yPosition, pageWidth - 15, yPosition);

      yPosition += 8;

      // Total
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const totalAmount = isCart && selectedCartSale ? selectedCartSale.totalAmount : selectedSaleReceipt?.totalAmount || 0;
      doc.text(`TOPLAM TUTAR: ₺${totalAmount.toFixed(2)}`, 150, yPosition, { align: 'right' });

      yPosition += 12;

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Fatura İçin: ${safeDocSettings.invoiceEmail}`, 15, yPosition);
      doc.text(`Web: ${safeDocSettings.websiteUrl}`, 15, yPosition + 4);
      doc.text(`Bu belge ${safeDocSettings.companyName} otomasyon sistemi tarafından dijital olarak düzenlenmiştir.`, 15, pageHeight - 10);

      return doc;
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      return null;
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = generatePDFDocument(receiptViewMode === 'cart');
      if (!doc) {
        alert('PDF oluşturulamadı');
        return;
      }

      const fileName = receiptViewMode === 'cart' && selectedCartSale
        ? `${selectedCartSale.id}.pdf`
        : `${selectedSaleReceipt?.id}.pdf`;

      doc.save(fileName);
      alert(`✅ ${fileName} dosyası indirildi!\n\nWhatsApp'tan açarak müşterinize gönderebilirsiniz.`);
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      alert('PDF indirilirken hata oluştu.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* View Header with AI/Automation Branding */}
      <div className="space-y-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Cpu className="h-5 w-5 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase">AUTOMATION BOT CENTER</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{brandName} Otomasyon Sistemi</h1>
            <p className="text-xs text-slate-500 mt-1">
              Satış ve kasa girdileri üzerinde çalışan dijital fatura tetikleyicileri ve haftalık zamanlanmış arka plan botları.
            </p>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => {
              setTempSettings(docSettings);
              setIsSettingsModalOpen(true);
            }}
            className="bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            title="Fiş belge ayarlarını düzenle"
          >
            ⚙️ Belge Ayarları
          </button>
        </div>

        {/* Tab Swappers */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveBot('GenerateReceipt')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeBot === 'GenerateReceipt'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>GenerateReceipt Fiş Botu</span>
          </button>

          <button
            onClick={() => setActiveBot('WeeklyReport')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeBot === 'WeeklyReport'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>WeeklyReport Rapor Botu</span>
          </button>
        </div>
      </div>

      {activeBot === 'GenerateReceipt' ? (
        /* BOT 1: GENERATE RECEIPT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bot metadata workflow card */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping" />
              <h3 className="font-bold text-slate-800 text-sm font-mono">BOT: [GenerateReceipt]</h3>
            </div>

            <div className="text-xs text-slate-600 space-y-3.5">
              
              {/* Trigger details */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="font-mono text-[9px] font-bold text-indigo-500 block uppercase">EVENT (Tetikleyici Olay)</span>
                <p className="font-semibold text-slate-800">Tarih Değişimi & Sadece Ekleme</p>
                <p className="text-[10px] text-slate-400 font-mono">Data Change - Adds only on "Sales"</p>
              </div>

              {/* Action Process */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="font-mono text-[9px] font-bold text-indigo-500 block uppercase">PROCESS (İşlem Akışı)</span>
                <p className="font-semibold text-slate-800">HTML {`->`} PDF Dosyası Oluştur</p>
                <p className="text-[10px] text-slate-400 font-mono">Create a new file / Receipt Template</p>
              </div>

              {/* Task Details */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="font-mono text-[9px] font-bold text-indigo-500 block uppercase">TASK (E-Posta Görevi)</span>
                <p className="font-semibold text-slate-800">E-Posta ile Gönder</p>
                <p className="text-[10px] text-slate-400">
                  <span className="font-bold">Kime:</span> Mağaza Yöneticisi ({userEmail}) veya Müşteri
                </p>
                <p className="text-[10px] text-slate-400">
                  <span className="font-bold">Ek:</span> GenerateReceipt.pdf
                </p>
              </div>

            </div>

            {/* Email send status log indicator */}
            {emailStatus && (
              <div className="p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs flex items-start gap-2 animate-slide-up font-medium">
                <Activity className="h-4 w-4 animate-spin text-indigo-500 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{emailStatus}</span>
              </div>
            )}
          </div>

          {/* Log of Triggered receipts & PDF viewing */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">Tetiklenen Satış Fişleri ve Otomasyon Kaydı</h3>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                  OTOMATİK AKTİF
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mt-3 mb-4">
                Kasa Giriş Paneli'nden kaydettiğiniz her yeni satış işlemi, bu botun anında tetiklenmesini sağlayarak aşağıdaki listede bir dijital PDF irsaliye kaydı üretir.
              </p>

              {/* Tab switcher for single vs cart sales */}
              <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => {
                    setReceiptViewMode('single');
                    if (sales.length > 0) {
                      setSelectedSaleReceipt(sales[sales.length - 1]);
                    }
                  }}
                  className={`text-xs px-2.5 py-1 rounded font-bold transition-all ${
                    receiptViewMode === 'single'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tekli Satış
                </button>
                <button
                  onClick={() => {
                    setReceiptViewMode('cart');
                    if (cartSalesFromSales.length > 0) {
                      setSelectedCartSale(cartSalesFromSales[0]);
                    }
                  }}
                  className={`text-xs px-2.5 py-1 rounded font-bold transition-all ${
                    receiptViewMode === 'cart'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Çoklu Satış (Sepet)
                </button>
              </div>

              {/* Recent sales events list - Cart View */}
              {receiptViewMode === 'cart' && (
                <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                  {cartSalesFromSales.map((cartSale) => (
                    <div
                      key={cartSale.id}
                      onClick={() => setSelectedCartSale(cartSale)}
                      className={`p-3.5 rounded-xl border transition-all duration-100 flex items-center justify-between text-xs cursor-pointer ${
                        selectedCartSale?.id === cartSale.id
                          ? 'bg-slate-900 text-white border-slate-800'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-[10px] ${selectedCartSale?.id === cartSale.id ? 'text-amber-400' : 'text-slate-800'}`}>
                            {cartSale.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{cartSale.date}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            selectedCartSale?.id === cartSale.id
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {cartSale.items.length} ürün
                          </span>
                        </div>
                        <p className={`font-bold line-clamp-1 text-[10px] ${selectedCartSale?.id === cartSale.id ? 'text-slate-200' : 'text-slate-700'}`}>
                          {cartSale.items.map((item) => {
                            const product = products.find(p => p.id === item.productId);
                            return product ? product.name : item.productId;
                          }).join(' + ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="font-mono text-right font-bold text-emerald-600 block text-xs">
                          ₺{cartSale.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </p>
                        <span className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                          selectedCartSale?.id === cartSale.id
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-white border-slate-250 text-slate-600'
                        }`}>
                          PDF ÖNİZLE
                        </span>
                      </div>
                    </div>
                  ))}

                  {cartSalesFromSales.length === 0 && (
                    <div className="text-center py-10 text-slate-450 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <FileText className="h-8 w-8 text-slate-350 mx-auto stroke-[1.5] mb-2" />
                      <p className="text-xs">Duyuru: Henüz çoklu satış kaydı bulunmamaktadır.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recent sales events list - Single Sale View */}
              {receiptViewMode === 'single' && (
                <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                  {sales.map((sale) => {
                    const prod = products.find(p => p.id === sale.productId);
                    return (
                      <div
                        key={sale.id}
                        onClick={() => {
                          setSelectedSaleReceipt(sale);
                          setSelectedCartSale(null);
                        }}
                        className={`p-3.5 rounded-xl border transition-all duration-100 flex items-center justify-between text-xs cursor-pointer ${
                          selectedSaleReceipt?.id === sale.id
                            ? 'bg-slate-900 text-white border-slate-800'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${selectedSaleReceipt?.id === sale.id ? 'text-amber-400' : 'text-slate-800'}`}>
                              {sale.id}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{sale.date}</span>
                          </div>
                          <p className={`font-bold line-clamp-1 ${selectedSaleReceipt?.id === sale.id ? 'text-slate-200' : 'text-slate-700'}`}>
                            {prod ? prod.name : `Ürün ID: ${sale.productId}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <p className="font-mono text-right font-bold text-emerald-600 block">
                            ₺{sale.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                            selectedSaleReceipt?.id === sale.id
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-white border-slate-250 text-slate-600'
                          }`}>
                            PDF ÖNİZLE
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {sales.length === 0 && (
                    <div className="text-center py-10 text-slate-450 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <FileText className="h-8 w-8 text-slate-350 mx-auto stroke-[1.5] mb-2" />
                      <p className="text-xs">Duyuru: Henüz tetikleyici oluşturabilecek kayıtlı satış işlemi bulunmamaktadır.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {receiptViewMode === 'single' && selectedSaleReceipt && (
              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                <div className="text-xs font-mono">
                  <span className="text-[10px] text-slate-400 block">Seçili Fiş No</span>
                  <span className="font-bold text-slate-900">{selectedSaleReceipt.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsReceiptModalOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-100"
                  >
                    <FileCheck className="h-4 w-4" />
                    Belgeyi Aç (PDF)
                  </button>
                </div>
              </div>
            )}

            {receiptViewMode === 'cart' && selectedCartSale && (
              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center bg-emerald-50 p-4 rounded-xl border-emerald-100">
                <div className="text-xs font-mono">
                  <span className="text-[10px] text-emerald-600 block">Seçili Çoklu Satış No</span>
                  <span className="font-bold text-emerald-900">{selectedCartSale.id}</span>
                  <span className="text-[10px] text-emerald-600 block mt-1">{selectedCartSale.items.length} Ürün</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsCartReceiptModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-100"
                  >
                    <FileCheck className="h-4 w-4" />
                    Çoklu Fiş PDF'sini Aç
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* BOT 2: WEEKLY REPORT SCHEDULED BOT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Schedule Configuration Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block animate-pulse" />
              <h3 className="font-bold text-slate-800 text-sm font-mono">BOT: [WeeklyReport]</h3>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              
              {/* Schedule time */}
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <span className="font-mono text-[9px] font-extrabold text-slate-400 block uppercase">SCHEDULE (Zaman Çizelgesi)</span>
                <p className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" />
                  Her Pazartesi Saat 09:00 AM
                </p>
                <span className="text-[10px] text-slate-400 font-mono">Weekly, every Monday at 09:00</span>
              </div>

              {/* Task Configuration */}
              <div className="space-y-1 text-xs leading-relaxed">
                <span className="font-mono text-[9px] font-bold text-slate-400 block uppercase">ALICI HEDEFİ</span>
                <p className="font-semibold text-slate-800 tracking-tight">{userEmail}</p>
                <span className="text-[10px] text-slate-400 block font-mono">To: [Admin Email]</span>
              </div>

              <div className="space-y-1 text-xs leading-relaxed">
                <span className="font-mono text-[9px] font-bold text-slate-400 block uppercase font-sans">E-POSTA KONUSU</span>
                <p className="font-semibold text-slate-800">{brandName} Weekly Summary</p>
              </div>

              {/* Formula calculations documentation */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-mono text-[9px] font-extrabold text-indigo-500 block uppercase">FORMÜLLER</span>
                <div className="space-y-1.5 text-[10px] font-mono text-slate-500">
                  <span className="block font-bold">Toplam Ciro (Revenue):</span>
                  <code className="text-[9px] break-all bg-slate-100 p-1.5 rounded block text-slate-600 leading-normal">
                    SUM(SELECT(Sales[TotalAmount], WEEKNUM([Date]) = WEEKNUM(TODAY())))
                  </code>
                  <span className="block font-bold pt-1">Toplam Gider:</span>
                  <code className="text-[9px] break-all bg-slate-100 p-1.5 rounded block text-slate-600 leading-normal">
                    SUM(SELECT(Expenses[Amount], WEEKNUM([Date]) = WEEKNUM(TODAY())))
                  </code>
                </div>
              </div>

            </div>
          </div>

          {/* Live computed Report summary & Email mockup preview */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">Haftalık Rapor E-Posta Önizleme Paneli</h3>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                  SÜREKLİ GÜNCEL (LIVE)
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mt-3 mb-4">
                Bu bot, her Pazartesi sabahı otomatik olarak çalışarak o haftaki verileri yukarıdaki formüllere göre tarar ve e-posta raporu gönderir. Aşağıda, sisteminizdeki güncel veriler üzerinden hesaplanan e-posta şablonu yer almaktadır.
              </p>

              {/* Email Client simulator with real values computed */}
              <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 font-mono text-xs space-y-4 border border-slate-800">
                <div className="pb-3 border-b border-slate-800 space-y-1.5 text-slate-400 text-[11px]">
                  <p><span className="text-slate-500">Kime:</span> {userEmail}</p>
                  <p><span className="text-slate-500">Konu:</span> {brandName} Weekly Summary</p>
                  <p><span className="text-slate-500">Tarih:</span> Pazartesi 09:00 AM (Gelecek Tetikleme)</p>
                  <p><span className="text-slate-500">Tarih Aralığı:</span> Olası Hafta No {currentWeekNumber}</p>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <p className="text-[13px] font-bold text-amber-500 uppercase">{brandName.toUpperCase()} - HAFTALIK ÖZET RAPORU</p>
                  
                  <div className="space-y-2 border-l-2 border-indigo-500 pl-3">
                    <p>
                      Mevcut çalışma haftasına ait veriler başarıyla analiz edilmiştir:
                    </p>
                    <div className="space-y-1 pt-1.5">
                      <div className="flex justify-between max-w-sm">
                        <span>Haftalık Toplam Gelir (Ciro):</span>
                        <span className="text-emerald-400 font-bold">${weeklySalesTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between max-w-sm">
                        <span>Haftalık Toplam Gider:</span>
                        <span className="text-red-400 font-bold">-${weeklyExpensesTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between max-w-sm border-t border-slate-800 pt-1 text-slate-200">
                        <span>Net Kâr / Zarar Tutarı:</span>
                        <span className={`font-bold ${netWeeklyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ₺{netWeeklyProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 pt-3">
                    * Bu rapor otomasyon sistemi tarayıcı botu tarafından otomatik olarak toplanmıştır. Haftada 1 tetiklenir.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-indigo-500" />
                <span>Simüle veri tabanı üzerinden anlık test e-postaları gönderebilirsiniz.</span>
              </div>
              <button
                onClick={() => {
                  const bodyText = `Haftalık Rapor Özeti:\nGelir: ₺${weeklySalesTotal.toFixed(2)}\nGider: ₺${weeklyExpensesTotal.toFixed(2)}\nNet Kâr: ₺${netWeeklyProfit.toFixed(2)}`;
                  handleSimulateEmail(userEmail, `${brandName} Weekly Summary`, bodyText);
                }}
                disabled={isSending}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-100"
              >
                <Play className="h-4 w-4" />
                Botu Şimdi Çalıştır (Simüle Et)
              </button>
            </div>
          </div>

        </div>
      )}

      {/* PDF Generation Modal for CART SALES (Multiple Products) */}
      {isCartReceiptModalOpen && selectedCartSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fade-in text-slate-800">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-scale-up">

            {/* Modal Header Controls */}
            <div className="p-4 bg-emerald-900 border-b border-emerald-800 flex items-center justify-between text-white">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4" />
                ÇOKLU ÜRÜN PDF FATURA GÖRÜNÜMÜ
              </span>
              <button
                onClick={() => setIsCartReceiptModalOpen(false)}
                className="py-1 px-3 bg-emerald-800 hover:bg-emerald-700 text-emerald-300 hover:text-white rounded-lg text-xs"
              >
                ✕ KAPAT
              </button>
            </div>

            {/* Document PDF Stage */}
            <div className="p-6 md:p-8 bg-slate-100 max-h-[500px] overflow-y-auto">

              <div className="bg-white rounded-2xl shadow-md border border-slate-250 p-6 md:p-8 space-y-6 relative overflow-hidden">

                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />

                {/* Receipt Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                        <Building2 className="h-4.5 w-4.5 text-white" />
                      </div>
                      <span className="font-bold text-xs tracking-wider text-slate-900 uppercase">{brandName}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Gümrük, Lojistik ve Tedarik Zinciri
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="p-1 px-2.5 bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold rounded-full border border-emerald-100 uppercase tracking-widest block w-fit ml-auto mb-1">
                      ÖDENDİ
                    </span>
                    <p className="text-xs font-mono font-bold text-slate-900">{selectedCartSale.id}</p>
                    <p className="text-[9px] text-slate-400 font-mono">İrsaliye Tarihi: {selectedCartSale.date}</p>
                  </div>
                </div>

                {/* Vendor & Client Details */}
                <div className="grid grid-cols-2 gap-4 text-[11px] leading-relaxed border-t border-b border-emerald-50/50 py-4 font-sans text-slate-600">
                  <div>
                    <p className="font-bold text-slate-900 uppercase text-[9px] text-slate-400 font-mono tracking-wider mb-1">SAĞLAYICI / SEVK EDEN</p>
                    <p className="font-bold text-slate-800">{docSettings.companyName}</p>
                    <p>{docSettings.companyAddress}</p>
                    <p className="text-[10px] font-mono">{docSettings.taxId}</p>
                    <p className="text-[10px] text-blue-600">Tel: {docSettings.companyPhone}</p>
                    <p className="text-[10px] text-blue-600">{docSettings.companyEmail}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 uppercase text-[9px] text-slate-400 font-mono tracking-wider mb-1">ALICI / SEVK MAHALİ</p>
                    <p className="font-bold text-slate-800">{docSettings.customerName}</p>
                    <p className="font-semibold text-slate-700">{docSettings.customerCompany}</p>
                    <p>{docSettings.customerAddress}</p>
                    <p className="text-[10px] font-mono">{docSettings.customerTaxId}</p>
                    <p className="text-[10px] text-blue-600">Tel: {docSettings.customerPhone}</p>
                    <p className="text-[10px] text-blue-600">{docSettings.customerEmail}</p>
                  </div>
                </div>

                {/* Items listing table - MULTIPLE PRODUCTS */}
                <div className="space-y-2">
                  <p className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">FATURA SATIR KALEMİ ({selectedCartSale.items.length} ÜRÜN)</p>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <th className="py-2 px-1">Sevk Edilen Ürün Kapsamı</th>
                        <th className="py-2 px-1 text-center font-mono">Adet</th>
                        <th className="py-2 px-1 text-right font-mono">Birim Tutarı</th>
                        <th className="py-2 px-1 text-right font-mono">Toplam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCartSale.items.map((item, idx) => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return null;
                        const itemTotal = item.quantity * product.salePrice;
                        return (
                          <tr key={idx} className="border-b border-slate-100">
                            <td className="py-3 px-1">
                              <p className="font-bold text-slate-800 leading-snug text-xs">
                                {product.name}
                              </p>
                              <p className="text-[9px] text-slate-400 font-mono">ID: {product.id}</p>
                            </td>
                            <td className="py-3 px-1 text-center font-mono font-semibold text-xs">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-1 text-right font-mono text-xs">
                              ${product.salePrice.toFixed(2)}
                            </td>
                            <td className="py-3 px-1 text-right font-mono font-bold text-slate-900 text-xs">
                              ₺{itemTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Aggregates checkout receipt footer */}
                <div className="flex flex-col items-end space-y-1.5 pt-4 text-xs font-mono text-slate-600">
                  <div className="flex justify-between w-48 text-xs">
                    <span>Toplam Ürün Sayısı:</span>
                    <span>{selectedCartSale.items.reduce((sum, item) => sum + item.quantity, 0)} Adet</span>
                  </div>
                  <div className="flex justify-between w-48">
                    <span>Ara Toplam:</span>
                    <span>₺{selectedCartSale.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-48 font-bold border-t border-slate-200 pt-1.5 text-slate-950 text-sm">
                    <span>Toplam Tahsilat:</span>
                    <span>₺{selectedCartSale.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Company Contact Info Footer */}
                <div className="text-[9px] text-slate-500 border-t border-slate-100 pt-3 font-mono space-y-0.5">
                  <p>📧 Fatura İçin: <span className="text-blue-600">{docSettings.invoiceEmail}</span></p>
                  <p>🌐 Web: <span className="text-blue-600">{docSettings.websiteUrl}</span></p>
                </div>

                {/* Footer notes */}
                <div className="text-[9px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2 text-center italic font-sans">
                  "Bu çoklu ürün satış belgeği {docSettings.companyName} otomasyon sistemi ['GenerateReceipt' Botu] tarafından dijital olarak düzenlenerek arşivlenmiştir."
                </div>

              </div>

            </div>

            {/* Action buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between gap-2 flex-wrap">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                PDF İndir
              </button>

              <button
                onClick={() => setIsCartReceiptModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer ml-auto"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PDF Generation Modal mockup of Receipt Dialog with corporate identity */}
      {isReceiptModalOpen && selectedSaleReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fade-in text-slate-800">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-scale-up">
            
            {/* Modal Header Controls */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4" />
                DİJİTAL PDF FATURA GÖRÜNÜMÜ
              </span>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs"
              >
                ✕ KAPAT
              </button>
            </div>

            {/* Document PDF Stage (Aesthetic styled invoice on A4 mockup white sheet) */}
            <div className="p-6 md:p-8 bg-slate-100 max-h-[500px] overflow-y-auto">
              
              <div className="bg-white rounded-2xl shadow-md border border-slate-250 p-6 md:p-8 space-y-6 relative overflow-hidden">
                
                {/* Decorative PDF Sheet shadow background lines */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />

                {/* Receipt Header branded with AKN GLOBAL */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <Building2 className="h-4.5 w-4.5 text-white" />
                      </div>
                      <span className="font-bold text-xs tracking-wider text-slate-900 uppercase">{brandName}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Gümrük, Lojistik ve Tedarik Zinciri
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="p-1 px-2.5 bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold rounded-full border border-emerald-100 uppercase tracking-widest block w-fit ml-auto mb-1">
                      ÖDENDİ
                    </span>
                    <p className="text-xs font-mono font-bold text-slate-900">{selectedSaleReceipt.id}</p>
                    <p className="text-[9px] text-slate-400 font-mono">İrsaliye Tarihi: {selectedSaleReceipt.date}</p>
                  </div>
                </div>

                {/* Vendor & Client Details - Using docSettings */}
                <div className="grid grid-cols-2 gap-4 text-[11px] leading-relaxed border-t border-b border-indigo-50/50 py-4 font-sans text-slate-600">
                  <div>
                    <p className="font-bold text-slate-900 uppercase text-[9px] text-slate-400 font-mono tracking-wider mb-1">SAĞLAYICI / SEVK EDEN</p>
                    <p className="font-bold text-slate-800">{docSettings.companyName}</p>
                    <p>{docSettings.companyAddress}</p>
                    <p className="text-[10px] font-mono">{docSettings.taxId}</p>
                    <p className="text-[10px] text-blue-600">Tel: {docSettings.companyPhone}</p>
                    <p className="text-[10px] text-blue-600">{docSettings.companyEmail}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 uppercase text-[9px] text-slate-400 font-mono tracking-wider mb-1">ALICI / SEVK MAHALİ</p>
                    <p className="font-bold text-slate-800">{docSettings.customerName}</p>
                    <p className="font-semibold text-slate-700">{docSettings.customerCompany}</p>
                    <p>{docSettings.customerAddress}</p>
                    <p className="text-[10px] font-mono">{docSettings.customerTaxId}</p>
                    <p className="text-[10px] text-blue-600">Tel: {docSettings.customerPhone}</p>
                    <p className="text-[10px] text-blue-600">{docSettings.customerEmail}</p>
                  </div>
                </div>

                {/* Items listing table mockup */}
                <div className="space-y-2">
                  <p className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">FATURA SATIR KALEMİ</p>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <th className="py-2 px-1">Sevk Edilen Ürün Kapsamı</th>
                        <th className="py-2 px-1 text-center font-mono">Adet</th>
                        <th className="py-2 px-1 text-right font-mono">Birim Tutarı</th>
                        <th className="py-2 px-1 text-right font-mono">Toplam</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-1">
                          <p className="font-bold text-slate-800 leading-snug">
                            {products.find(p => p.id === selectedSaleReceipt.productId)?.name || selectedSaleReceipt.productId}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono">ID: {selectedSaleReceipt.productId}</p>
                        </td>
                        <td className="py-3 px-1 text-center font-mono font-semibold">
                          {selectedSaleReceipt.quantity}
                        </td>
                        <td className="py-3 px-1 text-right font-mono">
                          ${(selectedSaleReceipt.totalAmount / selectedSaleReceipt.quantity).toFixed(2)}
                        </td>
                        <td className="py-3 px-1 text-right font-mono font-bold text-slate-900">
                          ₺{selectedSaleReceipt.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Aggregates checkout receipt footer */}
                <div className="flex flex-col items-end space-y-1.5 pt-4 text-xs font-mono text-slate-600">
                  <div className="flex justify-between w-48">
                    <span>Ara Toplam:</span>
                    <span>₺{selectedSaleReceipt.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-48 font-bold border-t border-slate-200 pt-1.5 text-slate-950 text-sm">
                    <span>Toplam Tahsilat:</span>
                    <span>₺{selectedSaleReceipt.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Company Contact Info Footer */}
                <div className="text-[9px] text-slate-500 border-t border-slate-100 pt-3 font-mono space-y-0.5">
                  <p>📧 Fatura İçin: <span className="text-blue-600">{docSettings.invoiceEmail}</span></p>
                  <p>🌐 Web: <span className="text-blue-600">{docSettings.websiteUrl}</span></p>
                </div>

                {/* Footer notes */}
                <div className="text-[9px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2 text-center italic font-sans">
                  "Bu belge {docSettings.companyName} otomasyon sistemi ['GenerateReceipt' Botu] tarafından dijital olarak düzenlenerek arşivlenmiştir."
                </div>

              </div>

            </div>

            {/* Action buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between gap-2 flex-wrap">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                PDF İndir
              </button>

              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer ml-auto"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Document Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
              <h3 className="font-bold text-lg tracking-wide">Fiş Belge Ayarları</h3>
              <p className="text-sm text-slate-300 mt-1">Faturalarda ve fiş belgelerde görünecek şirket bilgilerini düzenleyin</p>
            </div>

            <form className="p-6 space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto" onSubmit={(e) => {
              e.preventDefault();
              handleSaveDocSettings();
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-slate-700 font-bold text-sm mb-2">
                    Şirket Adı
                  </label>
                  <input
                    type="text"
                    value={tempSettings.companyName}
                    onChange={(e) => setTempSettings({...tempSettings, companyName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="AKN Global Group Ltd"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-sm mb-2">
                    Vergi Kimlik Numarası
                  </label>
                  <input
                    type="text"
                    value={tempSettings.taxId}
                    onChange={(e) => setTempSettings({...tempSettings, taxId: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Vergi No: 1234567890"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-sm mb-2">
                    Şirket Adresi
                  </label>
                  <input
                    type="text"
                    value={tempSettings.companyAddress}
                    onChange={(e) => setTempSettings({...tempSettings, companyAddress: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="İstanbul, Türkiye"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-sm mb-2">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={tempSettings.companyPhone}
                    onChange={(e) => setTempSettings({...tempSettings, companyPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="+90 542 578 3748"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-sm mb-2">
                    Şirket E-Postası
                  </label>
                  <input
                    type="email"
                    value={tempSettings.companyEmail}
                    onChange={(e) => setTempSettings({...tempSettings, companyEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="info@aknglobal.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-sm mb-2">
                    Fatura Gönderilecek E-Posta
                  </label>
                  <input
                    type="email"
                    value={tempSettings.invoiceEmail}
                    onChange={(e) => setTempSettings({...tempSettings, invoiceEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="fatura@aknglobal.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-bold text-sm mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={tempSettings.websiteUrl}
                    onChange={(e) => setTempSettings({...tempSettings, websiteUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="www.aknglobal.com"
                  />
                </div>

              </div>

              {/* Müşteri Bilgileri Separator */}
              <div className="border-t border-slate-300 pt-5 mt-5">
                <h4 className="font-bold text-slate-800 mb-4 text-base flex items-center gap-2">
                  👤 Müşteri Bilgileri
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-slate-700 font-bold text-sm mb-2">
                      Müşteri Adı Soyadı
                    </label>
                    <input
                      type="text"
                      value={tempSettings.customerName}
                      onChange={(e) => setTempSettings({...tempSettings, customerName: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Müşteri Adı Soyadı"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-sm mb-2">
                      Müşteri Şirketi
                    </label>
                    <input
                      type="text"
                      value={tempSettings.customerCompany}
                      onChange={(e) => setTempSettings({...tempSettings, customerCompany: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Müşteri Şirketi"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-sm mb-2">
                      Müşteri Adresi
                    </label>
                    <input
                      type="text"
                      value={tempSettings.customerAddress}
                      onChange={(e) => setTempSettings({...tempSettings, customerAddress: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Müşteri Adresi"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-sm mb-2">
                      Müşteri Telefonu
                    </label>
                    <input
                      type="tel"
                      value={tempSettings.customerPhone}
                      onChange={(e) => setTempSettings({...tempSettings, customerPhone: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Müşteri Telefonu"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-sm mb-2">
                      Müşteri E-Postası
                    </label>
                    <input
                      type="email"
                      value={tempSettings.customerEmail}
                      onChange={(e) => setTempSettings({...tempSettings, customerEmail: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="musteri@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-sm mb-2">
                      Müşteri Vergi No
                    </label>
                    <input
                      type="text"
                      value={tempSettings.customerTaxId}
                      onChange={(e) => setTempSettings({...tempSettings, customerTaxId: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Müşteri Vergi No"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-bold text-sm mb-2">
                      📱 Müşteri WhatsApp Numarası (Fatura Göndermek İçin)
                    </label>
                    <input
                      type="tel"
                      value={tempSettings.customerWhatsApp}
                      onChange={(e) => setTempSettings({...tempSettings, customerWhatsApp: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="+90 5XX XXX XXXX (Ülke kodu ile birlikte)"
                    />
                    <p className="text-xs text-slate-500 mt-1">💡 Örnek: +90 542 578 3748 (Boşluklar otomatik silinecektir)</p>
                  </div>

                </div>
              </div>

              {/* Preview Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">🏢 Fiş Belgesinde Görüntülenecek Şirket Bilgileri</p>
                  <div className="text-xs text-slate-700 space-y-1 font-mono ml-2 border-l-2 border-slate-300 pl-3">
                    <p><span className="font-bold">Şirket:</span> {tempSettings.companyName}</p>
                    <p><span className="font-bold">Vergi No:</span> {tempSettings.taxId}</p>
                    <p><span className="font-bold">Adres:</span> {tempSettings.companyAddress}</p>
                    <p><span className="font-bold">Tel:</span> {tempSettings.companyPhone}</p>
                    <p><span className="font-bold">E-Posta:</span> {tempSettings.companyEmail}</p>
                    <p><span className="font-bold">Fatura Mail:</span> {tempSettings.invoiceEmail}</p>
                    <p><span className="font-bold">Web:</span> {tempSettings.websiteUrl}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">👤 Fiş Belgesinde Görüntülenecek Müşteri Bilgileri</p>
                  <div className="text-xs text-slate-700 space-y-1 font-mono ml-2 border-l-2 border-blue-300 pl-3">
                    <p><span className="font-bold">Müşteri:</span> {tempSettings.customerName}</p>
                    <p><span className="font-bold">Şirketi:</span> {tempSettings.customerCompany}</p>
                    <p><span className="font-bold">Adres:</span> {tempSettings.customerAddress}</p>
                    <p><span className="font-bold">Tel:</span> {tempSettings.customerPhone}</p>
                    <p><span className="font-bold">E-Posta:</span> {tempSettings.customerEmail}</p>
                    <p><span className="font-bold">Vergi No:</span> {tempSettings.customerTaxId}</p>
                    <p><span className="font-bold">📱 WhatsApp:</span> {tempSettings.customerWhatsApp}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    handleResetDocSettings();
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleResetDocSettings}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                >
                  Eski Değerleri Geri Yükle
                </button>
                <button
                  type="submit"
                  className="ml-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all cursor-pointer shadow-sm"
                >
                  Ayarları Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
