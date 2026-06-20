export interface SiftahProduct {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  stockLimit: number; // Threshold above which we consider it overstocked
  category: string;
  expiryDate: string; // YYYY-MM-DD format
  isSpecialDiscount: boolean; // Flag if merchant marks it manually for discount
  lastUpdated: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  segment: 'Ev Hanımları' | 'Gençler' | 'Genel';
  isSubscribed: boolean;
  notes?: string;
}

export type CampaignStatus = 'Taslak' | 'Onay Bekliyor' | 'Kuyrukta' | 'Gönderiliyor' | 'Gönderildi' | 'İptal';

export interface Campaign {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  discountPrice: number;
  targetSegment: 'Ev Hanımları' | 'Gençler' | 'Genel';
  messageContent: string;
  deliveryTime: string; // Selected delivery hour, e.g., "16:00 - 18:00 (Akşam yemeği öncesi)"
  status: CampaignStatus;
  createdAt: string;
  approvedAt: string | null;
  sentCount: number;
  logs: string[]; // Delivery logs
}

export interface StockProblem {
  product: SiftahProduct;
  type: 'stok_fazlasi' | 'son_kullanma' | 'ozel_indirim';
  reason: string;
  recommendedDiscount: number; // percentage
}

export interface PublicDiscount {
  id: string;
  productId: string;
  productName: string;
  slug: string;
  originalPrice: number;
  discountPrice: number;
  category: string;
  merchantName: string;
  merchantPhone: string;
  merchantWhatsApp?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  openGraphImage: string;
  views: number;
  shares: number;
  isActive: boolean;
  publishedAt: string;
  publishMode?: 'global' | 'local';
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}
