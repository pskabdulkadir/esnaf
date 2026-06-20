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
