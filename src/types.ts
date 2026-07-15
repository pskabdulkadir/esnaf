export type Currency = 'TL' | 'USD' | 'EUR';

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  purchasePrice: number;
  purchaseCurrency: Currency;
  salePrice: number;
  saleCurrency: Currency;
  currentStock: number;
  lowStockThreshold: number;
  ownerId: string; // Kim yükledi (lisans sahibinin kimliği)
  accessLevel: 'private' | 'shared' | 'all'; // private: sadece sahibi, shared: belirli esnaflar, all: herkes
}

export interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  productId: string;
  quantity: number;
  totalAmount: number;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  category: 'Vergi' | 'Lojistik' | 'Operasyonel';
}

export type UserRole = 'Uye' | 'Yonetici';
