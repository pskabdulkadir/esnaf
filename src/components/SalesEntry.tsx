import React, { useState, useMemo, useEffect } from 'react';
import { Product, Sale, Currency } from '../types';
import CameraBarcodeScanner from './CameraBarcodeScanner';
import { TRANSLATIONS } from '../lib/translations';
import { 
  Barcode, 
  ShoppingCart, 
  Database, 
  Clock, 
  Calendar, 
  Plus, 
  AlertCircle,
  TrendingUp, 
  Search, 
  Camera, 
  Check, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Settings,
  Sparkle
} from 'lucide-react';

interface SalesEntryProps {
  products: Product[];
  sales: Sale[];
  onAddSale: (sale: Sale) => void;
  onNavigateToInventory: () => void;
  brandName?: string;
  language?: 'tr' | 'en' | 'de';
}

interface CartItem {
  productId: string;
  quantity: number;
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

export default function SalesEntry({ products, sales, onAddSale, onNavigateToInventory, brandName = 'AKN Global Group', language = 'tr' }: SalesEntryProps) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;
  // Point of Sale states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [saleQuantity, setSaleQuantity] = useState<number>(1);
  const [saleDate, setSaleDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Camera Scanner States
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Selected Product details for direct checkout calculations
  const currentProductItem = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  // Compute live subtotal amount based on AppSheet spec: [Quantity] * [Products].[SalePrice]
  const calculatedTotalAmount = useMemo(() => {
    if (!currentProductItem) return 0;
    return saleQuantity * currentProductItem.salePrice;
  }, [currentProductItem, saleQuantity]);

  // Calculate total cart amount
  const cartTotalAmount = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;
      return total + (item.quantity * product.salePrice);
    }, 0);
  }, [cartItems, products]);

  // Add product to cart
  const handleAddToCart = () => {
    if (!selectedProductId) {
      alert("Lütfen önce bir ürün seçin.");
      return;
    }
    if (!currentProductItem) return;

    const existingItem = cartItems.find(item => item.productId === selectedProductId);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.productId === selectedProductId
          ? { ...item, quantity: item.quantity + saleQuantity }
          : item
      ));
    } else {
      setCartItems([...cartItems, { productId: selectedProductId, quantity: saleQuantity }]);
    }

    setSelectedProductId('');
    setSaleQuantity(1);
  };

  // Remove product from cart
  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  // Update quantity in cart
  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(cartItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Submit sale handler for multiple products
  const handleRecordSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Lütfen önce sepete ürün ekleyin.");
      return;
    }

    // Check stock for all items
    const stockWarnings: string[] = [];
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.currentStock < item.quantity) {
        stockWarnings.push(`${product.name}: İstenecek miktar ${item.quantity} adettir ancak envanterde sadece ${product.currentStock} adet mevcuttur.`);
      }
    }

    if (stockWarnings.length > 0) {
      if (!confirm(`Uyarı: ${brandName} stok limiti aşılacaktır.\n\n${stockWarnings.join('\n')}\n\nDevam etmek istiyor musunuz?`)) {
        return;
      }
    }

    // Create a sale for each product in cart
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      const nextId = `SAL-${101 + sales.length + Math.floor(Math.random() * 900)}`;
      const newSale: Sale = {
        id: nextId,
        date: saleDate || new Date().toISOString().split('T')[0],
        productId: item.productId,
        quantity: item.quantity,
        totalAmount: item.quantity * product.salePrice
      };

      onAddSale(newSale);
    }

    // Reset forms
    setCartItems([]);
    setSelectedProductId('');
    setSaleQuantity(1);
  };

  // Recent Sales sorted by newest
  const recentSalesList = useMemo(() => {
    return [...sales].reverse();
  }, [sales]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* View Header with AKN logo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{brandName} {t.cashSalesPoint}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.salesPointSubtitle}
          </p>
        </div>

        {/* PROMINENT BARCODE CHECKOUT TRIGGER BUTTON */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="bg-slate-900 text-amber-500 hover:bg-slate-800 border-2 border-amber-500/30 hover:border-amber-500/60 font-mono font-bold py-3 pr-5 pl-4 rounded-xl text-xs flex items-center justify-center gap-3 shadow-lg shadow-slate-950/25 transition-all duration-150 self-stretch sm:self-auto cursor-pointer group"
        >
          <div className="relative">
            <Camera className="h-4 w-4 text-amber-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <span>{t.scanBarcodeBtn || 'CANLI KAMERA BARKOD OKUYUCU'}</span>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-md group-hover:scale-105 transition-transform">
            ALT + S
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales record entry card form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1 h-fit">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Satış Kaydetme</h3>
          </div>

          <form onSubmit={handleRecordSaleSubmit} className="mt-5 space-y-4">

            {/* Step 1: Select Product */}
            <div>
              <label className="block text-slate-400 font-bold tracking-tight text-[10px] uppercase font-mono mb-1.5">
                Katalogdan Ürün Sorgulama
              </label>
              {products.length === 0 ? (
                <div className="text-xs text-red-650 p-2 bg-red-50 rounded-lg border border-red-100 mb-1.5">
                  Katalogda aktif ürün bulunamadı. Lütfen önce ürün tanımlayın.
                </div>
              ) : (
                <select
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800"
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setSaleQuantity(1);
                  }}
                >
                  <option value="">-- Ürün Seçiniz --</option>
                  {products.map((p) => {
                    const isLow = p.currentStock < p.lowStockThreshold;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.name} (${p.salePrice.toFixed(2)}) {isLow ? '⚠️ Kritik Seviye' : `(Elde Mevcut: ${p.currentStock})`}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Live context showing target stock alerts on POS */}
            {currentProductItem && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-[11px] text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span>Envanterdeki Stok Miktarı:</span>
                  <span className={`font-mono font-bold ${currentProductItem.currentStock < currentProductItem.lowStockThreshold ? "text-red-650" : "text-emerald-700"}`}>
                    {currentProductItem.currentStock} Adet
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Birim Alış Gideri (Maliyet):</span>
                  <span className="font-mono">{getCurrencySymbol(currentProductItem.purchaseCurrency)}{currentProductItem.purchasePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Birim Satış Perakende Tutarı:</span>
                  <span className="font-mono font-bold text-slate-950">{getCurrencySymbol(currentProductItem.saleCurrency)}{currentProductItem.salePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-400">
                  <span>Kayıtlı Barkod No:</span>
                  <span className="font-mono text-[10px]">{currentProductItem.barcode}</span>
                </div>
              </div>
            )}

            {/* Step 2: Quantities */}
            <div>
              <label className="block text-slate-400 font-bold tracking-tight text-[10px] uppercase font-mono mb-1.5">
                Satılan Adet (Miktar)
              </label>
              <input
                type="number"
                min="1"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold"
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(Math.max(1, Number(e.target.value)))}
              />
            </div>

            {/* Add to cart button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedProductId || products.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-205 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-emerald-100"
            >
              <Plus className="h-4 w-4" />
              Sepete Ekle
            </button>

            {/* Step 3: Date Setting Default TODAY */}
            <div>
              <label className="block text-slate-400 font-bold tracking-tight text-[10px] uppercase font-mono mb-1.5">
                Satış ve İrsaliye Tarihi
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  required
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                />
              </div>
              <p className="text-[9px] text-slate-400 font-mono mt-1">Varsayılan değer bugünün güncel tarihidir</p>
            </div>

            {/* Shopping Cart Summary */}
            {cartItems.length > 0 && (
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100/60 text-xs space-y-3">
                <span className="text-[10px] font-mono font-semibold text-amber-700 uppercase tracking-wider block">
                  Sepetinizdeki Ürünler ({cartItems.length})
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cartItems.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    const itemTotal = item.quantity * product.salePrice;
                    return (
                      <div key={item.productId} className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-100/40">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 text-[10px]">{product.name}</p>
                          <p className="text-[9px] text-slate-500">{item.quantity} Adet × {getCurrencySymbol(product.saleCurrency)}{product.salePrice.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            className="w-12 text-xs px-2 py-1 rounded border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold text-center"
                            value={item.quantity}
                            onChange={(e) => handleUpdateCartQuantity(item.productId, Math.max(1, Number(e.target.value)))}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total Cart Amount */}
            {cartItems.length > 0 && (
              <div className="bg-indigo-50/45 p-4 rounded-xl border border-indigo-100/60 text-xs">
                <span className="text-[10px] font-mono font-semibold text-indigo-500 uppercase tracking-wider block mb-1">
                  SEPET TOPLAM TUTARI
                </span>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-slate-500 font-mono text-[11px]">
                    {cartItems.length} Ürün
                  </span>
                  <span className="text-lg font-mono font-bold text-indigo-700">
                    ₺{cartTotalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={cartItems.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-205 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-indigo-100"
            >
              <Plus className="h-4 w-4" />
              İşlemi Tamamla ve Satışları Kaydet
            </button>
          </form>
        </div>

        {/* Sales history dashboard listing */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2 flex flex-col justify-between font-sans">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-slate-700" />
                <h3 className="font-bold text-slate-800 text-sm">Satış Kayıtları ve Kasa Defteri</h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Otomatik Envanter Düşümü: AKTİF
              </span>
            </div>

            <div className="overflow-x-auto mt-4 max-h-96">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[10px] uppercase font-mono tracking-wider">
                    <th className="py-3 px-4">Satış Fiş No</th>
                    <th className="py-3 px-4">Zaman Damgası</th>
                    <th className="py-3 px-4">Satılan Ürün Kapsamı</th>
                    <th className="py-3 px-4 text-center">Miktar</th>
                    <th className="py-3 px-4 text-right">Kasa Tutarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {recentSalesList.map((sale) => {
                    const prod = products.find(p => p.id === sale.productId);
                    return (
                      <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{sale.id}</td>
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{sale.date}</td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-semibold text-slate-800 truncate">
                            {prod ? prod.name : `Kayıtsız Ürün (ID: ${sale.productId})`}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono">ID: {sale.productId} • Barkod: {prod ? prod.barcode : "Mevcut Değil"}</p>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">{sale.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                          {prod ? getCurrencySymbol(prod.saleCurrency) : '₺'}{sale.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}

                  {recentSalesList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <ShoppingCart className="h-10 w-10 mx-auto stroke-[1.5] text-slate-300 mb-2" />
                        <p className="text-xs">Kasa defterinde henüz kayıtlı işlem veya tahsilat bulunmamaktadır.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>
                Yapılan her satış işlemi sonrasında ürün stok seviyesi otomatik olarak düşürülür.
              </span>
            </div>
            <button
              onClick={onNavigateToInventory}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Envanter Stok Seviyelerini Doğrula →
            </button>
          </div>
        </div>

      </div>

      {/* Real Live Camera Barcode/QR Scanner overlay modal */}
      {isScannerOpen && (
        <CameraBarcodeScanner
          onScan={(barcode) => {
            const associatedProduct = products.find(p => p.barcode === barcode);
            if (associatedProduct) {
              setSelectedProductId(associatedProduct.id);
              setSaleQuantity(1);
            } else {
              alert(`Tanımsız Barkod: "${barcode}" numaralı ürün sistemde kayıtlı değil!\n\nLütfen "Envanter" ekranından bu barkod numarasıyla yeni bir ürün tanımlayınız.`);
            }
          }}
          onClose={() => setIsScannerOpen(false)}
          brandName={brandName}
          placeholderText="Cihaz kamerasını barkoda tutun. Her tarama sonrası ürün seçimine eklenecektir."
        />
      )}

    </div>
  );
}
