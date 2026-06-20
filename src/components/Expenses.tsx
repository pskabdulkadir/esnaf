import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  DollarSign, 
  Percent, 
  Truck, 
  Layers, 
  Coins 
} from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  brandName?: string;
}

export default function Expenses({ expenses, onAddExpense, onDeleteExpense, brandName = 'AKN' }: ExpensesProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  // New Expense form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number>(50.00);
  const [category, setCategory] = useState<'Vergi' | 'Lojistik' | 'Operasyonel'>('Operasyonel');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  // Computations
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const totals = { Vergi: 0, Lojistik: 0, Operasyonel: 0 };
    expenses.forEach((e) => {
      if (totals[e.category] !== undefined) {
        totals[e.category] += e.amount;
      }
    });
    return totals;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            e.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Tümü' || e.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).slice().reverse(); // Show newest first
  }, [expenses, searchTerm, selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) {
      setFormError('Açıklama alanı girmek zorunludur.');
      return;
    }
    if (amount <= 0) {
      setFormError('Harcama tutarı pozitif bir değer olmalıdır.');
      return;
    }

    const nextId = `EXP-${901 + expenses.length + Math.floor(Math.random() * 900)}`;
    const newExpense: Expense = {
      id: nextId,
      date: date || new Date().toISOString().split('T')[0],
      description: desc.trim(),
      amount: Number(amount),
      category
    };

    onAddExpense(newExpense);

    // Reset Form
    setDesc('');
    setAmount(50.00);
    setCategory('Operasyonel');
    setFormError('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Branding Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{brandName} Kurumsal Gider ve Harcamaları</h1>
          <p className="text-xs text-slate-500 mt-1">
            Mali harcamaları kaydedin, gümrük vergilerini beyan edin ve genel operasyon maliyetlerini denetleyin.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all duration-155 self-stretch sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {isFormOpen ? "Giriş Formunu Gizle" : "Yeni Gider Fişi Ekle"}
        </button>
      </div>

      {/* Overview Category Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Overall Expenses card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Toplam Gider Harcaması</p>
          <h4 className="text-2xl font-bold font-mono tracking-tight text-slate-900 mt-1">
            ₺{totalExpenses.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] text-slate-400 block mt-2">Aktif Fiş Kaydı: {expenses.length} adet</span>
        </div>

        {/* Category Tax */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vergi, Ruhsat ve Harçlar</p>
              <h4 className="text-xl font-bold font-mono text-slate-900 mt-1">
                ₺{categoryTotals.Vergi.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </h4>
            </div>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Coins className="h-4 w-4" />
            </span>
          </div>
          <div className="w-full h-1 bg-indigo-500 absolute bottom-0 left-0" style={{ width: `${totalExpenses > 0 ? (categoryTotals.Vergi / totalExpenses) * 100 : 0}%` }} />
        </div>

        {/* Category Logistics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lojistik ve Sevkiyat</p>
              <h4 className="text-xl font-bold font-mono text-slate-900 mt-1">
                ₺{categoryTotals.Lojistik.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </h4>
            </div>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Truck className="h-4 w-4" />
            </span>
          </div>
          <div className="w-full h-1 bg-blue-500 absolute bottom-0 left-0" style={{ width: `${totalExpenses > 0 ? (categoryTotals.Lojistik / totalExpenses) * 100 : 0}%` }} />
        </div>

        {/* Category Operational */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operasyonel ve Yönetim</p>
              <h4 className="text-xl font-bold font-mono text-slate-900 mt-1">
                ₺{categoryTotals.Operasyonel.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </h4>
            </div>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <div className="w-full h-1 bg-amber-500 absolute bottom-0 left-0" style={{ width: `${totalExpenses > 0 ? (categoryTotals.Operasyonel / totalExpenses) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Add New Expense Form drawer if open */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 space-y-4 animate-slide-up">
          <div className="pb-3 border-b border-slate-800">
            <h4 className="font-bold text-sm tracking-wide text-slate-200">Gider Fişi/Fatura Girişi</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{brandName} muhasebe standartlarına uygun harcamalar ekleyin</p>
          </div>

          {formError && (
            <div className="bg-amber-950/40 border border-amber-900 text-amber-300 p-3 rounded-lg text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-450 font-bold text-[10px] uppercase font-mono mb-1">
                Harcama Tarihi
              </label>
              <input
                type="date"
                required
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-350 focus:outline-none focus:border-indigo-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-450 font-bold text-[10px] uppercase font-mono mb-1">
                Gider Açıklaması / Detay
              </label>
              <input
                type="text"
                required
                placeholder="ÖRN: DHL gümrük işlemleri ve taşıma yakıt ek ücreti doğrulaması"
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl placeholder-slate-650 text-slate-350 focus:outline-none focus:border-indigo-500"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-450 font-bold text-[10px] uppercase font-mono mb-1">
                Gider Kategorisi
              </label>
              <select
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-350 focus:outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="Vergi">Vergi, Ruhsat ve Harçlar</option>
                <option value="Lojistik">Lojistik ve Sevkiyat</option>
                <option value="Operasyonel">Operasyonel ve Yönetim</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 gap-4 border-t border-slate-800">
            <div className="w-full sm:max-w-xs">
              <label className="block text-slate-450 font-bold text-[10px] uppercase font-mono mb-1">
                Harcama / Fatura Tutarı (₺)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-mono font-bold">₺</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  required
                  className="w-full text-xs pl-7 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-350 focus:outline-none"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Fişi Kaydet
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter and Ledger Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Gider detayı veya fiş no ara..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-205 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full text-xs px-4 py-2 rounded-xl border border-slate-205 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Tümü">Kategori: Tüm Harcamalar</option>
              <option value="Vergi">Kategori: Vergi, Ruhsat ve Harçlar</option>
              <option value="Lojistik">Kategori: Lojistik ve Sevkiyat</option>
              <option value="Operasyonel">Kategori: Operasyonel ve Yönetim</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-xs font-mono text-slate-400">
            Kayıtlı {expenses.length} harcamadan {filteredExpenses.length} tanesi gösteriliyor
          </div>
        </div>

        {/* Expenses List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-550 font-bold text-[10px] uppercase font-mono tracking-wider">
                <th className="py-3 px-6">Fiş No ve Tarih</th>
                <th className="py-3 px-6">Gider Kategorisi</th>
                <th className="py-3 px-6">Açıklama / Fiş Detayı</th>
                <th className="py-3 px-6 text-right">Borç Tutarı (₺)</th>
                <th className="py-3 px-6 text-right">Fiş İşlemleri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {exp.id}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{exp.date}</p>
                  </td>
                  <td className="py-4 px-6 font-medium">
                    <span className={`inline-block py-1 px-2.5 rounded-full font-bold text-[10px] ${
                      exp.category === 'Vergi' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : exp.category === 'Lojistik'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {exp.category === 'Vergi' ? '💼 Vergi ve Gümrük' : exp.category === 'Lojistik' ? '🚚 Lojistik ve Yakıt' : '🛠️ Operasyonel Harcama'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-800 max-w-sm font-semibold truncate" title={exp.description}>
                    {exp.description}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-red-650">
                    -₺{exp.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 border border-red-100 rounded-lg text-[10px] transition-colors cursor-pointer"
                    >
                      Kayıttan Sil
                    </button>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FileText className="h-10 w-10 mx-auto stroke-[1.5] text-slate-350 mb-2" />
                    <p className="text-xs">Filtrelere uygun kayıtlı gider belgesi bulunamadı.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
