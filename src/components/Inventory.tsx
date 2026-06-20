import React, { useState, useMemo } from 'react';
import { Product, UserRole, Currency } from '../types';
import CameraBarcodeScanner from './CameraBarcodeScanner';
import { jsPDF } from 'jspdf';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  ShieldAlert,
  Loader2,
  TrendingUp,
  Barcode,
  RefreshCw,
  Camera,
  Download,
  FileText
} from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  userRole: UserRole;
  brandName?: string;
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

export default function Inventory({ products, onAddProduct, onUpdateProduct, onDeleteProduct, userRole, brandName = 'AKN Global Group' }: InventoryProps) {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [viewMode, setViewMode] = useState<'All' | 'Critical'>('All');
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('Lojistik Ekipmanları');
  const [formPurchasePrice, setFormPurchasePrice] = useState(1.00);
  const [formPurchaseCurrency, setFormPurchaseCurrency] = useState<'TL' | 'USD' | 'EUR'>('TL');
  const [formSalePrice, setFormSalePrice] = useState(2.00);
  const [formSaleCurrency, setFormSaleCurrency] = useState<'TL' | 'USD' | 'EUR'>('TL');
  const [formCurrentStock, setFormCurrentStock] = useState(10);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState(5);
  const [formError, setFormError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['Tümü', ...Array.from(list)];
  }, [products]);

  // Slices: 'CriticalStock' where 'CurrentStock' < 'LowStockThreshold'
  const criticalStockList = useMemo(() => {
    return products.filter(p => p.currentStock < p.lowStockThreshold);
  }, [products]);

  // Virtual Columns Totals
  const totalStockCount = useMemo(() => {
    return products.reduce((sum, p) => sum + p.currentStock, 0);
  }, [products]);

  const totalStockInvestment = useMemo(() => {
    return products.reduce((sum, p) => sum + p.purchasePrice * p.currentStock, 0);
  }, [products]);

  const totalStokKarPotansiyeli = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.salePrice - p.purchasePrice) * p.currentStock, 0);
  }, [products]);

  // Filtered list
  const filteredProducts = useMemo(() => {
    const baseList = viewMode === 'Critical' ? criticalStockList : products;
    return baseList.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.barcode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'Tümü' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, criticalStockList, viewMode, searchTerm, selectedCategory]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const nextId = `PROD-${101 + products.length}`;
    setFormId(nextId);
    setFormName('');
    setFormBarcode(Math.floor(840134000000 + Math.random() * 99999).toString());
    setFormCategory('Lojistik Ekipmanları');
    setFormPurchasePrice(10.00);
    setFormPurchaseCurrency('TL');
    setFormSalePrice(25.00);
    setFormSaleCurrency('TL');
    setFormCurrentStock(15);
    setFormLowStockThreshold(5);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormId(product.id);
    setFormName(product.name);
    setFormBarcode(product.barcode);
    setFormCategory(product.category);
    setFormPurchasePrice(product.purchasePrice);
    setFormPurchaseCurrency(product.purchaseCurrency);
    setFormSalePrice(product.salePrice);
    setFormSaleCurrency(product.saleCurrency);
    setFormCurrentStock(product.currentStock);
    setFormLowStockThreshold(product.lowStockThreshold);
    setFormError('');
    setIsModalOpen(true);
  };

  const generateRandomBarcode = () => {
    setFormBarcode(Math.floor(840130000000 + Math.random() * 99999).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Ürün adı girmek zorunludur.');
      return;
    }
    if (!formBarcode.trim()) {
      setFormError('Ürün barkodu girmek zorunludur.');
      return;
    }
    if (formPurchasePrice < 0 || formSalePrice < 0) {
      setFormError('Fiyat bilgileri negatif bir değer olamaz.');
      return;
    }

    const newProd: Product = {
      id: formId,
      name: formName.trim(),
      barcode: formBarcode.trim(),
      category: formCategory,
      purchasePrice: Number(formPurchasePrice),
      purchaseCurrency: formPurchaseCurrency,
      salePrice: Number(formSalePrice),
      saleCurrency: formSaleCurrency,
      currentStock: Number(formCurrentStock),
      lowStockThreshold: Number(formLowStockThreshold)
    };

    if (editingProduct) {
      if (userRole !== 'Yonetici') {
        newProd.purchasePrice = editingProduct.purchasePrice;
        newProd.salePrice = editingProduct.salePrice;
      }
      onUpdateProduct(newProd);
    } else {
      if (products.some(p => p.id === formId)) {
        setFormError('Bu benzersiz ID numarasına sahip bir ürün zaten mevcut.');
        return;
      }
      onAddProduct(newProd);
    }

    setIsModalOpen(false);
  };

  const handleExportStockPDF = () => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape mode

      // Add title
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`${brandName} - Stok Listesi`, 14, 20);

      // Add export date
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const exportDate = new Date().toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Dışa Aktarma Tarihi: ${exportDate}`, 14, 28);
      doc.text(`Toplam Ürün: ${products.length}`, 14, 34);

      // Create table data
      const tableData: string[][] = [
        ['Ürün ID', 'Ürün Adı', 'Barkod', 'Kategori', 'Alış Fiyatı', 'Satış Fiyatı', 'Mevcut Stok', 'Kritik Eşik']
      ];

      products.forEach(p => {
        tableData.push([
          p.id,
          p.name,
          p.barcode,
          p.category,
          `${getCurrencySymbol(p.purchaseCurrency)}${p.purchasePrice.toFixed(2)}`,
          `${getCurrencySymbol(p.saleCurrency)}${p.salePrice.toFixed(2)}`,
          p.currentStock.toString(),
          p.lowStockThreshold.toString()
        ]);
      });

      // Add table using text (simple approach)
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      const startY = 42;

      let currentY = startY;
      const rowHeight = 6;
      const headerHeight = 8;

      // Draw header row
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setFillColor(30, 41, 59); // slate-900
      doc.setTextColor(255, 255, 255);

      const colWidths = [18, 32, 20, 25, 20, 20, 18, 18];
      const colPositions = [
        margin,
        margin + colWidths[0],
        margin + colWidths[0] + colWidths[1],
        margin + colWidths[0] + colWidths[1] + colWidths[2],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6]
      ];

      // Draw header
      doc.rect(margin, currentY, pageWidth - 2 * margin, headerHeight, 'F');
      const headers = ['Ürün ID', 'Ürün Adı', 'Barkod', 'Kategori', 'Alış', 'Satış', 'Stok', 'Eşik'];
      headers.forEach((header, i) => {
        doc.text(header, colPositions[i], currentY + 5);
      });

      currentY += headerHeight;

      // Draw data rows
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);

      let rowIndex = 0;
      tableData.slice(1).forEach(row => {
        if (currentY + rowHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;

          // Redraw header on new page
          doc.setFontSize(9);
          doc.setFont(undefined, 'bold');
          doc.setFillColor(30, 41, 59);
          doc.setTextColor(255, 255, 255);
          doc.rect(margin, currentY, pageWidth - 2 * margin, headerHeight, 'F');
          headers.forEach((header, i) => {
            doc.text(header, colPositions[i], currentY + 5);
          });
          currentY += headerHeight;
          doc.setFont(undefined, 'normal');
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(8);
        }

        // Alternate row colors
        if (rowIndex % 2 === 1) {
          doc.setFillColor(248, 250, 252); // slate-50
          doc.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
        }

        row.forEach((cell, i) => {
          doc.text(cell, colPositions[i], currentY + 4);
        });

        currentY += rowHeight;
        rowIndex++;
      });

      // Save PDF
      const fileName = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_stok_listesi_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Branding Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{brandName} Envanteri</h1>
          <p className="text-xs text-slate-500 mt-1">
            Mevcut envanteri inceleyin, kritik stok uyarı eşiklerini yapılandırın ve toptan ürün operasyonlarını yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleExportStockPDF}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-amber-100 transition-all duration-150 cursor-pointer"
            title="Mevcut stok listesini PDF olarak indir"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Stok PDF İndir</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-indigo-100 transition-all duration-150 flex-1 sm:flex-none cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Yeni Ürün Tanımla
          </button>
        </div>
      </div>

      {/* Inventory Virtual Column Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Toplam Envanter Adedi</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h4 className="text-2xl font-bold font-mono text-slate-900">{totalStockCount.toLocaleString('tr-TR')}</h4>
            <span className="text-slate-500 text-xs font-semibold">Adet Ürün</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Depolardaki tüm ürünlerin fiziksel toplamı</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Envanter Yatırım Maliyeti</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h4 className="text-2xl font-bold font-mono text-slate-900">${totalStockInvestment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Elde mevcut stoğun toptan alış gideri</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50/60 to-indigo-100/30 p-5 rounded-2xl border border-indigo-100">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 font-mono">Sanal Sütun: Stok Kâr Potansiyeli</p>
            <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full font-mono">FORMÜL</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h4 className="text-2xl font-bold font-mono text-indigo-700">${totalStokKarPotansiyeli.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          </div>
          <p className="text-[10px] text-indigo-500 mt-2 font-mono">
            ([SalePrice] - [PurchasePrice]) × [CurrentStock]
          </p>
        </div>
      </div>

      {/* Slices Switcher Tabs & Role Watcher Header */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setViewMode('All')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${viewMode === 'All' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            <Package className="h-4 w-4" />
            Tüm Ürünlerin Kataloğu ({products.length})
          </button>
          
          <button
            onClick={() => setViewMode('Critical')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
              viewMode === 'Critical' 
                ? "bg-red-600 text-white shadow-sm" 
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Kritik Stok Dilimi ({criticalStockList.length})
          </button>
        </div>

        {/* User Role Highlight Banner */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
          <span className="text-slate-400">Aktif Güvenlik Rolü:</span>
          {userRole === 'Yonetici' ? (
            <span className="text-emerald-700 bg-emerald-50 font-bold py-0.5 px-2 rounded-full border border-emerald-100 flex items-center gap-1">
              👑 Tam Yönetici Yetkisi
            </span>
          ) : (
            <span className="text-amber-700 bg-amber-50 font-bold py-0.5 px-2 rounded-full border border-amber-100 flex items-center gap-1">
              👤 Sınırlı Satış Görevlisi
            </span>
          )}
        </div>
      </div>

      {/* High-visibility Critical stocks alert notice */}
      {viewMode === 'Critical' && (
        <div className="bg-red-50 border-2 border-dashed border-red-200 p-5 rounded-2xl flex items-start gap-4 animate-pulse">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl self-start mt-0.5">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-800">Operasyonel Uyarı: Stok Takviye Gereksinimi</h4>
            <p className="text-xs text-red-700 mt-1">
              Aşağıda gösterilen ürünlerin güncel stok miktarları, belirlenmiş asgari güvenlik seviyesinin altındadır.
              Tedarik ve lojistik departmanlarının acil sipariş oluşturması tavsiye edilir.
            </p>
          </div>
        </div>
      )}

      {/* Control Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="ID, Ürün Adı veya Barkod ile ara..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Kategori: {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end text-xs font-mono text-slate-400">
          Kayıtlı {products.length} adet üründen {filteredProducts.length} tanesi gösteriliyor
        </div>
      </div>

      {/* Main Catalog Table Cards / Layout */}
      <div className="overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider font-mono">
                <th className="py-4 px-6">ID ve Kategori</th>
                <th className="py-4 px-6">Ürün Bilgileri</th>
                <th className="py-4 px-6">Barkod No</th>
                <th className="py-4 px-6 text-right">Alış Fiyatı</th>
                <th className="py-4 px-6 text-right">Satış Fiyatı</th>
                <th className="py-4 px-6 text-right">Sanal: Stok Kâr Potansiyeli</th>
                <th className="py-4 px-6 text-center">Stok Seviyesi</th>
                <th className="py-4 px-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map((p) => {
                const isLow = p.currentStock < p.lowStockThreshold;
                const unitMargin = p.salePrice - p.purchasePrice;
                const stokKarPotansiyeli = unitMargin * p.currentStock;
                return (
                  <tr 
                    key={p.id} 
                    className={`hover:bg-slate-50/50 transition-colors duration-150 ${
                      isLow ? "bg-red-50/20" : ""
                    }`}
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 py-1 px-2.5 rounded-lg border border-slate-200 inline-block mb-1.5">
                        {p.id}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">{p.category}</p>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="font-bold text-slate-800 line-clamp-2 leading-relaxed">{p.name}</p>
                      {isLow && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full select-none">
                          <AlertTriangle className="h-3 w-3" />
                          Kritik asgari limit aşıldı!
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Barcode className="h-4 w-4 text-slate-400" />
                        <span>{p.barcode}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-medium text-slate-600">
                      {getCurrencySymbol(p.purchaseCurrency)}{p.purchasePrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-indigo-600">
                      {getCurrencySymbol(p.saleCurrency)}{p.salePrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className="font-mono font-bold text-emerald-600">{getCurrencySymbol(p.saleCurrency)}{stokKarPotansiyeli.toFixed(2)}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">Birim Marjı: {getCurrencySymbol(p.saleCurrency)}{unitMargin.toFixed(2)}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-block">
                        <div className={`text-sm font-bold font-mono px-3 py-1 rounded-full border ${
                          isLow 
                            ? "bg-red-100 text-red-700 border-red-200 font-extrabold animate-pulse" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}>
                          {p.currentStock}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">Eşik Seviye: {p.lowStockThreshold}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Ürün Detaylarını Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`${p.id} kodlu ürünü envanterden kalıcı olarak silmek istediğinizden emin misiniz?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                          title="Ürünü Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="h-10 w-10 mx-auto stroke-[1.5] text-slate-300 mb-2" />
                    <p className="text-sm font-medium">Filtreleme kurallarına uygun hiçbir ürün bulunamadı.</p>
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('Tümü');
                        setViewMode('All');
                      }}
                      className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Tüm filtreleri temizle
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-slide-up">
            <div className={`p-5 text-white ${editingProduct ? "bg-slate-900" : "bg-indigo-600"} flex items-center justify-between`}>
              <div>
                <h3 className="font-bold text-base">
                  {editingProduct ? `${editingProduct.id} Özelliklerini Düzenle` : "Yeni Toptan Eşya Tanımla"}
                </h3>
                <p className="text-white/80 text-[11px] mt-0.5">{brandName} Kurumsal Envanter Sistemi</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold tracking-tight text-[10px] uppercase font-mono mb-1">
                    Benzersiz Ürün ID'si
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingProduct !== null}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 disabled:text-slate-400 disabled:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold tracking-tight text-[10px] uppercase font-mono mb-1">
                    Ürün Kategorisi
                  </label>
                  <select
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Lojistik Ekipmanları">Lojistik Ekipmanları</option>
                    <option value="Operasyonel Malzemeler">Operasyonel Malzemeler</option>
                    <option value="Birinci Sınıf Ürünler">Birinci Sınıf Ürünler</option>
                    <option value="İthal Elektronik Ürünler">İthal Elektronik Ürünler</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold tracking-tight text-[10px] uppercase font-mono mb-1">
                  Tam Ürün İsmi
                </label>
                <input
                  type="text"
                  required
                  placeholder="ÖRN: Ağır Hizmet Tipi Çelik Vana G-8"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold tracking-tight text-[10px] uppercase font-mono mb-1">
                  Ürün Barkodu (Tarama Hedefi)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="8401340029"
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
                      value={formBarcode}
                      onChange={(e) => setFormBarcode(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10px] font-mono text-emerald-700 flex items-center gap-1 cursor-pointer"
                    title="Kamerayı Aç ve Barkodu Tara"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Tara
                  </button>
                  <button
                    type="button"
                    onClick={generateRandomBarcode}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-[10px] font-mono text-slate-600 flex items-center gap-1 cursor-pointer"
                    title="Yeni Barkod Oluştur"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Rastgele Üret
                  </button>
                </div>
              </div>

              {/* Editing restricted items section */}
              <div className="border border-slate-150 rounded-xl p-4 bg-slate-50 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  Toptan Maliyet, Kâr ve Satış Fiyatlandırması
                </span>
                
                {userRole !== 'Yonetici' && editingProduct && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 text-[10px] font-semibold">
                    <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                    <span>Fiyat revizyonları kilitlidir. Yönetici rütbesi ve yetkisi gereklidir.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-medium text-[10px] mb-1">
                      Birim Alış Maliyeti
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">
                          {formPurchaseCurrency === 'TL' ? '₺' : formPurchaseCurrency === 'USD' ? '$' : '€'}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          disabled={userRole !== 'Yonetici' && editingProduct !== null}
                          className="w-full text-xs pl-6 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:bg-slate-100"
                          value={formPurchasePrice}
                          onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                        />
                      </div>
                      <select
                        className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                        value={formPurchaseCurrency}
                        onChange={(e) => setFormPurchaseCurrency(e.target.value as 'TL' | 'USD' | 'EUR')}
                      >
                        <option value="TL">₺ TL</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium text-[10px] mb-1">
                      Birim Satış Fiyatı
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">
                          {formSaleCurrency === 'TL' ? '₺' : formSaleCurrency === 'USD' ? '$' : '€'}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          disabled={userRole !== 'Yonetici' && editingProduct !== null}
                          className="w-full text-xs pl-6 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:bg-slate-100"
                          value={formSalePrice}
                          onChange={(e) => setFormSalePrice(Number(e.target.value))}
                        />
                      </div>
                      <select
                        className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                        value={formSaleCurrency}
                        onChange={(e) => setFormSaleCurrency(e.target.value as 'TL' | 'USD' | 'EUR')}
                      >
                        <option value="TL">₺ TL</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold tracking-tight text-[10px] uppercase font-mono mb-1">
                    Güncel Stok (Adet)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
                    value={formCurrentStock}
                    onChange={(e) => setFormCurrentStock(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold tracking-tight text-[10px] uppercase font-mono mb-1">
                    Kritik Stok Sınır Seviyesi
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
                    value={formLowStockThreshold}
                    onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    editingProduct ? "bg-slate-900 hover:bg-slate-800" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {editingProduct ? "Değişiklikleri Kaydet" : "Ürünü Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <CameraBarcodeScanner 
          onScan={(barcode) => {
            setFormBarcode(barcode);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
          brandName={brandName}
          placeholderText="Yeni ürüne kaydetmek istediğiniz barkodu veya QR kodu kameraya gösterin."
        />
      )}

    </div>
  );
}
