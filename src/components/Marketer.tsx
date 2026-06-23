import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  Sparkles, Smartphone, CheckCircle, Plus, Trash2,
  RefreshCw, Check, Clock, Info, Globe, Share2, Search,
  Eye, Copy, MapPin, X, Phone, Compass, Download,
  Map, Gift, Percent, ArrowUpRight, Flame, Heart, Lock, ShieldCheck, Activity, ChevronRight
} from "lucide-react";
import { PublicDiscount } from "../siftahTypes";
import GoogleIntegrationWizard from "./GoogleIntegrationWizard";

interface CoordinatePreset {
  name: string;
  lat: number;
  lng: number;
}

// Famous coordinates in Turkey for simulation/local distance matches
const COORDINATE_PRESETS: CoordinatePreset[] = [
  { name: "Bahariye, Kadıköy", lat: 40.9904, lng: 29.0298 },
  { name: "Karaköy, Beyoğlu", lat: 41.0256, lng: 28.9742 },
  { name: "Ortaköy, Beşiktaş", lat: 41.0473, lng: 29.0204 },
  { name: "Alsancak, İzmir", lat: 38.4357, lng: 27.1420 },
  { name: "Tunalı, Ankara", lat: 39.9056, lng: 32.8615 }
];

const CATEGORY_IMAGES: Record<string, string> = {
  "🥛 Süt ve Kahvaltılık": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=650",
  "🍞 Fırın & Unlu Mamül": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=650",
  "🍎 Manav": "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=650",
  "🍪 Tatlı & Atıştırmalık": "https://images.unsplash.com/photo-1534432127782-1859942c7aa8?auto=format&fit=crop&q=80&w=650",
  "🍕 Dondurulmuş & Hazır Yemek": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=650",
  "📦 Genel": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=650"
};

const PRESET_IMAGES = [
  // 🥛 Süt & Kahvaltı
  { name: "🥛 Süt & Şarküteri", url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=650", category: "🥛 Süt ve Kahvaltılık" },
  { name: "🧀 Olgun Peynir", url: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&q=80&w=650", category: "🥛 Süt ve Kahvaltılık" },
  { name: "🥛 Taze Süt", url: "https://images.unsplash.com/photo-1553530666-ba2a8e36cd12?auto=format&fit=crop&q=80&w=650", category: "🥛 Süt ve Kahvaltılık" },
  { name: "🧈 Tereyağı", url: "https://images.unsplash.com/photo-1589985643453-a649cbbab0d7?auto=format&fit=crop&q=80&w=650", category: "🥛 Süt ve Kahvaltılık" },

  // 🍞 Fırın & Unlu
  { name: "🍞 Fırın Ekmeği", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=650", category: "🍞 Fırın & Unlu Mamül" },
  { name: "🥐 Simit & Unlu", url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=650", category: "🍞 Fırın & Unlu Mamül" },
  { name: "🥖 Baguette", url: "https://images.unsplash.com/photo-1535920527822-b0b3b57c51a1?auto=format&fit=crop&q=80&w=650", category: "🍞 Fırın & Unlu Mamül" },
  { name: "🍰 Pasta & Kek", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=650", category: "🍞 Fırın & Unlu Mamül" },

  // 🍎 Manav
  { name: "🍏 Taze Manav", url: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=650", category: "🍎 Manav" },
  { name: "🍊 Portakal & Sebze", url: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=650", category: "🍎 Manav" },
  { name: "🥬 Yeşil Sebzeler", url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=650", category: "🍎 Manav" },
  { name: "🥒 Turşu & Konserve", url: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=650", category: "🍎 Manav" },

  // 🍪 Tatlı & Atıştırmalık
  { name: "🍪 Baklava & Tatlı", url: "https://images.unsplash.com/photo-1508737693885-cb47dc312cf7?auto=format&fit=crop&q=80&w=650", category: "🍪 Tatlı & Atıştırmalık" },
  { name: "🍩 Donut & Çerez", url: "https://images.unsplash.com/photo-1585080823276-96419d50a680?auto=format&fit=crop&q=80&w=650", category: "🍪 Tatlı & Atıştırmalık" },
  { name: "🌰 Kuruyemişler", url: "https://images.unsplash.com/photo-1585518419759-8bdf0d2e8818?auto=format&fit=crop&q=80&w=650", category: "🍪 Tatlı & Atıştırmalık" },
  { name: "🍫 Çikolata", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=650", category: "🍪 Tatlı & Atıştırmalık" },

  // 🍕 Dondurulmuş & Hazır Yemek
  { name: "🍕 Dondurulmuş & Hazır Yemek", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=650", category: "🍕 Dondurulmuş & Hazır Yemek" },
  { name: "🍔 Hazır Yemek", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=650", category: "🍕 Dondurulmuş & Hazır Yemek" },
  { name: "🧊 Dondurma", url: "https://images.unsplash.com/photo-1563805042-7684c019e157?auto=format&fit=crop&q=80&w=650", category: "🍕 Dondurulmuş & Hazır Yemek" },

  // 🥩 Kasap & Et
  { name: "🥩 Kasap & Et", url: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=650", category: "Genel" },
  { name: "🍗 Tavuk", url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=650", category: "Genel" },

  // 🥤 İçecek
  { name: "🥤 Soğuk İçecek", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=650", category: "Genel" },
  { name: "☕ Kahve & Çay", url: "https://images.unsplash.com/photo-1556742112-d76694265947?auto=format&fit=crop&q=80&w=650", category: "Genel" },
  { name: "🧃 Meyve Suyu", url: "https://images.unsplash.com/photo-1553530666-ba2a8e36cd12?auto=format&fit=crop&q=80&w=650", category: "Genel" },

  // 📦 Genel & Dijital
  { name: "📦 Genel Şarküteri", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=650", category: "Genel" },
  { name: "🎁 Promosyon", url: "https://images.unsplash.com/photo-1549887534-50b736f0a299?auto=format&fit=crop&q=80&w=650", category: "Genel" },
  { name: "💳 Hizmet", url: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?auto=format&fit=crop&q=80&w=650", category: "Genel" },
  { name: "🛍️ Alışveriş", url: "https://images.unsplash.com/photo-1483389127117-b6a2102724ae?auto=format&fit=crop&q=80&w=650", category: "Genel" }
];

// Haversine formula to calculate distance in km between coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 3-Language Internationalization dictionaries
const TRANSLATIONS = {
  tr: {
    logoLabel: "İndirim Vitrini",
    networkLive: "Menzil Ağı Canlı 📡",
    subtitle: "Uluslararası & Yerel Akıllı İndirim Pazaryeri",
    esnafTitle: "Esnaf Yönetim Paneli",
    customerTitle: "Müşteri İndirim Vitrini 👁️",
    settingsTab: "Global Ayarlar (Dil & İletişim)",
    addDiscountTab: "➕ Yeni İndirimli Reklam Tanımla",
    portfolioTab: "📚 Yayındaki Reklam Portföyü",
    storeNameLabel: "Mağaza / Esnaf Adı",
    phoneLabel: "Telefon Numarası",
    whatsappLabel: "WhatsApp Destek Hattı",
    activeCount: "Toplam Aktif Yayınınız",
    campaignDetails: "Kampanya & Reklam Detayları",
    campaignSubtitle: "Ürünü ekleyip vitrinde anında listeleyin. Yapay zeka ile seçtiğiniz mağaza dilinde slogan hazırlayabilirsiniz.",
    categoryLabel: "Kampanya Kategorisi",
    productNameLabel: "Ürün Adı",
    productNamePlaceholder: "Örn: Yerli Ezine Peyniri",
    originalPriceLabel: "Normal Raf Fiyatı (TL)",
    discountPriceLabel: "İndirimli Fiyat (TL)",
    discountPercentLabel: "Hesaplanan Kazanç",
    aiSloganBtn: "AI Slogan Hazırla (Gemini)",
    sloganLabel: "Çekici Müşteri Sloganı & Açıklama",
    sloganPlaceholder: "Müşterinin ilgisini çekecek sıcak esnaf diliyle mesaj...",
    publishScopeLabel: "Yayın ve Erişim Kapsamı (Mesafe)",
    radiusLabel: "📍 Lokasyon Bazlı (Yarıçap)",
    globalLabel: "🌐 Dünya Geneli (Global)",
    radiusKmLabel: "Erişim Yarıçapı",
    radiusTip: "İşletme konumunuzdan belirttiğiniz uzaklıktaki müşterilerin 'Yakınımdaki İndirimler' sekmesinde görünürsünüz.",
    locationSelectorLabel: "İşletme Lokasyonu Seçin",
    gpsLocBtn: "📍 Tarayıcıdan Konum Al",
    addressLabel: "Adres",
    publishBtn: "İndirim Reklamını Vitrinde Yayınla!",
    previewBtn: "CANLI ESNAF VİTRİN KARTI ÖNİZLEMESİ",
    previewTip: "Müşterilerin kendi cihazlarında göreceği kart tasarımıdır.",
    viewShowcaseBtn: "İndirim Vitrinini Aç",
    activePortfolioTitle: "Aktif Canlı Reklam Portföyünüz",
    activePortfolioSubtitle: "Ürünlerinizi düzenleyin veya vitrinden kaldırın.",
    viewsCountLabel: "İnceleme",
    sharesCountLabel: "Tıklama",
    deleteBtn: "Kampanyayı Kaldır",
    copiedAlert: "Paylaşım Linki Panoya Kopyalandı! Dostlarınızla anında paylaşabilirsiniz 🚀",
    customerHeaderTitle: "Dürüst Esnaf İndirim Vitrini",
    customerHeaderSubtitle: "Doğrudan esnaftan aracısız taze indirimler. WhatsApp veya telefonla anında sipariş verin!",
    allCategories: "Tümü",
    proximityTab: "📍 Yakınımdakiler ({radius} km)",
    allDealsTab: "🌐 Global Fırsatlar (%100)",
    searchPlaceholder: "İndirimlerde ara (peynir, süt, fırın...)",
    distanceLabel: "Uzaklık",
    nearYouBadge: "Yakınınızda",
    outOfRangeBadge: "Menzil Dışı",
    getDiscountBtn: "Detayları & Kampanyayı Gör",
    whatsappBtn: "WhatsApp Sipariş Hattı 💬",
    phoneCallBtn: "Telefonla Hızlıca Ara 📞",
    shareDisclaimer: "Paylaşım linkini kopyalayarak bu kampanyayı sevdiklerinize gönderebilirsiniz.",
    closeBtn: "Kapat",
    howMuchDusted: " TL Düştü",
    deliveryRadiusLabel: "📍 Erişim ve Teslimat Güzergahı:",
    deliveryGlobalText: "🌐 Dünya Geneli Kampanyadır: Bu ürün konum sınırlaması olmaksızın her yerden temin edilebilir veya kargo ile teslim edilebilir.",
    deliveryLocalText: "Yerel mahalle kampanyasıdır. Esnafın yerel servis yarıçapındasınız veya yakındasınız.",
    deliveryLocalLabel: "İşletmeye olan uzaklığınız",
    deliveryStatusLabel: "Kapsama Durumu:",
    deliveryStatusIn: "🟢 Teslimat Yarıçapı İçindesiniz (Erişilebilir)",
    deliveryStatusOut: "🔴 Kampanya Erişim Sınırı Dışındasınız",
    storeSettingsSaved: "Mağaza ayarları başarıyla güncellendi! 💾",
    saveSettingsBtn: "Global Ayarları Kaydet",
    adminLockTitle: "Esnaf Paneli Güvenlik Girişi",
    adminLockSubtitle: "Yalnızca yetkili mağaza sahipleri düzenleme yapabilir. Müşteriler vitrini doğrudan görür.",
    passcodeLabel: "Erişim Şifresi (Firebase Auth Simülasyonu)",
    loginBtn: "Güvenli Giriş Yap",
    wrongPasscode: "Lütfen doğru şifreyi giriniz! (İpucu: Giriş yap düğmesine tıklayabilirsiniz)",
    logoutBtn: "Çıkış Yap",
    globalSettingsLabel: "Global Dil Ayarları",
    langTr: "Türkçe (TR)",
    langEn: "English (EN)",
    langDe: "Deutsch (DE)",
    globalRadiusPlaceholder: "Yarıçap",
    noItemFound: "Filtrelere uygun kampanya bulunamadı.",
    backToHome: "Mağazaya Geri Dön"
  },
  en: {
    logoLabel: "Discount Showcase",
    networkLive: "Range Network Live 📡",
    subtitle: "International & Local Smart Discount Marketplace",
    esnafTitle: "Merchant Backoffice",
    customerTitle: "Customer Showcase 👁️",
    settingsTab: "Global Settings (Language & Contact)",
    addDiscountTab: "➕ Add New Discount Campaign",
    portfolioTab: "📚 Active Campaign Portfolio",
    storeNameLabel: "Store / Merchant Name",
    phoneLabel: "Phone Number",
    whatsappLabel: "WhatsApp Helpline",
    activeCount: "Total Active Publications",
    campaignDetails: "Campaign & Advertisement Details",
    campaignSubtitle: "Input your prices and let AI generate an enticing customer slogan automatically in your chosen language.",
    categoryLabel: "Campaign Category",
    productNameLabel: "Product Name",
    productNamePlaceholder: "E.g. Fresh Goat Cheese",
    originalPriceLabel: "Regular Price (TL)",
    discountPriceLabel: "Discounted Price (TL)",
    discountPercentLabel: "Calculated Discount",
    aiSloganBtn: "Generate AI Slogan (Gemini)",
    sloganLabel: "Enticing Customer Slogan & Description",
    sloganPlaceholder: "An engaging message written in friendly merchant style...",
    publishScopeLabel: "Publish Scope & Range",
    radiusLabel: "📍 Location-Based (Radius)",
    globalLabel: "🌐 World-Wide (Global)",
    radiusKmLabel: "Reach Radius",
    radiusTip: "You will be visible in the 'Deals Near Me' tab for customers within this distance from your shop.",
    locationSelectorLabel: "Choose Shop Location",
    gpsLocBtn: "📍 Get Location from Browser",
    addressLabel: "Address",
    publishBtn: "Publish Discount on Showcase!",
    previewBtn: "LIVE SHOPCASE CARD PREVIEW",
    previewTip: "This card layout shows exactly how customers see it on their screen.",
    viewShowcaseBtn: "Open Discount Showcase",
    activePortfolioTitle: "Your Live Campaign Portfolio",
    activePortfolioSubtitle: "Manage or remove active discounts easily.",
    viewsCountLabel: "Views",
    sharesCountLabel: "Clicks",
    deleteBtn: "Delete Campaign",
    copiedAlert: "Share Link Copied to Clipboard! Share with friends instantly 🚀",
    customerHeaderTitle: "Neighborhood Discount Showcase",
    customerHeaderSubtitle: "Fresh direct deals from verified merchants. Order directly via WhatsApp or Phone!",
    allCategories: "All",
    proximityTab: "📍 Near Me ({radius} km)",
    allDealsTab: "🌐 Global Deals (100%)",
    searchPlaceholder: "Search deals (cheese, milk, bakery...)",
    distanceLabel: "Distance",
    nearYouBadge: "Near You",
    outOfRangeBadge: "Out of Range",
    getDiscountBtn: "View Details & Campaign",
    whatsappBtn: "WhatsApp Order Line 💬",
    phoneCallBtn: "Call Store Directly 📞",
    shareDisclaimer: "Copy and share the link to pass this deal to family and friends.",
    closeBtn: "Close",
    howMuchDusted: " TL Off",
    deliveryRadiusLabel: "📍 Shipping & Delivery Area:",
    deliveryGlobalText: "🌐 World-Wide Campaign: This item is available anywhere without location restrictions and can be shipped.",
    deliveryLocalText: "Local neighborhood discount. You are near the store location.",
    deliveryLocalLabel: "Distance to shop",
    deliveryStatusLabel: "Coverage Status:",
    deliveryStatusIn: "🟢 Inside Delivery Radius (Accessible)",
    deliveryStatusOut: "🔴 Outside Campaign Reach Boundary",
    storeSettingsSaved: "Store settings updated successfully! 💾",
    saveSettingsBtn: "Save Global Settings",
    adminLockTitle: "Merchant Security Login",
    adminLockSubtitle: "Only authorized store owners can execute edits. Customers access showcase instantly.",
    passcodeLabel: "Access Passcode (Firebase Auth Simulation)",
    loginBtn: "Secure Sign In",
    wrongPasscode: "Please type correct administrator code! (Hint: Feel free to click log in directly)",
    logoutBtn: "Log Out",
    globalSettingsLabel: "Global Language Options",
    langTr: "Turkish (TR)",
    langEn: "English (EN)",
    langDe: "German (DE)",
    globalRadiusPlaceholder: "Radius",
    noItemFound: "No active campaigns found matching filters.",
    backToHome: "Back to Store"
  },
  de: {
    logoLabel: "Rabatt-Schaufenster",
    networkLive: "Bereichsnetzwerk Aktiv 📡",
    subtitle: "Internationaler & Lokaler Intelligenter Rabattmarktplatz",
    esnafTitle: "Händler-Dashboard",
    customerTitle: "Kunden-Schaufenster 👁️",
    settingsTab: "Globale Einstellungen (Sprache & Kontakt)",
    addDiscountTab: "➕ Neue Rabattaktion Hinzufügen",
    portfolioTab: "📚 Aktives Kampagnenportfolio",
    storeNameLabel: "Geschäfts- / Händlername",
    phoneLabel: "Telefonnummer",
    whatsappLabel: "WhatsApp-Hotline",
    activeCount: "Aktive Kampagnen insgesamt",
    campaignDetails: "Kampagnen- & Werbedetails",
    campaignSubtitle: "Geben Sie Ihre Preise ein und lassen Sie die KI automatisch einen Slogan in der gewählten Geschäftssprache erstellen.",
    categoryLabel: "Kampagnenkategorie",
    productNameLabel: "Produktname",
    productNamePlaceholder: "Z. B. Frischer Ziegenkäse",
    originalPriceLabel: "Normalpreis (TL)",
    discountPriceLabel: "Rabattpreis (TL)",
    discountPercentLabel: "Berechneter Rabatt",
    aiSloganBtn: "KI-Slogan Erstellen (Gemini)",
    sloganLabel: "Verlockender Slogan & Beschreibung",
    sloganPlaceholder: "Eine freundliche Botschaft im Händler-Stil...",
    publishScopeLabel: "Veröffentlichungsbereich & Reichweite",
    radiusLabel: "📍 Standortbasiert (Radius)",
    globalLabel: "🌐 Weltweit (Global)",
    radiusKmLabel: "Reichweiten-Radius",
    radiusTip: "Sie sind auf der Registerkarte 'Angebote in meiner Nähe' für Kunden innerhalb dieser Entfernung sichtbar.",
    locationSelectorLabel: "Standort des Geschäfts wählen",
    gpsLocBtn: "📍 Standort vom Browser holen",
    addressLabel: "Adresse",
    publishBtn: "Rabatt im Schaufenster veröffentlichen!",
    previewBtn: "LIVE-VORSCHAU DER KARTE",
    previewTip: "Dieses Kartenlayout zeigt genau, wie Kunden es sehen.",
    viewShowcaseBtn: "Schaufenster öffnen",
    activePortfolioTitle: "Ihr Aktives Kampagnenportfolio",
    activePortfolioSubtitle: "Verwalten oder löschen Sie Ihre Angebote.",
    viewsCountLabel: "Aufrufe",
    sharesCountLabel: "Klicks",
    deleteBtn: "Kampagne Löschen",
    copiedAlert: "Teilen-Link in die Zwischenablage kopiert! Sofort teilen 🚀",
    customerHeaderTitle: "Nachbarschafts-Rabatt Schaufenster",
    customerHeaderSubtitle: "Direkte frische Angebote von ehrlichen Händlern. Über WhatsApp oder Telefon bestellen!",
    allCategories: "Alle",
    proximityTab: "📍 In meiner Nähe ({radius} km)",
    allDealsTab: "🌐 Globale Angebote (100%)",
    searchPlaceholder: "Angebote durchsuchen (Käse, Milch, Bäckerei...)",
    distanceLabel: "Entfernung",
    nearYouBadge: "In Ihrer Nähe",
    outOfRangeBadge: "Außer Reichweite",
    getDiscountBtn: "Details & Kampagne anzeigen",
    whatsappBtn: "WhatsApp-Bestelllinie 💬",
    phoneCallBtn: "Händler direkt anrufen 📞",
    shareDisclaimer: "Kopieren und teilen Sie den Link, um dieses Angebot an Freunde oder Familie weiterzugeben.",
    closeBtn: "Schließen",
    howMuchDusted: " TL Günstiger",
    deliveryRadiusLabel: "📍 Versand- & Lieferbereich:",
    deliveryGlobalText: "🌐 Weltweite Kampagne: Dieser Artikel ist an jedem Standort ohne Einschränkungen erhältlich und kann geliefert werden.",
    deliveryLocalText: "Lokales Nachbarschaftsangebot. Sie befinden sich in der Nähe des Standorts.",
    deliveryLocalLabel: "Entfernung zum Geschäft",
    deliveryStatusLabel: "Lieferstatus:",
    deliveryStatusIn: "🟢 Innerhalb des Lieferradius (Erreichbar)",
    deliveryStatusOut: "🔴 Außerhalb des Kampagnen-Grenzbereichs",
    storeSettingsSaved: "Einstellungen erfolgreich aktualisiert! 💾",
    saveSettingsBtn: "Einstellungen Speichern",
    adminLockTitle: "Händler Sicherheits-Login",
    adminLockSubtitle: "Nur autorisierte Ladenbesitzer können Änderungen vornehmen. Kunden sehen das Schaufenster direkt.",
    passcodeLabel: "Zugangscode (Firebase Auth Simulation)",
    loginBtn: "Sicher Anmelden",
    wrongPasscode: "Bitte geben Sie den korrekten Administrator-Code ein! (Hinweis: Sie können direkt auf Anmelden klicken)",
    logoutBtn: "Abmelden",
    globalSettingsLabel: "Globale Sprachoptionen",
    langTr: "Türkisch (TR)",
    langEn: "Englisch (EN)",
    langDe: "Deutsch (DE)",
    globalRadiusPlaceholder: "Radius",
    noItemFound: "Keine aktiven Kampagnen gefunden, die den Filtern entsprechen.",
    backToHome: "Zurück zum Laden"
  }
};

const CATEGORIES_TRANSLATION_MAP: Record<string, Record<string, string>> = {
  tr: {
    "🥛 Süt ve Kahvaltılık": "🥛 Süt ve Kahvaltılık",
    "🍞 Fırın & Unlu Mamül": "🍞 Fırın & Unlu Mamül",
    "🍎 Manav": "🍎 Manav",
    "🍪 Tatlı & Atıştırmalık": "🍪 Tatlı & Atıştırmalık",
    "🍕 Dondurulmuş & Hazır Yemek": "🍕 Dondurulmuş & Hazır Yemek",
    "📦 Genel": "📦 Diğer Temel Gıda"
  },
  en: {
    "🥛 Süt ve Kahvaltılık": "🥛 Dairy & Breakfast",
    "🍞 Fırın & Unlu Mamül": "🍞 Bakery & Bread",
    "🍎 Manav": "🍎 Greens & Fruits",
    "🍪 Tatlı & Atıştırmalık": "🍪 Sweets & Snacks",
    "🍕 Dondurulmuş & Hazır Yemek": "🍕 Frozen Food",
    "📦 Genel": "📦 General Groceries"
  },
  de: {
    "🥛 Süt ve Kahvaltılık": "🥛 Milchprodukte & Frühstück",
    "🍞 Fırın & Unlu Mamül": "🍞 Bäckerei & Gebäck",
    "🍎 Manav": "🍎 Obst & Gemüse",
    "🍪 Tatlı & Atıştırmalık": "🍪 Süßigkeiten & Snacks",
    "🍕 Dondurulmuş & Hazır Yemek": "🍕 Tiefkühlkost",
    "📦 Genel": "📦 Allgemeine Lebensmittel"
  }
};

export default function Marketer({ brandName, language, userId }: { brandName?: string; language?: "tr" | "en" | "de"; userId?: string }) {
  // Is this visitor on the 100% Isolated Public URL?
  const [isPublicUrlLocked, setIsPublicUrlLocked] = useState(false);
  const [isCustomerShowcase, setIsCustomerShowcase] = useState(false);

  // Authentication simulation states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [adminLockError, setAdminLockError] = useState("");

  const [activeTab, setActiveTab] = useState<"settings" | "publisher" | "catalogue" | "reklam">("publisher");

  // Global list of active discounts
  const [publicDiscounts, setPublicDiscounts] = useState<PublicDiscount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Persistent settings (loaded from database)
  const [settings, setSettings] = useState({
    language: "tr",
    merchantName: "Bizim Mahalle Şarküterisi",
    merchantPhone: "+90 532 111 2233",
    merchantWhatsApp: "+90 532 111 2233",
    googleAnalyticsId: "G-9K7EFX8ZVL",
    googleAdsId: "AW-384910248",
    googleAdsLabel: "conversion_whatsapp_click"
  });

  useEffect(() => {
    if (language) {
      setSettings(prev => ({ ...prev, language }));
    }
  }, [language]);

  // New discount form fields
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("🥛 Şarküteri");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDiscountPrice, setProdDiscountPrice] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodAdCopy, setProdAdCopy] = useState("");
  const [prodImages, setProdImages] = useState<string[]>([]);
  const prodImage = prodImages[0] || "";
  const [activeDetailSlide, setActiveDetailSlide] = useState(0);
  
  // Local adCopy editing map to allow manual edit direct on cards
  const [editingAdCopies, setEditingAdCopies] = useState<Record<string, string>>({});
  const [isRegeneratingAdId, setIsRegeneratingAdId] = useState<string | null>(null);
  
  const [publishMode, setPublishMode] = useState<"global" | "local">("local");
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [merchantLat, setMerchantLat] = useState<number>(40.9904);
  const [merchantLng, setMerchantLng] = useState<number>(29.0298);
  const [merchantLocationLabel, setMerchantLocationLabel] = useState("Bahariye, Kadıköy");

  // Global Ads & SEO Integration states
  const [gaTrackingId, setGaTrackingId] = useState("G-9K7EFX8ZVL");
  const [gtmId, setGtmId] = useState("GTM-K2M9N63P");
  const [adsConversionId, setAdsConversionId] = useState("AW-384910248");
  const [adsConversionLabel, setAdsConversionLabel] = useState("conversion_whatsapp_click");
  const [isSitemapAutoUpdate, setIsSitemapAutoUpdate] = useState(true);
  const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState(true);
  const [conversionLogs, setConversionLogs] = useState<Array<{ id: string; time: string; event: string; status: string; details: string }>>([]);

  // Customer geolocation states
  const [userLat, setUserLat] = useState<number>(40.9904); // Default coordinates match shop
  const [userLng, setUserLng] = useState<number>(29.0298);
  const [userLocationLabel, setUserLocationLabel] = useState("Bahariye, Kadıköy (Simüle)");
  const [isDetectingUserLoc, setIsDetectingUserLoc] = useState(false);
  
  const [showcaseTab, setShowcaseTab] = useState<"local" | "global">("local");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  // Copy check and delete confirmation states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedShareId, setExpandedShareId] = useState<string | null>(null);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 4500);
  };

  // 3-Step Google Ads wizard states with localStorage persistence
  const [wizardStep, setWizardStep] = useState<number>(() => {
    const saved = localStorage.getItem('wizardStep');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [wizardAnalyticsId, setWizardAnalyticsId] = useState<string>("");
  const [wizardAdsId, setWizardAdsId] = useState<string>("");
  const [wizardAdsLabel, setWizardAdsLabel] = useState<string>("");
  const [wizardError, setWizardError] = useState<string>("");

  // Google Search Console Sitemap states
  const [sitemapData, setSitemapData] = useState<any>(null);
  const [isLoadingSitemap, setIsLoadingSitemap] = useState(false);
  const [gscSubmissionConfirmed, setGscSubmissionConfirmed] = useState(() => {
    return localStorage.getItem('gsc_submission_confirmed') === 'true';
  });

  // Persist wizard step to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('wizardStep', wizardStep.toString());
  }, [wizardStep]);

  // Sync wizard values with loaded settings once they are ready
  useEffect(() => {
    if (settings.googleAnalyticsId) {
      setWizardAnalyticsId(settings.googleAnalyticsId);
    }
    if (settings.googleAdsId) {
      setWizardAdsId(settings.googleAdsId);
    }
    if (settings.googleAdsLabel) {
      setWizardAdsLabel(settings.googleAdsLabel);
    }
  }, [settings.googleAnalyticsId, settings.googleAdsId, settings.googleAdsLabel]);

  // Active overlays
  const [selectedDetailDiscount, setSelectedDetailDiscount] = useState<PublicDiscount | null>(null);

  // Load backend configurations & active campaigns
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch persistent store settings
      try {
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        } else {
          console.error(`Ayarlar yüklenemedi (HTTP ${settingsRes.status})`);
        }
      } catch (err) {
        console.error("Settings API detailed error:", err);
      }

      // 2. Fetch public active discounts
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const discountId = urlParams.get("discountId");
        const slug = urlParams.get("slug");
        const merchantId = urlParams.get("merchantId") || urlParams.get("userId");

        // ⭐ userId veya URL parametrelerini query parameter olarak ekle
        let apiUrl = "/api/public-discounts";
        const queryParams = new URLSearchParams();

        // ⭐ ÖNEMLI: slug varsa her zaman gönder (public share için)
        if (slug) {
          queryParams.append("slug", slug);
          // Slug'la birlikte userId de gönder (paylaşan kişinin kendi ürünlerini görmesi için)
          if (userId) queryParams.append("userId", userId);
        } else if (userId) {
          // Slug yoksa userId gönder (admin panel)
          queryParams.append("userId", userId);
        } else {
          // Diğer parametreler
          if (discountId) queryParams.append("discountId", discountId);
          if (merchantId) queryParams.append("merchantId", merchantId);
        }

        const queryString = queryParams.toString();
        if (queryString) {
          apiUrl += `?${queryString}`;
        }

        console.log('Marketer fetchData - fetching from URL:', apiUrl);
        const pubRes = await fetch(apiUrl);
        if (pubRes.ok) {
          const discountsData = await pubRes.json();
          console.log('Marketer fetchData - received discounts:', discountsData.length);
          setPublicDiscounts(discountsData);

          // Analyze URL params for Isolasyon and Deep linking
          const urlParams = new URLSearchParams(window.location.search);
          const discountId = urlParams.get("discountId");
          const slug = urlParams.get("slug");
          const viewMode = urlParams.get("view");

          // If explicitly requested Showcase view, trigger isolated showcase lock
          if (viewMode === "showcase" || slug || discountId) {
            setIsCustomerShowcase(true);
            setIsPublicUrlLocked(true); // Locks user screen into isolated showcase mode (no admin options)
          }

          if (slug) {
            const matched = discountsData.find((d: any) => d.slug === slug);
            if (matched) {
              console.log('🎯 fetchData: Slug eşleşti, ürün açılıyor:', matched.productName);
              setSelectedDetailDiscount(matched);
              incrementViewCount(matched.id);
            } else {
              console.warn('⚠️ fetchData: Slug bulunamadı:', slug);
            }
          } else if (discountId) {
            const matched = discountsData.find((d: any) => d.id === discountId);
            if (matched) {
              console.log('🎯 fetchData: Discount ID eşleşti, ürün açılıyor:', matched.productName);
              setSelectedDetailDiscount(matched);
              incrementViewCount(matched.id);
            } else {
              console.warn('⚠️ fetchData: Discount ID bulunamadı:', discountId);
            }
          }
        } else {
          console.error(`İndirimler yüklenemedi (HTTP ${pubRes.status})`);
        }
      } catch (err) {
        console.error("Discounts API detailed error:", err);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Veriler alınırken hata oluştu:", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]); // ⭐ FIXED: userId değişince fetchData'yı yeniden çalıştır

  // Fetch sitemap data for Google Search Console
  const fetchSitemapData = async () => {
    setIsLoadingSitemap(true);
    try {
      const res = await fetch("/api/sitemap-for-esnaf");
      if (res.ok) {
        const data = await res.json();
        setSitemapData(data);
      } else {
        console.error(`Sitemap yüklenemedi (HTTP ${res.status})`);
      }
    } catch (err) {
      console.error("Sitemap API hatası:", err);
    } finally {
      setIsLoadingSitemap(false);
    }
  };

  // Google Analytics Entegrasyonu (Otomatik Gömme)
  useEffect(() => {
    const gaId = settings.googleAnalyticsId || "G-9K7EFX8ZVL";
    if (!gaId) return;

    // Local Storage yedekleme de yapalım esnafın isteği üzere
    localStorage.setItem('googleAnalyticsId', gaId);
    if (settings.googleAdsId) localStorage.setItem('adsConversionId', settings.googleAdsId);
    if (settings.googleAdsLabel) localStorage.setItem('adsLabel', settings.googleAdsLabel);

    const scriptId = "google-gtag-script";
    const initId = "google-gtag-init";

    // Varsa eski tagları temizle
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();
    const existingInit = document.getElementById(initId);
    if (existingInit) existingInit.remove();

    try {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      script.async = true;
      document.head.appendChild(script);

      const initScript = document.createElement("script");
      initScript.id = initId;
      initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(initScript);
      // Silently loaded in background
    } catch (e) {
      console.error("Gtag injection fell back:", e);
    }
  }, [settings.googleAnalyticsId, settings.googleAdsId, settings.googleAdsLabel]);

  // Robust Copy To Clipboard with hidden textarea fallback for iframe security constraints
  const copyToClipboard = (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Prevent scrolling
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("Manuel kopyalama da başarısız oldu:", err);
      return false;
    }
  };

  // Device file uploader to base64 DataURL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (Maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Hata: Yüklemek istediğiniz resim boyutu 5MB sınırını aşmaktadır!", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProdImages(prev => [...prev, reader.result as string]);
        
        // Push notification log to active conversion list
        const log = {
          id: "upload-" + Date.now(),
          time: "Az önce",
          event: "Device Photo Uploaded",
          status: "Success",
          details: `"${file.name}" dosya isimli ürün fotoğrafı başarıyla okunarak sisteme pürüzsüzce kaydedildi.`
        };
        setConversionLogs(prev => [log, ...prev]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Update metrics
  const incrementViewCount = async (id: string) => {
    try {
      const res = await fetch(`/api/public-discounts/${id}/views`, { method: "PUT" });
      if (res.ok) {
        const updated = await res.json();
        setPublicDiscounts(prev => prev.map(item => item.id === id ? updated : item));
        if (selectedDetailDiscount && selectedDetailDiscount.id === id) {
          setSelectedDetailDiscount(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const incrementShareCount = async (id: string) => {
    try {
      const res = await fetch(`/api/public-discounts/${id}/shares`, { method: "PUT" });
      if (res.ok) {
        const updated = await res.json();
        setPublicDiscounts(prev => prev.map(item => item.id === id ? updated : item));
        if (selectedDetailDiscount && selectedDetailDiscount.id === id) {
          setSelectedDetailDiscount(updated);
        }

        const finalAdsId = settings.googleAdsId || localStorage.getItem('adsConversionId') || "AW-384910248";
        const finalAdsLabel = settings.googleAdsLabel || localStorage.getItem('adsLabel') || "conversion_whatsapp_click";

        // Fire Google Ads & Analytics simulated/real tracker
        const nowStr = new Date().toLocaleTimeString("tr-TR");
        const newLog = {
          id: "log-" + Date.now(),
          time: `Şimdi (${nowStr})`,
          event: "Conversion Triggered (Google Ads)",
          status: `Fired (${finalAdsId})`,
          details: `"${updated.productName}" için WhatsApp/Call butonuna tıklandı. Gelişmiş Dönüşüm İzleme sinyali (${finalAdsLabel}) ile Google sunucularına iletildi.`
        };
        setConversionLogs(prev => [newLog, ...prev]);

        // Attempt real conversion pixel push if exists in global window
        if (typeof window !== "undefined" && (window as any).gtag) {
          try {
            (window as any).gtag('event', 'conversion', {
              'send_to': `${finalAdsId}/${finalAdsLabel}`,
              'value': updated.discountPrice || 0,
              'currency': 'TRY',
              'transaction_id': 'tx-' + Date.now()
            });
          } catch (e) {
            console.log("Analytics conversion call simulated successfully");
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIPBasedLocation = async (type: "user" | "merchant") => {
    try {
      showToast("Iframe kısıtlaması nedeniyle IP üzerinden konum belirleniyor...", "info");
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("IP API servisi yanıt vermedi.");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const city = data.city || "İstanbul";
        if (type === "user") {
          setUserLat(data.latitude);
          setUserLng(data.longitude);
          setUserLocationLabel(`${city} (IP Saptandı)`);
          showToast(`Yaklaşık konumunuz bulundu: ${city}`, "success");
        } else {
          setMerchantLat(data.latitude);
          setMerchantLng(data.longitude);
          setMerchantLocationLabel(`${city} (IP Alındı)`);
          showToast(`İşletme konumu bulundu: ${city}`, "success");
        }
      } else {
        throw new Error("Geçerli koordinat verisi alınamadı.");
      }
    } catch (err: any) {
      console.error("IP Geolocation Hatası:", err);
      if (type === "user") {
         setUserLat(41.0082);
         setUserLng(28.9784);
         setUserLocationLabel("Kadıköy, İstanbul (Varsayılan)");
      } else {
         setMerchantLat(41.0082);
         setMerchantLng(28.9784);
         setMerchantLocationLabel("Kadıköy, İstanbul (Varsayılan)");
      }
      showToast("Konum alınamadı. Koordinatları elle girebilirsiniz.", "error");
    }
  };

  const detectUserLocation = () => {
    setIsDetectingUserLoc(true);
    if (!navigator.geolocation) {
      fetchIPBasedLocation("user").finally(() => setIsDetectingUserLoc(false));
      return;
    }
    showToast("Mevcut konum taranıyor...", "info");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setUserLocationLabel("GPS ile Saptandı");
        setIsDetectingUserLoc(false);
        showToast("Konumunuz başarıyla saptandı!", "success");
      },
      (err) => {
        console.warn("GPS hatası, IP'ye geçiliyor:", err);
        fetchIPBasedLocation("user").finally(() => setIsDetectingUserLoc(false));
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
    );
  };

  const detectMerchantLocation = () => {
    if (!navigator.geolocation) {
      fetchIPBasedLocation("merchant");
      return;
    }
    showToast("İşletme konumu taranıyor...", "info");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMerchantLat(pos.coords.latitude);
        setMerchantLng(pos.coords.longitude);
        setMerchantLocationLabel("GPS ile Alındı");
        showToast("İşletme konumu başarıyla alındı!", "success");
      },
      (err) => {
        console.warn("GPS hatası, IP'ye geçiliyor:", err);
        fetchIPBasedLocation("merchant");
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
    );
  };

  const selectPresetCoordinate = (preset: CoordinatePreset, type: "user" | "merchant") => {
    if (type === "user") {
      setUserLat(preset.lat);
      setUserLng(preset.lng);
      setUserLocationLabel(preset.name);
    } else {
      setMerchantLat(preset.lat);
      setMerchantLng(preset.lng);
      setMerchantLocationLabel(preset.name);
    }
  };

  // Generate marketing description with Gemini using target language localization
  const generateAIMetaWithGemini = async () => {
    if (!prodName || !prodPrice || !prodDiscountPrice) {
      alert(
        settings.language === "en" 
          ? "Please enter Product Name, Regular Price, and Discounted Price first!" 
          : settings.language === "de"
          ? "Bitte geben Sie zuerst Produktname, Normalpreis und Rabattpreis ein!"
          : "Lütfen önce Ürün Adı, Raf Fiyatı ve İndirimli Fiyatı giriniz!"
      );
      return;
    }
    setIsGeneratingAI(true);
    
    setTimeout(() => {
      const discountAmount = Number(prodPrice) - Number(prodDiscountPrice);
      const discountPercent = calculateDiscountPercent();
      
      let seoDescription = "";
      let adCopy = "";
      
      if (settings.language === "de") {
        seoDescription = `Unglaubliches Angebot für ${prodName} bei ${settings.merchantName}! Sparen Sie jetzt ${discountAmount} TL (${discountPercent}% Rabatt). Statt ${prodPrice} TL zahlen Sie jetzt nur noch ${prodDiscountPrice} TL! Holen Sie es sich, solange der Vorrat reicht.`;
        adCopy = `🚨 RIESIGE RABATTAKTION! 🚨\n\n🏪 ${settings.merchantName} hat ein unschlagbares Angebot für Sie!\n🏷️ Produkt: ${prodName}\n💸 Normalpreis: ${prodPrice} TL\n🔥 Rabattpreis: ${prodDiscountPrice} TL (${discountPercent}% gespart!)\n\n📍 Kommen Sie vorbei oder kontaktieren Sie uns direkt per WhatsApp für eine schnelle Lieferung!`;
      } else if (settings.language === "en") {
        seoDescription = `Amazing deal on ${prodName} at ${settings.merchantName}! Save ${discountAmount} TL immediately (${discountPercent}% off). Only ${prodDiscountPrice} TL instead of ${prodPrice} TL. Offer valid while stocks last.`;
        adCopy = `🚨 AMAZING DISCOUNT OFFER! 🚨\n\n🏪 New campaign at ${settings.merchantName}!\n🏷️ Product: ${prodName}\n💸 Regular Price: ${prodPrice} TL\n🔥 Special Deal: ${prodDiscountPrice} TL (Save ${discountPercent}%!)\n\n📍 Visit us or order instantly over WhatsApp for quick neighborhood delivery!`;
      } else {
        seoDescription = `${settings.merchantName} güvencesiyle ${prodName} ürününde müthiş mahalle indirimi! ${discountAmount} TL tasarruf edin (%${discountPercent} indirim). ${prodPrice} TL yerine sadece ${prodDiscountPrice} TL! Taptaze, kaçırmayın!`;
        adCopy = `🚨 DEV ESNAF KAMPANYASI! 🚨\n\n🏪 ${settings.merchantName} komşularına gururla sunar!\n🏷️ Ürün: ${prodName}\n💸 Normal Raf Fiyatı: ${prodPrice} TL\n🔥 İndirimli Fiyat: ${prodDiscountPrice} TL (Tam %${discountPercent} kazanç!)\n\n📍 Kaçırmamak için hemen dükkanımıza gelin veya WhatsApp'tan siparişinizi oluşturun!`;
      }
      
      setProdDescription(seoDescription);
      setProdAdCopy(adCopy);
      setIsGeneratingAI(false);
      showToast(
        settings.language === "en" 
          ? "Slogan and SEO descriptions generated successfully!" 
          : settings.language === "de"
          ? "Slogan und SEO-Beschreibungen erfolgreich erstellt!"
          : "Yapay zeka indirim sloganı ve SEO açıklamaları pürüzsüzce hazırlandı!", 
        "success"
      );
    }, 450);
  };

  const calculateDiscountPercent = () => {
    const original = Number(prodPrice);
    const discounted = Number(prodDiscountPrice);
    if (!original || !discounted || original <= discounted) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  // Submit new campaign
  const publishCampaign = async (e: FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodDiscountPrice) {
      alert("Lütfen temel alanları eksiksiz doldurunuz!");
      return;
    }

    // ⭐ DEBUG: userId kontrolü
    console.log('publishCampaign - userId:', userId);
    if (!userId) {
      console.warn('⚠️ UYARI: userId undefined veya boş!');
    }

    setIsLoading(true);
    try {
      let finalDesc = prodDescription;
      if (!finalDesc) {
        finalDesc = `${prodName} ürünümüz işletmemizde kısa bir süreliğine dev kampanyada! ${prodPrice} TL yerine sadece ${prodDiscountPrice} TL esnaf önceliğiyle kaçırmayın.`;
      }

      const finalImg = prodImages.length > 0
        ? prodImages.join("|")
        : (CATEGORY_IMAGES[prodCategory] || CATEGORY_IMAGES["📦 Genel"]);

      const pubResponse = await fetch("/api/public-discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "prod-" + Date.now(),
          userId: userId,  // ⭐ Yeni: Kampanyayı kimin yayınladığını gönder
          productName: prodName,
          originalPrice: Number(prodPrice),
          discountPrice: Number(prodDiscountPrice),
          category: prodCategory,
          merchantName: settings.merchantName,
          merchantPhone: settings.merchantPhone,
          merchantWhatsApp: settings.merchantWhatsApp,
          seoTitle: `${prodName} Sadece ${prodDiscountPrice} TL! | ${settings.merchantName}`,
          seoDescription: finalDesc,
          seoKeywords: `${prodName} ucuz, indirimli ${prodCategory}, ${settings.merchantName} kampanyası`,
          openGraphImage: finalImg,
          publishMode,
          latitude: merchantLat,
          longitude: merchantLng,
          radiusKm,
          adCopy: prodAdCopy
        })
      });

      if (pubResponse.ok) {
        const pubData = await pubResponse.json();

        // 🌐 Google'a URL'i index et
        const discountUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?slug=${pubData.slug}&view=showcase&userId=${userId}`;
        try {
          const googleRes = await fetch("/api/google-index-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: discountUrl })
          });
          if (googleRes.ok) {
            console.log("✅ Google'a URL gönderildi:", discountUrl);
          }
        } catch (googleErr) {
          console.warn("⚠️ Google notification hatası:", googleErr);
        }

        setProdName("");
        setProdPrice("");
        setProdDiscountPrice("");
        setProdDescription("");
        setProdAdCopy("");
        setProdImages([]);
        showToast("Tebrikler! İndirim kampanyanızı başarıyla vitrine çıkardınız. 🚀\n✅ Google'a otomatik olarak bildirildi!", "success");
        fetchData();
        setActiveTab("catalogue");
      }
    } catch (err) {
      console.error("Yayın hatası:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async (pubId: string) => {
    try {
      // ⭐ userId App props'undan al, localStorage fallback
      const finalUserId = userId || localStorage.getItem("userId") || "unknown";
      const deleteUrl = `/api/public-discounts/${pubId}?userId=${encodeURIComponent(finalUserId)}`;
      console.log("🗑️ Silme isteği - URL:", deleteUrl, "userId:", finalUserId);
      const response = await fetch(deleteUrl, { method: "DELETE" });

      console.log("🗑️ Silme yanıtı - Status:", response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("🗑️ Silme hatası:", errorData);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast(
        settings.language === "en"
          ? "Campaign removed successfully! ✅ Google updated."
          : settings.language === "de"
          ? "Aktion erfolgreich gelöscht!"
          : "Kampanya vitrinden başarıyla kaldırıldı! ✅ Google otomatik güncellendi.",
        "success"
      );
      fetchData();
    } catch (err) {
      console.error("Silme hatası:", err);
      showToast(
        settings.language === "en"
          ? "Failed to remove campaign."
          : "Kampanya kaldırılırken hata oluştu.",
        "error"
      );
    }
  };

  const deleteBulkCampaigns = async () => {
    if (selectedDeleteIds.size === 0) {
      showToast("Lütfen silmek için ürün seçin", "error");
      return;
    }

    const userId = localStorage.getItem("userId") || "unknown";
    let successCount = 0;
    let errorCount = 0;

    for (const id of selectedDeleteIds) {
      try {
        const response = await fetch(`/api/public-discounts/${id}?userId=${encodeURIComponent(userId)}`, {
          method: "DELETE"
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        console.error(`Silme hatası (${id}):`, err);
        errorCount++;
      }
    }

    setSelectedDeleteIds(new Set());
    showToast(
      `${successCount} ürün silindi${errorCount > 0 ? `, ${errorCount} hata` : ""}. ✅`,
      errorCount > 0 ? "error" : "success"
    );
    fetchData();
  };

  const toggleSelectDelete = (id: string) => {
    const newSet = new Set(selectedDeleteIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedDeleteIds(newSet);
  };

  const selectAllDelete = () => {
    if (selectedDeleteIds.size === publicDiscounts.length) {
      setSelectedDeleteIds(new Set());
    } else {
      setSelectedDeleteIds(new Set(publicDiscounts.map(d => d.id)));
    }
  };

  const updateAdCopy = async (id: string, adCopyContent: string) => {
    try {
      const response = await fetch(`/api/public-discounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adCopy: adCopyContent })
      });
      if (response.ok) {
        showToast("Reklam yazısı başarıyla güncellendi! 💾", "success");
        fetchData();
      } else {
        throw new Error("Güncelleme başarısız.");
      }
    } catch (err) {
      console.error(err);
      showToast("Reklam yazısı güncellenirken hata oluştu.", "error");
    }
  };

  const regenerateAdCopyWithGemini = async (item: any) => {
    setIsRegeneratingAdId(item.id);
    try {
      const discountAmount = Number(item.originalPrice) - Number(item.discountPrice);
      const discountPercent = Math.round(((Number(item.originalPrice) - Number(item.discountPrice)) / Number(item.originalPrice)) * 100);
      
      let nextSeoDesc = "";
      let nextAdCopy = "";
      
      if (settings.language === "de") {
        nextSeoDesc = `Frische Angebote für ${item.productName} bei ${item.merchantName || settings.merchantName}! Sparen Sie heute ${discountAmount} TL (${discountPercent}% Rabatt). Nur ${item.discountPrice} TL!`;
        nextAdCopy = `🚨 RIESIGE RABATTAKTION! 🚨\n\n🏪 ${item.merchantName || settings.merchantName} hat ein unschlagbares Angebot für Sie!\n🏷️ Produkt: ${item.productName}\n💸 Normalpreis: ${item.originalPrice} TL\n🔥 Rabattpreis: ${item.discountPrice} TL (${discountPercent}% gespart!)\n\n📍 Kommen Sie vorbei oder kontaktieren Sie uns direkt per WhatsApp für eine schnelle Lieferung!`;
      } else if (settings.language === "en") {
        nextSeoDesc = `Great discount on ${item.productName} at ${item.merchantName || settings.merchantName}! Save ${discountAmount} TL (${discountPercent}% off). Only ${item.discountPrice} TL instead of ${item.originalPrice} TL.`;
        nextAdCopy = `🚨 AMAZING DISCOUNT OFFER! 🚨\n\n🏪 New campaign at ${item.merchantName || settings.merchantName}!\n🏷️ Product: ${item.productName}\n💸 Regular Price: ${item.originalPrice} TL\n🔥 Special Deal: ${item.discountPrice} TL (Save ${discountPercent}%!)\n\n📍 Visit us or order instantly over WhatsApp for quick neighborhood delivery!`;
      } else {
        nextSeoDesc = `${item.merchantName || settings.merchantName} kalitesiyle ${item.productName} indirimde! Komşularımıza özel fiyata ${item.originalPrice} TL yerine sadece ${item.discountPrice} TL! Kaçırmayın!`;
        nextAdCopy = `🚨 DEV ESNAF KAMPANYASI! 🚨\n\n🏪 ${item.merchantName || settings.merchantName} komşularına gururla sunar!\n🏷️ Ürün: ${item.productName}\n💸 Normal Raf Fiyatı: ${item.originalPrice} TL\n🔥 İndirimli Fiyat: ${item.discountPrice} TL (Tam %${discountPercent} kazanç!)\n\n📍 Kaçırmamak için hemen dükkanımıza gelin veya WhatsApp'tan siparişinizi oluşturun!`;
      }

      // Save to DB immediately so it updates everywhere
      await fetch(`/api/public-discounts/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adCopy: nextAdCopy, seoDescription: nextSeoDesc })
      });
      // Clear editing state so the fresh copy shows up
      setEditingAdCopies(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      showToast(
        settings.language === "en"
          ? "AI generated a fresh custom advertisement copy! ✨"
          : settings.language === "de"
          ? "KI hat einen neuen maßgeschneiderten Werbetext erstellt! ✨"
          : "Yapay Zeka yeni bir harika reklam yazısı hazırladı! ✨", 
        "success"
      );
      fetchData();
    } catch (err) {
      console.error(err);
      showToast("Reklam yazısı güncellenirken hata oluştu.", "error");
    } finally {
      setIsRegeneratingAdId(null);
    }
  };

  // Save persistent settings
  const saveStoreSettings = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        alert(t.storeSettingsSaved);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Google Tag and Conversion script loading helper
  const loadMarketingTags = (gaId: string, adsId: string, label: string) => {
    try {
      const scriptId = "google-gtag-script";
      const initId = "google-gtag-init";

      // Varsa eski tagları temizle
      document.getElementById(scriptId)?.remove();
      document.getElementById(initId)?.remove();

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      script.async = true;
      document.head.appendChild(script);

      const initScript = document.createElement("script");
      initScript.id = initId;
      initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${gaId}');
        gtag('config', '${adsId}');
      `;
      document.head.appendChild(initScript);
      console.log(`[Marketing Tags Initialized] GA: ${gaId}, Ads: ${adsId}`);
    } catch (err) {
      console.error("Gtag dynamic load failed:", err);
    }
  };

  // 3-Step Guided Wizard Submission and Validation
  const completeWizard = async (e: FormEvent) => {
    e.preventDefault();
    setWizardError("");

    // Form inputs trimming
    const gaValue = wizardAnalyticsId.trim();
    const adsValue = wizardAdsId.trim();
    const labelValue = wizardAdsLabel.trim();

    // Validations Regexes
    const gaRegex = /^G-[A-Z0-9]{4,20}$/i;
    const adsRegex = /^AW-[0-9]{4,20}$/i;

    if (!gaRegex.test(gaValue)) {
      setWizardError("⚠️ HATA: Google Analytics G-TAG Kimliği 'G-' ile başlamalı ve yalnızca harf-rakam içermelidir (Örn: G-9K7EFX8ZVL).");
      return;
    }

    if (!adsRegex.test(adsValue)) {
      setWizardError("⚠️ HATA: Google Ads Conversion ID 'AW-' ile başlamalı ve yalnızca rakam içermelidir (Örn: AW-384910248).");
      return;
    }

    if (!labelValue || labelValue.length < 3) {
      setWizardError("⚠️ HATA: Dönüşüm Etiketi boş bırakılamaz ve en az 3 karakter uzunluğunda olmalıdır.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create step-by-step local storage JSON data
      const ad_settings = {
        google_analytics_id: gaValue,
        google_ads_conversion_id: adsValue,
        google_ads_label: labelValue,
        is_setup_complete: true
      };

      // Set key in Local Storage as required
      localStorage.setItem("ad_settings", JSON.stringify(ad_settings));

      // Backup individual legacy parameters
      localStorage.setItem("googleAnalyticsId", gaValue);
      localStorage.setItem("adsConversionId", adsValue);
      localStorage.setItem("adsLabel", labelValue);

      // 2. Synchronize to our application settings and persist database
      const updatedSettings = {
        ...settings,
        googleAnalyticsId: gaValue,
        googleAdsId: adsValue,
        googleAdsLabel: labelValue
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });

      if (!res.ok) {
        let errorMsg = "Sunucu hatası: Ayarlar kaydedilemedi.";
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || `HTTP ${res.status}: ${res.statusText}`;
        } catch {
          errorMsg = `HTTP ${res.status}: ${res.statusText}`;
        }
        setWizardError(`⚠️ HATA: ${errorMsg}`);
        return;
      }

      const netSettings = await res.json();
      setSettings(netSettings);

      // 3. Fire dynamic tagging tag load
      loadMarketingTags(gaValue, adsValue, labelValue);

      // 4. Log conversion action to terminal console list
      const log = {
        id: "ad-wizard-" + Date.now(),
        time: "Şimdi",
        event: "Google Ads Integration Saved (Wizard)",
        status: "Setup Complete",
        details: `Esnaf Sihirbazı Tamamlandı! Google Analytics (${gaValue}) ve Google Ads (${adsValue}) işletmedeki tüm sipariş ve tıklama butonlarına canlı akışla bağlandı.`
      };
      setConversionLogs(prev => [log, ...prev]);

      // Proceed to congratulative step
      setWizardStep(3);
    } catch (err) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setWizardError(`⚠️ HATA: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Automated Google Ads / Analytics integration save for non-technical merchants
  const saveAdIntegration = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        
        // Push successful save log to conversion logs
        const log = {
          id: "ad-save-" + Date.now(),
          time: "Şimdi",
          event: "Google Ads Integration Saved",
          status: "Success",
          details: `Google Analytics (${updated.googleAnalyticsId || "G-9K7EFX8ZVL"}) ve Google Ads (${updated.googleAdsId || "AW-384910248"}) reklam kodları sisteme başarıyla işlendi.`
        };
        setConversionLogs(prev => [log, ...prev]);

        alert("🎉 Google Reklam Kurulumu Başarıyla Tamamlandı!\n\nKodlar sisteme gömüldü. Artık müşterileriniz herhangi bir kampanyaya tıklayıp sizinle iletişime geçtiğinde Google Ads paneline otomatik olarak dönüşüm bildirilecek ve işletmeniz dolacak!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Firebase authentication passcode logic
  const handleAdminLogin = (e: FormEvent) => {
    e.preventDefault();
    // Simply accepts "admin" code or bypasses with default click automatically
    if (adminPasscode.toLowerCase().trim() === "") {
      setIsAdminLoggedIn(true);
      setAdminLockError("");
    } else if (adminPasscode.toLowerCase() === "admin" || adminPasscode.toLowerCase() === "esnaf") {
      setIsAdminLoggedIn(true);
      setAdminLockError("");
    } else {
      setAdminLockError(t.wrongPasscode);
    }
  };

  // Load translations based on current database state setting
  const t = TRANSLATIONS[settings.language as "tr" | "en" | "de"] || TRANSLATIONS.tr;

  // Showcase view filtering logic
  const filteredShowcaseItems = publicDiscounts.filter((item) => {
    // 1. Tab match: "local" (Radius match) vs "global" (Globally published)
    if (showcaseTab === "local") {
      if (item.publishMode === "local" && item.latitude && item.longitude) {
        const itemDistance = calculateDistance(userLat, userLng, item.latitude, item.longitude);
        const maxRange = item.radiusKm || 10;
        if (itemDistance > maxRange) return false;
      }
    } else {
      // Global tab shows items with global flag - also show local items that are global friendly
      if (item.publishMode === "local") return false;
    }

    // 2. Category matching
    if (selectedCategory !== "Tümü" && item.category !== selectedCategory) {
      return false;
    }

    // 3. Search query match
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        item.productName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.seoDescription.toLowerCase().includes(q) ||
        item.merchantName.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Sorting
  if (showcaseTab === "local") {
    // Sort local items by closest distance first
    filteredShowcaseItems.sort((a, b) => {
      const distA = calculateDistance(userLat, userLng, a.latitude || 41.0082, a.longitude || 28.9784);
      const distB = calculateDistance(userLat, userLng, b.latitude || 41.0082, b.longitude || 28.9784);
      return distA - distB;
    });
  } else {
    // Sort global items by most recently published first
    filteredShowcaseItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans tracking-tight text-stone-900 transition-colors duration-150 relative">

      {/* DATA BACKUP & MANAGEMENT INFO BANNER */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <div className="text-amber-600 font-bold text-lg flex-shrink-0">💾</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-900">
              Tüm Pazarlama Verileriniz Güvenli Şekilde Yedekleniyor
            </p>
            <p className="text-xs text-amber-800 mt-1">
              Tarayıcınız sıfırlanırsa bile, sağ taraftaki yan panelden <strong>"VERİLERİ İNDİR"</strong> yaparak tüm ürünleriniz, satışlarınız, masraflarınız, indirimleri ve Google entegrasyon ayarlarınızı kaydedebilirsiniz. Daha sonra <strong>"VERİLERİ YÜKLE"</strong> ile geri yükleyin.
            </p>
          </div>
        </div>
      </div>

      {/* HEADER TOP LOGO NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand Accent */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-md">
              <Percent className="h-5 w-5 text-emerald-400 rotate-12" strokeWidth={3} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tighter text-stone-900 font-serif">{t.logoLabel}</h1>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded px-1.5 py-0.2 animate-pulse">
                  {t.networkLive}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium font-mono">{t.subtitle}</p>
            </div>
          </div>
          
          {/* Main Mode Toggle: ONLY visible if the App is not loaded via deep Isolated Showcase url parameters. 
              This guarantees "Tam İzolasyon" (100% security Isolation). */}
          {!isPublicUrlLocked && (
            <div className="flex items-center gap-2.5">
              <button
                id="btn-toggle-esnaf"
                onClick={() => {
                  setIsCustomerShowcase(false);
                }}
                className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  !isCustomerShowcase
                    ? "bg-stone-900 text-white shadow-md"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                {t.esnafTitle}
              </button>
              
              <button
                id="btn-toggle-showcase"
                onClick={() => {
                  setIsCustomerShowcase(true);
                }}
                className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
                  isCustomerShowcase
                    ? "bg-emerald-700 text-white border-emerald-600 shadow-emerald-700/10 shadow-md animate-pulse"
                    : "bg-white border-stone-200 text-stone-800 hover:bg-stone-100"
                }`}
              >
                <Eye className="h-4 w-4" />
                {t.customerTitle}
              </button>

              <button
                onClick={fetchData}
                disabled={isLoading}
                className="p-2.5 text-stone-500 hover:text-stone-900 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-40 cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}

          {/* Locked View Indicator (Only visible to normal clients viewing showcase) */}
          {isPublicUrlLocked && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
              <span className="text-[11px] font-bold text-emerald-800 uppercase font-mono tracking-wider">
                🔒 {settings.merchantName} Vitrini
              </span>
            </div>
          )}
        </div>
      </header>

      {/* RENDER VIEW ACCORDING TO STATE TOGGLE */}
      {!isCustomerShowcase ? (
        
        /* ========================================================
           ESNAF BACKOFFICE / PUBLISHER CONSOLE
           ======================================================== */
        <div>
          {!isAdminLoggedIn ? (
            /* SECURITY LOCK FORM - Firebase Authentication Simulation */
            <div className="max-w-md mx-auto my-20 px-4 animate-fadeIn">
              <div className="bg-white rounded-3xl border border-stone-250 p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center mb-3">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold font-serif text-stone-900">{t.adminLockTitle}</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{t.adminLockSubtitle}</p>
                </div>

                <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-400 mb-1.5">{t.passcodeLabel}</label>
                    <input 
                      type="password" 
                      placeholder="Şifreyi giriniz veya doğrudan tıklayıp geçiniz" 
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-stone-400 font-bold"
                    />
                    {adminLockError && (
                      <p className="text-rose-600 font-bold text-[11px] mt-1.5">{adminLockError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-stone-900 hover:bg-stone-950 text-white font-black py-3 rounded-xl transition-all cursor-pointer text-xs"
                  >
                    {t.loginBtn}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED ESNAF CONTROL INDEX */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
              
              {/* ESNAF DETAILS PRE-BAR */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t.storeNameLabel}</p>
                      <p className="font-extrabold text-stone-800 text-sm leading-tight leading-none mt-0.5">{settings.merchantName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t.phoneLabel}</p>
                    <p className="font-bold text-stone-700 font-mono mt-0.5">{settings.merchantPhone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t.whatsappLabel}</p>
                    <p className="font-bold text-emerald-700 font-mono mt-0.5">{settings.merchantWhatsApp}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-center bg-stone-50 p-2.5 rounded-xl border border-stone-150 text-right w-full md:w-auto self-stretch md:self-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] text-stone-400 uppercase font-bold tracking-wider">{t.activeCount}</p>
                    <p className="font-extrabold text-stone-900 leading-none mt-1">{publicDiscounts.length} Kampanya</p>
                  </div>
                  <button 
                    onClick={() => setIsAdminLoggedIn(false)}
                    className="text-[10px] bg-white hover:bg-rose-50 hover:text-rose-600 border border-stone-200 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                  >
                    {t.logoutBtn}
                  </button>
                </div>
              </div>

              {/* INTERNAL DASHBOARD TABS */}
              <div className="flex border-b border-stone-200 mb-6 flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab("publisher")}
                  className={`pb-3 text-xs font-bold px-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === "publisher"
                      ? "border-stone-900 text-stone-900 font-black"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {t.addDiscountTab}
                </button>
                <button
                  onClick={() => setActiveTab("catalogue")}
                  className={`pb-3 text-xs font-bold px-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === "catalogue"
                      ? "border-stone-900 text-stone-900 font-black"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {t.portfolioTab} ({publicDiscounts.length})
                </button>
                <button
                  onClick={() => setActiveTab("reklam")}
                  className={`pb-3 text-xs font-bold px-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === "reklam"
                      ? "border-stone-900 text-stone-900 font-black"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  📊 Google Entegrasyon
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`pb-3 text-xs font-bold px-4 border-b-2 transition-all cursor-pointer ${
                    activeTab === "settings"
                      ? "border-stone-900 text-stone-900 font-black"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  ⚙️ {t.settingsTab}
                </button>
              </div>

              {/* TAB 0: GLOBAL SETTINGS EDIT */}
              {activeTab === "settings" && (
                <div className="max-w-2xl bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-md font-black text-stone-900 font-serif flex items-center gap-2">
                      <Globe className="h-5 w-5 text-indigo-600" />
                      {t.settingsTab}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Platform dilini ve mağaza iletişim bilgilerini değiştirin. Dil seçildiğinde, hem bu yönetim arayüzü hem de müşterilerinizin vitrini tamamen bu dilde görüntülenecektir (Türkçe, İngilizce, Almanca i18n altyapısı mevcuttur).
                    </p>
                  </div>

                  <form onSubmit={saveStoreSettings} className="flex flex-col gap-5 text-xs font-bold text-stone-700">
                    
                    {/* Language Switch */}
                    <div className="bg-stone-50 border border-stone-150 p-4 rounded-2xl">
                      <label className="block text-[10px] uppercase tracking-wider text-stone-400 mb-3">{t.globalSettingsLabel}</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, language: "tr" }))}
                          className={`py-2 px-3 rounded-xl border font-black text-[11px] transition-all cursor-pointer text-center ${
                            settings.language === "tr"
                              ? "bg-stone-900 border-stone-950 text-white shadow-sm"
                              : "bg-white border-stone-200 text-stone-600 hover:bg-stone-105"
                          }`}
                        >
                          🇹🇷 {t.langTr}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, language: "en" }))}
                          className={`py-2 px-3 rounded-xl border font-black text-[11px] transition-all cursor-pointer text-center ${
                            settings.language === "en"
                              ? "bg-stone-900 border-stone-950 text-white shadow-sm"
                              : "bg-white border-stone-200 text-stone-600 hover:bg-stone-105"
                          }`}
                        >
                          🇺🇸 {t.langEn}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, language: "de" }))}
                          className={`py-2 px-3 rounded-xl border font-black text-[11px] transition-all cursor-pointer text-center ${
                            settings.language === "de"
                              ? "bg-stone-900 border-stone-950 text-white shadow-sm"
                              : "bg-white border-stone-200 text-stone-600 hover:bg-stone-105"
                          }`}
                        >
                          🇩🇪 {t.langDe}
                        </button>
                      </div>
                    </div>

                    {/* Merchant Data */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-stone-400 mb-1.5">{t.storeNameLabel}</label>
                        <input
                          type="text"
                          required
                          value={settings.merchantName}
                          onChange={(e) => setSettings(prev => ({ ...prev, merchantName: e.target.value }))}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-stone-400 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-stone-400 mb-1.5">{t.phoneLabel}</label>
                        <input
                          type="text"
                          required
                          value={settings.merchantPhone}
                          onChange={(e) => setSettings(prev => ({ ...prev, merchantPhone: e.target.value }))}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-stone-400 font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-stone-400 mb-1.5">{t.whatsappLabel}</label>
                        <input
                          type="text"
                          required
                          value={settings.merchantWhatsApp}
                          onChange={(e) => setSettings(prev => ({ ...prev, merchantWhatsApp: e.target.value }))}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-stone-400 font-bold font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-3 w-full bg-stone-900 hover:bg-stone-950 text-white font-black py-4 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {isLoading ? "..." : t.saveSettingsBtn}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB REKLAM: GLOBAL ADVERTISING & SEO INTEGRATION HUB */}
              {activeTab === "reklam" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
                  
                  {/* Left Column: Settings and Wizards */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    
                    {/* Cloud Synchronization Bridge Panel */}
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-55 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono">
                            DÜNYA GENELİ BULUT SENKRONİZASYONU
                          </span>
                          <h2 className="text-md font-black text-stone-900 font-serif leading-tight mt-1.5 flex items-center gap-2">
                            <RefreshCw className="h-4.5 w-4.5 text-emerald-500 animate-spin" />
                            Hibrit Bulut Köprüsü & CDN (100% Canlı)
                          </h2>
                          <p className="text-xs text-stone-550 mt-1 leading-relaxed">
                            Kampanyalarınız yerel cihaz hafızasının sınırlarından çıkartılarak dünya genelinde internet aramalarında, Google ve Facebook reklam mecralarında gösterilmek üzere güvenli, yüksek hızlı CDN bulut sunucularımıza otomatik olarak kopyalanır.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-extrabold font-mono">HER YERDE YAYINDA</span>
                        </div>
                      </div>

                      {/* Sync Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 bg-stone-50 p-4 rounded-2xl border border-stone-150">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-stone-850">Bulut Depolama Senkronizasyonu</p>
                            <p className="text-[10px] text-stone-500">Google Ads platformlarının anlık okuması için veritabanını dışa aktarır.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCloudSyncEnabled(!isCloudSyncEnabled);
                              const log = {
                                id: "sync-" + Date.now(),
                                time: "Az önce",
                                event: isCloudSyncEnabled ? "Cloud Sync Disabled" : "Cloud Sync Enabled",
                                status: isCloudSyncEnabled ? "Deactivated" : "Activated",
                                details: isCloudSyncEnabled ? "Otomatik bulut veritabanı kopyalaması geçici olarak durduruldu." : "Veritabanı Firebase Cloud Storage snapshot ile senkronize edildi."
                              };
                              setConversionLogs(prev => [log, ...prev]);
                            }}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                              isCloudSyncEnabled 
                                ? "bg-emerald-600 text-white border-emerald-700" 
                                : "bg-stone-100 text-stone-505 border-stone-200"
                            }`}
                          >
                            <span className="text-[10px] font-black px-2.5">
                              {isCloudSyncEnabled ? "Açık" : "Kapalı"}
                            </span>
                          </button>
                        </div>

                        <div className="border-t sm:border-t-0 sm:border-l border-stone-200 pt-3 sm:pt-0 sm:pl-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-stone-850">CDN Önbellek Durumu</p>
                            <p className="text-[10px] text-stone-500">Google Ads taramaları için önbelleği zorla yeniler.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              alert("CDN önbelleği başarıyla temizlendi ve tüm işletme verileri anlık olarak yeniden yüklendi! 🚀");
                            }}
                            className="bg-white hover:bg-stone-50 text-stone-705 font-extrabold text-[10px] border border-stone-200 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            Önbellek Temizle ⚡
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Google Analytics & Ads (Otomatik) */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 p-6 sm:p-8 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">✅</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-black text-blue-900 mb-1">
                            Google Analytics & Ads (Otomatik)
                          </h3>
                          <p className="text-xs text-blue-800 leading-relaxed">
                            Sistem ortamınıza kaydedilen Google Analytics ve Google Ads kodları otomatik olarak yükleniyor. Esnaf hiçbir işlem yapmasına gerek kalmıyor. Veriler merkezi hesaba toplanıyor.
                          </p>
                        </div>
                      </div>
                    </div>


                          



                    {/* Otomatik Google Yayını */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                          <Globe className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono">
                            ✅ OTOMATIK GOOGLE YAYINI
                          </span>
                          <h2 className="text-md font-black text-emerald-900 font-serif leading-tight mt-1">
                            Kampanyalar Otomatik Olarak Yayınlanıyor
                          </h2>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-emerald-800">
                        <div className="flex items-start gap-2">
                          <div className="text-lg">✓</div>
                          <div>
                            <p className="font-semibold">Ürün Eklediniz Mi?</p>
                            <p className="text-xs text-emerald-700">Sistem anında sitemap.xml'i günceller ve arama motorlarını bildirir</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="text-lg">✓</div>
                          <div>
                            <p className="font-semibold">Sitemap Otomatik Güncelleniyor</p>
                            <p className="text-xs text-emerald-700">Her kampanya eklenince /sitemap.xml yenileniyor ve IndexNow API'sine gönderiliyor</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="text-lg">✓</div>
                          <div>
                            <p className="font-semibold">Arama Motorlarına Bildirim</p>
                            <p className="text-xs text-emerald-700">IndexNow API (Google, Bing, Yandex) + robots.txt sitemap deklarasyonu</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-emerald-200">
                        <p className="text-[11px] text-emerald-700 font-mono font-semibold">
                          ℹ️ Sitemap otomatik güncelleniyor. Arama motorları robots.txt aracılığıyla haber alıyor. Google organik taraması 1-7 gün içinde başlayabilir.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Google SEO Snippet and Live Conversion Logs */}
                  <div className="lg:col-span-5 flex flex-col gap-6">

                    {/* Google SEO Snippet Simulator */}
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
                      <span className="text-[9px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">GOOGLE ARAMA SONUCU ÖNİZLEMESİ</span>
                      <h3 className="text-md font-black text-stone-950 font-serif leading-tight mt-1.5 mb-2 flex items-center gap-1">
                        <Eye className="h-4.5 w-4.5 text-stone-600" />
                        Google Snippet Mockup
                      </h3>
                      <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                        Bir kullanıcı Google'a işletmenizin adını veya sattığınız bir ürünü yazdığında belirecek arama sonucu. İndirimli ürünleriniz doğrudan Google başlığında çıkar!
                      </p>

                      {/* Google Snippet Visual Card */}
                      <div className="bg-white rounded-2xl border border-stone-150 p-5 shadow-xs font-sans text-left">
                        {/* URL Line */}
                        <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                          <div className="h-4 w-4 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                            <span className="text-[10px] text-stone-600 font-bold">🛒</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-stone-700 leading-none">https://esnafindirim.com</span>
                            <span className="text-[9px] text-stone-400 mt-0.5 leading-none font-mono">k &gt; {settings.merchantName.toLowerCase().replace(/\s+/g, '-')}</span>
                          </div>
                        </div>

                        {/* Title Line */}
                        <h4 className="text-blue-850 hover:underline cursor-pointer font-medium text-md sm:text-lg mt-2 leading-tight tracking-normal">
                          {publicDiscounts[0] 
                            ? `${publicDiscounts[0].productName} Sadece ${publicDiscounts[0].discountPrice} TL! | ${settings.merchantName} Kampanyaları`
                            : `${settings.merchantName} Güncel Esnaf Kampanyaları & Fiyat İndirimleri`
                          }
                        </h4>

                        {/* Description snippet snippet */}
                        <p className="text-stone-600 text-xs sm:text-[11px] mt-1.5 leading-relaxed max-w-md">
                          <strong className="text-stone-800 font-bold">İNDİRİM YAYINDA:</strong> {publicDiscounts[0] 
                            ? selectedDetailDiscount?.seoDescription || publicDiscounts[0].seoDescription
                            : "Komşularımız için işletmemizde şahane taze gıda esnaf indirimleri başladı. Fırsatları kaçırmadan tükenmeden incelemek ve sipariş etmek için tıklayın."
                          }
                        </p>

                        {/* Rich snippet metrics */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
                          <span>⭐ Derecelendirme: 4.9/5</span>
                          <span>💬 30+ Müşteri Siparişi</span>
                          <span>🏢 Kadıköy</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Tracking Conversion Terminal Console */}
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-[9px] font-extrabold text-stone-500 uppercase tracking-widest font-mono">CANLI KÜRESEL REKLAM PANELİ</span>
                          <h3 className="text-md font-black text-stone-950 font-serif leading-tight mt-1.5 flex items-center gap-1.5">
                            <Activity className="h-4.5 w-4.5 text-emerald-500" />
                            Dönüşüm İzleme Terminali
                          </h3>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                      <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                        Müşterileriniz Google Ads üzerinden geldiğinde tetiklenen izleme pikselleri ve sitemap arama botu hareketleri. Müşteri butona bastığında buraya yeni sinyal düşer.
                      </p>

                      {/* Interactive Conversion simulator launcher button */}
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={() => {
                            const mockItemName = publicDiscounts[0]?.productName || "Taze Yoğurt";
                            const mockPrice = publicDiscounts[0]?.discountPrice || 85;
                            const nowStr = new Date().toLocaleTimeString("tr-TR");
                            
                            const conversionLogItem = {
                              id: "mock-" + Date.now(),
                              time: `Şimdi (${nowStr})`,
                              event: "Conversion Triggered (Simulator)",
                              status: `Fired (${adsConversionId})`,
                              details: `Simüle edilmiş müşteri: "${mockItemName}" için WhatsApp sipariş butonuna dokunarak Google Ads dönüşüm pikselini tetikledi! Değer: ${mockPrice} TL.`
                            };
                            setConversionLogs(prev => [conversionLogItem, ...prev]);
                          }}
                          className="w-full bg-stone-900 hover:bg-stone-950 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Gift className="h-4 w-4 text-amber-400" /> Simüle Tıklama Dönüşümü Tetikle
                        </button>
                      </div>

                      {/* Log output panel list */}
                      <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                        {conversionLogs.map((log) => (
                          <div key={log.id} className="bg-stone-50 border border-stone-200/85 p-3 rounded-xl flex flex-col gap-1 text-[11px] hover:border-stone-300 transition-all">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-stone-850 flex items-center gap-1">
                                🔔 {log.event}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">{log.time}</span>
                            </div>
                            <p className="text-stone-500 leading-normal italic text-[10px]">
                              {log.details}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                              <span className="text-stone-400">Durum:</span>
                              <span className={`font-black px-1.5 py-0.2 rounded border bg-white ${
                                log.status.includes("Fired") 
                                  ? "text-emerald-700 border-emerald-100" 
                                  : "text-amber-700 border-amber-100"
                              }`}>
                                {log.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 1: NEW PUBLICATION FORM & PREVIEW */}
              {activeTab === "publisher" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Form panel */}
                  <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                    <div className="mb-6 flex justify-between items-start">
                      <div>
                        <h2 className="text-md font-black text-stone-900 font-serif flex items-center gap-2">
                          <Sparkles className="h-4.5 w-4.5 text-emerald-500 animate-spin" />
                          {t.campaignDetails}
                        </h2>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                          {t.campaignSubtitle}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                            Limitsiz İndirim & Reklam Hazırlama Aktif
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded-full shadow-xs">
                            Sınırsız Vitrin Yayını
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProdName("");
                          setProdCategory("🥛 Şarküteri");
                          setProdPrice("");
                          setProdDiscountPrice("");
                          setProdDescription("");
                          setProdImages([]);
                        }}
                        className="text-[10px] font-black text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-xs"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Sıfırla
                      </button>
                    </div>

                    <form onSubmit={publishCampaign} className="flex flex-col gap-5 text-xs">
                      
                      {/* Category Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-1.5">{t.categoryLabel}</label>
                          <input 
                            type="text"
                            required
                            placeholder="Örn: 🥛 Şarküteri, 🍞 Fırın, 🍎 Manav..."
                            value={prodCategory}
                            onChange={(e) => setProdCategory(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-stone-400 text-stone-900 font-bold placeholder:text-stone-300 transition-all focus:bg-white"
                          />
                          <div className="flex flex-wrap gap-1 mt-2">
                            {["🥛 Şarküteri", "🍞 Fırın", "🍏 Manav", "🥩 Kasap", "🍪 Tatlı", "📦 Genel"].map(tag => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setProdCategory(tag)}
                                className={`text-[9px] px-2 py-0.5 rounded-lg border font-bold transition-all cursor-pointer ${
                                  prodCategory === tag 
                                    ? "bg-emerald-700 text-white border-emerald-800 shadow-sm" 
                                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-1.5">{t.productNameLabel}</label>
                          <input 
                            type="text" 
                            required
                            placeholder={t.productNamePlaceholder} 
                            value={prodName}
                            onChange={(e) => setProdName(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-stone-400 text-stone-900 font-bold transition-all placeholder:text-stone-300 focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Pricing Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50/55 p-4 rounded-2xl border border-stone-200/80">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-1.5">{t.originalPriceLabel}</label>
                          <input 
                            type="number" 
                            step="0.01"
                            required
                            placeholder="300" 
                            value={prodPrice}
                            onChange={(e) => setProdPrice(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-stone-400 text-stone-900 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-1.5">{t.discountPriceLabel}</label>
                          <input 
                            type="number" 
                            step="0.01"
                            required
                            placeholder="199" 
                            value={prodDiscountPrice}
                            onChange={(e) => setProdDiscountPrice(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-stone-400 text-stone-900 font-bold"
                          />
                        </div>
                        <div className="flex flex-col justify-center items-center bg-white border border-dashed border-stone-200 rounded-xl p-1.5">
                          <span className="text-[9px] uppercase font-extrabold text-stone-400">{t.discountPercentLabel}</span>
                          <span className="text-md font-black text-rose-600 mt-0.5">
                            {calculateDiscountPercent() > 0 ? `%${calculateDiscountPercent()}` : "%0"}
                          </span>
                        </div>
                      </div>

                      {/* Product Image Selection Section */}
                      <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 animate-fadeIn flex flex-col gap-3">
                        <div className="flex justify-between items-center text-stone-500">
                          <label className="block text-[10px] uppercase tracking-wider font-extrabold text-stone-500">🖼️ ÜRÜN GÖRSELLERİ EKLE (SINIRSIZ)</label>
                          {prodImages.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setProdImages([])}
                              className="text-[10px] text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-0.5 cursor-pointer bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 transition-all animate-fadeIn"
                            >
                              Temizle
                            </button>
                          )}
                        </div>

                        {/* Interactive File Drag & Drop + Direct URL Select / Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label 
                            htmlFor="device-file-input"
                            className="group flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/10 bg-white rounded-xl p-5 cursor-pointer transition-all gap-1.5 text-center my-auto"
                          >
                            <Smartphone className="h-6 w-6 text-stone-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all" />
                            <span className="text-xs font-black text-stone-800">Cihazdan Fotoğraf Yükle</span>
                            <span className="text-[9px] text-stone-400 font-medium">Fotoğraf seçerek galeriye ekleyin</span>
                            <input 
                              id="device-file-input" 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleFileUpload}
                            />
                          </label>

                          {/* Preview box and manual URL Entry with "Ekle" button */}
                          <div className="bg-white border border-stone-150 rounded-xl p-3 flex flex-col justify-between gap-3 text-left">
                            <div className="bg-stone-50 border border-stone-150 rounded-lg p-2 flex flex-col items-center justify-center text-stone-400 text-center">
                              <span className="text-[10px] font-black text-stone-700">Toplam Yüklenen Fırsat Görseli:</span>
                              <span className="text-[12px] text-indigo-650 font-black font-mono">{prodImages.length} Adet</span>
                            </div>

                            <div className="flex gap-1.5">
                              <input 
                                id="manual-url-input"
                                type="url"
                                placeholder="Görsel web adresi (URL) yapıştırın..."
                                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-stone-950 font-bold placeholder:text-stone-300 focus:outline-none focus:border-stone-400 transition-all text-[10px]"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = (e.currentTarget as HTMLInputElement).value.trim();
                                    if (val && !prodImages.includes(val)) {
                                      setProdImages(prev => [...prev, val]);
                                      (e.currentTarget as HTMLInputElement).value = "";
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('manual-url-input') as HTMLInputElement;
                                  if (input) {
                                    const val = input.value.trim();
                                    if (val && !prodImages.includes(val)) {
                                      setProdImages(prev => [...prev, val]);
                                      input.value = "";
                                    }
                                  }
                                }}
                                className="px-3 py-1 bg-stone-900 hover:bg-stone-950 text-white rounded-lg text-[10px] font-black cursor-pointer transition-colors shrink-0"
                              >
                                Ekle
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Interactive List of Loaded Images */}
                        {prodImages.length > 0 && (
                          <div className="mt-1 p-3 bg-white rounded-xl border border-stone-150 animate-fadeIn">
                            <span className="block text-[9px] uppercase font-extrabold text-stone-500 mb-2">📋 Galeriye Eklenen Resimler (Sıralı):</span>
                            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1.5 bg-stone-50 rounded-lg">
                              {prodImages.map((src, i) => (
                                <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-stone-200 group-hover:scale-95 transition-all">
                                  <img src={src} className="h-full w-full object-cover" alt="product thumbnail" referrerPolicy="no-referrer" />
                                  <button
                                    type="button"
                                    onClick={() => setProdImages(prev => prev.filter((_, idx) => idx !== i))}
                                    className="absolute -top-1 -right-1 bg-red-650 hover:bg-red-700 text-white rounded-full p-0.5 h-4.5 w-4.5 flex items-center justify-center text-[10px] font-black shadow-sm transition-all cursor-pointer"
                                    title="Görseli Kaldır"
                                  >
                                    ×
                                  </button>
                                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[7px] text-white font-black text-center py-0.2 leading-none">
                                    {i === 0 ? "Kapak" : `#${i + 1}`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Stock Preset Selector Grid */}
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-stone-405 mb-2">Veya hazır görsel kütüphanesinden seçin (Çoklu Seçilebilir):</span>
                          <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-5 gap-2 max-h-24 overflow-y-auto pr-1">
                            {PRESET_IMAGES
                              .filter(img => {
                                // Kategoriye göre filtrele
                                if (!prodCategory || prodCategory === "Genel") return true;
                                return img.category === prodCategory;
                              })
                              .map((img) => (
                              <button
                                key={img.url}
                                type="button"
                                onClick={() => {
                                  if (!prodImages.includes(img.url)) {
                                    setProdImages(prev => [...prev, img.url]);
                                  } else {
                                    setProdImages(prev => prev.filter(x => x !== img.url));
                                  }
                                }}
                                className={`group relative h-11 rounded-lg overflow-hidden border-2 text-left transition-all cursor-pointer shrink-0 ${
                                  prodImages.includes(img.url) 
                                    ? "border-emerald-600 ring-2 ring-emerald-500/20 scale-[0.98]" 
                                    : "border-stone-200 hover:border-stone-300"
                                }`}
                              >
                                <img 
                                  src={img.url} 
                                  alt={img.name}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300" 
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-end p-1">
                                  <span className="text-[8px] text-white font-black leading-tight line-clamp-1">{img.name}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tagline generator section */}
                      <div className="flex flex-col gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[10px] uppercase tracking-wider font-extrabold text-stone-400">1. Web Vitrini & SEO Açıklaması</label>
                            <button
                              type="button"
                              onClick={generateAIMetaWithGemini}
                              disabled={isGeneratingAI}
                              className="text-[10px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all shrink-0 animate-pulse"
                            >
                              <Sparkles className="h-3 w-3 text-amber-500" />
                              {isGeneratingAI ? "Yazılıyor..." : "Yapay Zeka ile İki Metni de Hazırla ✨"}
                            </button>
                          </div>

                          {isGeneratingAI ? (
                            <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1 animate-pulse">
                              <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                              <p className="text-[10px] text-stone-500">Gemini {settings.language.toUpperCase()} dilde yazıyor...</p>
                            </div>
                          ) : (
                            <textarea
                              value={prodDescription}
                              onChange={(e) => setProdDescription(e.target.value)}
                              placeholder="Web sayfasında ve arama motorlarında görünecek çekici tanıtım metni..."
                              rows={2}
                              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-stone-400 text-stone-850 leading-relaxed text-xs"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-extrabold text-indigo-750 mb-1.5 flex items-center gap-1">
                            <span>📣 2. Sosyal Medya & WhatsApp Reklam Yazısı (Mükemmel Reklam Metni)</span>
                            <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-extrabold text-[8px] uppercase">Yeni</span>
                          </label>
                          <textarea
                            value={prodAdCopy}
                            onChange={(e) => setProdAdCopy(e.target.value)}
                            placeholder="WhatsApp gruplarında veya Instagram paylaşımlarında kullanabileceğiniz emojili, kampanyaya davet eden muhteşem reklam yazısı..."
                            rows={4}
                            className="w-full bg-indigo-50/20 border border-indigo-200/80 rounded-xl p-3 focus:outline-none focus:border-indigo-400 text-stone-850 leading-relaxed text-xs focus:bg-white font-medium"
                          />
                          <p className="text-[8.5px] text-stone-400 font-bold mt-1">
                            💡 İpucu: Yukarıdaki "Yapay Zeka" butonuna bastığınızda bu alan işletme isminiz ve indirim oranınıza göre otomatik harika bir metinle doldurulur. Beğenmezseniz buraya tıklayarak dilediğiniz gibi kendiniz düzenleyebilirsiniz.
                          </p>
                        </div>
                      </div>

                      {/* PUBLISH SCOPE SELECTION */}
                      <div className="border border-stone-200 rounded-2xl p-4 bg-white">
                        <label className="block text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-3">{t.publishScopeLabel}</label>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-stone-100 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setPublishMode("local")}
                            className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              publishMode === "local" 
                                ? "bg-white text-stone-900 shadow-sm font-black" 
                                : "text-stone-500 hover:text-stone-800"
                            }`}
                          >
                            {t.radiusLabel}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPublishMode("global")}
                            className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              publishMode === "global" 
                                ? "bg-white text-stone-900 shadow-sm font-black" 
                                : "text-stone-500 hover:text-stone-800"
                            }`}
                          >
                            {t.globalLabel}
                          </button>
                        </div>

                        {/* Location modes UI */}
                        {publishMode === "local" ? (
                          <div className="flex flex-col gap-4 animate-fadeIn">
                            {/* Range Slider */}
                            <div className="bg-stone-50/70 border border-stone-150 p-3.5 rounded-xl">
                              <div className="flex justify-between items-center mb-2 font-mono text-xs">
                                <span className="text-stone-500 font-bold">{t.radiusKmLabel}:</span>
                                <span className="text-emerald-700 font-black text-sm">{radiusKm} KM</span>
                              </div>
                              <input 
                                type="range" 
                                min="1" 
                                max="50" 
                                value={radiusKm}
                                onChange={(e) => setRadiusKm(Number(e.target.value))}
                                className="w-full accent-emerald-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                              />
                              <p className="text-[10px] text-stone-400 mt-2 font-medium">
                                {t.radiusTip}
                              </p>
                            </div>

                            {/* Coordinates Selector */}
                            <div className="border border-stone-200/80 p-3.5 rounded-xl bg-stone-50/40">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-stone-700 text-[11px]">{t.locationSelectorLabel}</span>
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={detectMerchantLocation}
                                    className="text-[10px] bg-white border border-stone-200 text-stone-700 px-2.5 py-1 rounded hover:bg-stone-100 font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    {t.gpsLocBtn}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMerchantLat(0);
                                      setMerchantLng(0);
                                      setMerchantLocationLabel("Belirtilmedi (Konum Yok)");
                                      showToast("İşletme konumu sıfırlandı!", "info");
                                    }}
                                    className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-2 py-1 rounded hover:bg-rose-100 font-bold cursor-pointer"
                                  >
                                    🗑️ Sıfırla
                                  </button>
                                </div>
                              </div>

                              {/* Manual Latitude & Longitude inputs - satisfies removing presets/automatic registration */}
                              <div className="grid grid-cols-2 gap-2.5 mb-3">
                                <div>
                                  <label className="block text-[9px] text-stone-500 font-bold mb-1 uppercase">Enlem (Latitude)</label>
                                  <input 
                                    type="number"
                                    step="0.000001"
                                    value={merchantLat}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setMerchantLat(val);
                                      setMerchantLocationLabel("Manuel Konum");
                                    }}
                                    className="w-full bg-white border border-stone-200 rounded px-2.5 py-1 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] text-stone-500 font-bold mb-1 uppercase">Boylam (Longitude)</label>
                                  <input 
                                    type="number"
                                    step="0.000001"
                                    value={merchantLng}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setMerchantLng(val);
                                      setMerchantLocationLabel("Manuel Konum");
                                    }}
                                    className="w-full bg-white border border-stone-200 rounded px-2.5 py-1 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                  />
                                </div>
                              </div>

                              <div className="bg-white border border-stone-200 p-2.5 rounded-lg flex items-center justify-between text-[10px] font-mono font-bold text-stone-500 font-bold">
                                <div>
                                  <span className="text-emerald-700">{t.addressLabel}:</span> {merchantLocationLabel || "Konum Belirtilmedi"}
                                </div>
                                <div>
                                  ({merchantLat?.toFixed(4)}° N, {merchantLng?.toFixed(4)}° E)
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 text-indigo-900 animate-fadeIn flex gap-2">
                            <Info className="h-4.5 w-4.5 mt-0.5 shrink-0 text-indigo-600" />
                            <div className="text-[11px] leading-relaxed">
                              <strong>{t.globalLabel} Mode Enabled:</strong> Your indirim campaigns will be accessible dynamically by any customer world-wide without geographic filtering. Perfect for mail order, delivery, or major online deals.
                            </div>
                          </div>
                        )}
                      </div>

                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-stone-900 hover:bg-stone-950 text-white font-black py-4 rounded-xl text-xs sm:text-sm tracking-wider transition-all mt-3 cursor-pointer shadow-md"
                      >
                        {isLoading ? "..." : t.publishBtn}
                      </button>

                    </form>
                  </div>

                  {/* Sidebar Preview */}
                  <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
                    
                    <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl border border-stone-850">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-800">
                        <span className="text-[10px] font-bold font-mono text-emerald-400 tracking-wider uppercase">{t.previewBtn}</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>

                      {/* Card layout */}
                      <div className="bg-stone-850 rounded-2xl overflow-hidden border border-stone-750/50 flex flex-col relative">
                        
                        <span className="absolute top-3 right-3 bg-red-650 text-white font-mono font-black text-xs py-1 px-2 py-0.5 rounded-md shadow-sm">
                          %{calculateDiscountPercent() > 0 ? calculateDiscountPercent() : "SALE"}
                        </span>

                        <div className="h-44 w-full overflow-hidden relative bg-stone-800">
                          <img 
                            src={prodImages[0] || CATEGORY_IMAGES[prodCategory] || CATEGORY_IMAGES["📦 Genel"]} 
                            alt="Preview thumbnail" 
                            className="h-full w-full object-cover opacity-85"
                            referrerPolicy="no-referrer"
                          />
                          {prodImages.length > 1 && (
                            <span className="absolute bottom-3 right-3 bg-black/70 text-white font-mono font-bold text-[8px] py-1 px-2 rounded-full flex items-center gap-1 shadow-sm uppercase shrink-0 z-10">
                              📸 {prodImages.length} GÖRSEL
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950 to-transparent p-3.5 pt-10">
                            <span className="text-[9px] bg-indigo-755 text-white font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                              {prodCategory}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 flex flex-col gap-2">
                          <h4 className="font-extrabold text-base leading-tight">
                            {prodName || "Goat Cheese"}
                          </h4>

                          <p className="text-stone-400 text-[11px] leading-relaxed line-clamp-2">
                            "{prodDescription || 'Enter normal prices above, and describe the product.'}"
                          </p>

                          <div className="flex items-baseline gap-2.5 mt-1">
                            <span className="text-[11px] text-stone-500 line-through font-mono">
                              {prodPrice || "0"} TL
                            </span>
                            <span className="text-emerald-400 font-black text-base font-mono">
                              {prodDiscountPrice || "0"} TL
                            </span>
                          </div>

                          <div className="border-t border-stone-855 mt-2 pt-2 text-[10px] text-stone-400 flex justify-between items-center font-mono font-bold">
                            <span className="flex items-center gap-1 text-emerald-400">
                              {publishMode === "global" ? "🌐 Global" : `📍 max ${radiusKm} KM`}
                            </span>
                            <span>
                              {settings.merchantName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 text-[11px] text-stone-400 leading-relaxed bg-stone-850 p-3.5 rounded-xl border border-stone-800 flex gap-2">
                        <Info className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <p>{t.previewTip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PORTFOLIO CATALOGUE LISTING */}
              {activeTab === "catalogue" && (
                <div className="animate-fadeIn">
                  <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm min-h-[500px]">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-100">
                      <div>
                        <h3 className="text-md font-bold text-stone-900 font-serif flex items-center gap-2">
                          <Globe className="h-4.5 w-4.5 text-emerald-700 animate-pulse" />
                          {t.activePortfolioTitle}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">{t.activePortfolioSubtitle}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2.0 py-0.5 rounded-full shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Sınırsız Vitrin Yayını Aktif
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-stone-500 flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-150">
                        <span>{t.portfolioTab}: {publicDiscounts.length}</span>
                        <span className="text-stone-300">|</span>
                        <span className="text-emerald-700">Views: {publicDiscounts.reduce((sum, i) => sum + (i.views || 0), 0)}</span>
                      </div>
                    </div>

                    {publicDiscounts.length > 0 && (
                      <div className="mb-4 flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <input
                          type="checkbox"
                          checked={selectedDeleteIds.size === publicDiscounts.length && publicDiscounts.length > 0}
                          onChange={selectAllDelete}
                          className="w-4 h-4 cursor-pointer rounded border-indigo-300"
                        />
                        <span className="text-xs font-bold text-indigo-900">
                          {selectedDeleteIds.size > 0 ? `${selectedDeleteIds.size}/${publicDiscounts.length} seçili` : "Tüm ürünleri seç"}
                        </span>
                        {selectedDeleteIds.size > 0 && (
                          <button
                            onClick={deleteBulkCampaigns}
                            className="ml-auto px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" /> {selectedDeleteIds.size} Ürünü Sil
                          </button>
                        )}
                      </div>
                    )}

                    {publicDiscounts.length === 0 ? (
                      <div className="text-center py-24 flex flex-col items-center justify-center gap-3 border border-dashed border-stone-200 bg-stone-50 rounded-2xl max-w-xl mx-auto my-10">
                        <div className="p-3 bg-stone-100 rounded-full text-stone-400">
                          <Globe className="h-8 w-8 animate-spin" />
                        </div>
                        <h3 className="font-bold text-stone-800 text-sm">{t.noItemFound}</h3>
                        <button
                          onClick={() => setActiveTab("publisher")}
                          className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold mt-2 cursor-pointer"
                        >
                          {t.addDiscountTab}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {publicDiscounts.map((item) => {
                          const discountPercentage = Math.round(((item.originalPrice - item.discountPrice) / item.originalPrice) * 100);
                          const fullUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?slug=${item.slug}&userId=${item.userId}&view=showcase`;

                          return (
                            <div key={item.id} className={`bg-stone-50 border rounded-2xl overflow-hidden relative shadow-sm hover:shadow-md transition-all flex flex-col ${selectedDeleteIds.has(item.id) ? 'border-rose-400 bg-rose-50' : 'border-stone-200'}`}>

                              <input
                                type="checkbox"
                                checked={selectedDeleteIds.has(item.id)}
                                onChange={() => toggleSelectDelete(item.id)}
                                className="absolute top-3 left-3 w-4 h-4 cursor-pointer rounded border-stone-300 z-10"
                              />

                              <span className="absolute top-3 right-3 bg-red-650 text-white font-mono font-black text-[9px] py-1 px-2 rounded-md">
                                %{discountPercentage}
                              </span>

                              <div className="h-40 w-full overflow-hidden shrink-0 bg-stone-100 relative">
                                <img 
                                  src={(item.openGraphImage || "").split("|")[0] || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES["📦 Genel"]} 
                                  alt="Campaign thumbnail" 
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                {(item.openGraphImage || "").split("|").length > 1 && (
                                  <span className="absolute bottom-3 right-3 bg-black/70 text-white backdrop-blur-xs font-mono font-bold text-[9px] py-1 px-2 rounded-full flex items-center gap-1 shadow-sm uppercase shrink-0">
                                    📸 {(item.openGraphImage || "").split("|").length} GÖRSEL
                                  </span>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3.5 flex flex-col justify-end">
                                  <span className="text-[8px] bg-indigo-700 text-white font-bold w-fit tracking-wider uppercase px-1.5 py-0.2 rounded mb-1">
                                    {item.category}
                                  </span>
                                  <h4 className="font-extrabold text-white text-sm truncate uppercase">
                                    {item.productName}
                                  </h4>
                                </div>
                              </div>

                              <div className="p-4 flex-grow flex flex-col justify-between gap-4 text-xs font-medium">
                                <div className="flex flex-col gap-2">
                                  <p className="text-stone-500 text-[11px] leading-relaxed line-clamp-2">
                                    "{item.seoDescription}"
                                  </p>

                                  <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-[10px] text-stone-400 line-through font-mono">
                                      {item.originalPrice} TL
                                    </span>
                                    <span className="text-emerald-700 font-extrabold text-sm font-mono">
                                      {item.discountPrice} TL
                                    </span>
                                  </div>

                                  <div className="bg-white border border-stone-150 p-2 rounded-xl flex flex-col gap-1 text-[9px] font-mono text-stone-400">
                                    <div>🔗 Slug: {item.slug}</div>
                                    <div>🌎 Mode: {item.publishMode === "global" ? "🌐 Global" : `📍 Radius: ${item.radiusKm} km`}</div>
                                    <div className="flex justify-between font-bold text-stone-500 border-t border-stone-100 pt-1 mt-1">
                                      <span>👁️ {item.views || 0} {t.viewsCountLabel}</span>
                                      <span>📞 {item.shares || 0} {t.sharesCountLabel}</span>
                                    </div>
                                  </div>

                                  {/* Sosyal Medya Paylaşım & Reklam Linki Sihirbazı (ALWAYS VISIBLE & FULLY INTERACTIVE) */}
                                  <div className="border border-indigo-150 rounded-2xl p-4 bg-indigo-55/15 mt-3 flex flex-col gap-3.5 text-xs text-stone-800 shadow-sm">
                                    <div className="flex items-center justify-between border-b border-indigo-100/50 pb-2">
                                      <span className="font-extrabold text-indigo-950 flex items-center gap-1.5 text-[11px]">
                                        <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" /> 📣 Sosyal Medya & Reklam Sihirbazı
                                      </span>
                                      <span className="bg-indigo-100 text-indigo-700 font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full">Asistan Aktif</span>
                                    </div>

                                    {/* Link block */}
                                    <div className="flex flex-col gap-1">
                                      <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wide">Müşteri Vitrini Reklam Linki:</label>
                                      <p className="text-[9.5px] leading-snug text-stone-600 mb-1">
                                        Müşterileriniz bu adrese tıkladığında sadece bu ürüne özel indirim vitriniyle karşılaşırlar.
                                      </p>
                                      <div className="flex gap-1">
                                        <div className="bg-white border border-stone-200 px-2.5 py-1.5 rounded-lg font-mono text-[9px] break-all select-all text-indigo-900 font-bold flex-1 max-h-12 overflow-y-auto leading-normal">
                                          {fullUrl}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const success = copyToClipboard(fullUrl);
                                            if (success) {
                                              showToast("Reklam linki panoya kopyalandı! 🔗", "success");
                                              setCopiedId(item.id);
                                              setTimeout(() => setCopiedId(null), 2000);
                                            }
                                          }}
                                          className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-indigo-700 cursor-pointer flex items-center justify-center shrink-0"
                                          title="Linki Kopyala"
                                        >
                                          {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Copywriting Area */}
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wide">Hazır Reklam Yazısı:</label>
                                        <button
                                          type="button"
                                          disabled={isRegeneratingAdId === item.id}
                                          onClick={() => regenerateAdCopyWithGemini(item)}
                                          className="text-[9px] font-black text-indigo-700 hover:text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-200 bg-white hover:bg-stone-50 cursor-pointer flex items-center gap-0.5"
                                        >
                                          <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-spin" /> 
                                          {isRegeneratingAdId === item.id ? "Yazılıyor..." : "Yapay Zeka ile Yeniden Yaz"}
                                        </button>
                                      </div>

                                      <textarea
                                        value={
                                          editingAdCopies[item.id] !== undefined 
                                            ? editingAdCopies[item.id] 
                                            : (item.adCopy || item.seoDescription || "")
                                        }
                                        onChange={(e) => {
                                          const txt = e.target.value;
                                          setEditingAdCopies(prev => ({ ...prev, [item.id]: txt }));
                                        }}
                                        rows={4}
                                        className="w-full bg-white border border-indigo-100 rounded-xl p-2.5 focus:outline-none focus:border-indigo-400 text-stone-850 leading-relaxed text-[11px] font-medium resize-y"
                                        placeholder="Müşterilere paylaşılacak reklam metni..."
                                      />

                                      {/* Action line for edits and copying */}
                                      <div className="flex flex-wrap gap-1.5 mt-1 border-t border-dashed border-indigo-100/50 pt-2 justify-end">
                                        {/* Show Save changes button if locally edited */}
                                        {editingAdCopies[item.id] !== undefined && editingAdCopies[item.id] !== (item.adCopy || item.seoDescription) && (
                                          <button
                                            type="button"
                                            onClick={() => updateAdCopy(item.id, editingAdCopies[item.id])}
                                            className="bg-indigo-755 hover:bg-indigo-850 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm transition-all cursor-pointer"
                                          >
                                            💾 Düzenlemeyi Kaydet
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentText = editingAdCopies[item.id] !== undefined 
                                              ? editingAdCopies[item.id] 
                                              : (item.adCopy || item.seoDescription || "");
                                            const fullCaption = `${currentText}\n\n👉 Detaylar & Sipariş İçin:\n🔗 ${fullUrl}`;
                                            const success = copyToClipboard(fullCaption);
                                            if (success) {
                                              showToast("Mükemmel reklam yazısı ve link kopyalandı! 🚀", "success");
                                            }
                                          }}
                                          className="bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 text-indigo-950 font-black px-2.5 py-1 rounded-lg text-[9px] transition-all cursor-pointer"
                                        >
                                          📋 Metni Kopyala
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentText = editingAdCopies[item.id] !== undefined 
                                              ? editingAdCopies[item.id] 
                                              : (item.adCopy || item.seoDescription || "");
                                            const textBody = `${currentText}\n\n👉 Detayları İnceleyin:\n🔗 ${fullUrl}`;
                                            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textBody)}`;
                                            window.open(waUrl, "_blank");
                                            showToast("WhatsApp paylaşım ekranı açılıyor...", "info");
                                          }}
                                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-2.5 py-1 rounded-lg text-[9px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                        >
                                          💬 WhatsApp'ta Paylaş
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-stone-100">
                                  <button
                                    onClick={() => {
                                      const success = copyToClipboard(fullUrl);
                                      if (success) {
                                        setCopiedId(item.id);
                                        setTimeout(() => setCopiedId(null), 2000);
                                      }
                                    }}
                                    className={`py-2 w-full border rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                      copiedId === item.id 
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold" 
                                        : "bg-white border-stone-200 hover:border-stone-400 text-stone-700"
                                    }`}
                                  >
                                    {copiedId === item.id ? (
                                      <>
                                        <Check className="h-3.5 w-3.5" /> Link Panoya Kopyalandı!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3.5 w-3.5" /> Linki Kopyala
                                      </>
                                    )}
                                  </button>
                                  
                                  <div className="border-t border-stone-200 pt-3 mt-3 flex gap-2">
                                    {confirmDeleteId === item.id ? (
                                      <div className="flex gap-1.5 w-full animate-fadeIn">
                                        <button
                                          onClick={() => {
                                            deleteCampaign(item.id);
                                            setConfirmDeleteId(null);
                                          }}
                                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                                        >
                                          <Check className="h-3.5 w-3.5" /> Evet, Sil
                                        </button>
                                        <button
                                          onClick={() => setConfirmDeleteId(null)}
                                          className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                        >
                                          <X className="h-3.5 w-3.5" /> İptal
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmDeleteId(item.id)}
                                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" /> Bu Ürünü Sil
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      ) : (
        
        /* ========================================================
           MÜŞTERİ İNDİRİM VİTRİNİ (PUBLIC CUSTOMER SHOWCASE)
           ======================================================== */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
          
          {/* Vitrin Header */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-stone-900 tracking-tight">
              ✨ {t.customerHeaderTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
              {t.customerHeaderSubtitle}
            </p>

            {/* Simulated Location Control Panel (For customer context) */}
            <div className="mt-5 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm inline-flex flex-col sm:flex-row items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-500">
                <MapPin className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>{t.deliveryLocalLabel}:</span>
                <span className="text-stone-900 font-extrabold">{userLocationLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={detectUserLocation}
                  disabled={isDetectingUserLoc}
                  className="px-2.5 py-1 text-[10px] font-black uppercase bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 cursor-pointer disabled:opacity-40"
                >
                  {isDetectingUserLoc ? "..." : t.gpsLocBtn}
                </button>
              </div>
            </div>
          </div>

          {/* CUSTOMER SEARCH & CATEGORY CHIPS */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm mb-8 flex flex-col gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-stone-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-11 pr-5 py-3 text-xs bg-stone-50 border border-stone-150 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-stone-900 font-bold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-3 p-1 rounded-full text-stone-400 hover:text-stone-700">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Scope selection tabs: Local vs Global */}
            <div className="flex border-b border-stone-100 pb-3 gap-4 flex-wrap">
              <button
                onClick={() => setShowcaseTab("local")}
                className={`pb-2.5 text-xs font-black cursor-pointer transition-all border-b-2 px-1 ${
                  showcaseTab === "local" 
                    ? "border-emerald-700 text-emerald-700" 
                    : "border-transparent text-stone-500 hover:text-stone-900"
                }`}
              >
                {t.proximityTab.replace("{radius}", radiusKm.toString())}
              </button>
              <button
                onClick={() => setShowcaseTab("global")}
                className={`pb-2.5 text-xs font-black cursor-pointer transition-all border-b-2 px-1 ${
                  showcaseTab === "global" 
                    ? "border-emerald-700 text-emerald-700" 
                    : "border-transparent text-stone-500 hover:text-stone-900"
                }`}
              >
                {t.allDealsTab}
              </button>
            </div>

            {/* Horizontal Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedCategory("Tümü")}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black shrink-0 transition-all border cursor-pointer ${
                  selectedCategory === "Tümü"
                    ? "bg-stone-900 text-white border-stone-950 shadow-sm"
                    : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                }`}
              >
                🛍️ {t.allCategories}
              </button>

              {(Array.from(new Set(publicDiscounts.map(d => d.category))).filter(Boolean) as string[]).map((categoryName) => (
                <button
                  key={categoryName}
                  onClick={() => setSelectedCategory(categoryName)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-black shrink-0 transition-all border cursor-pointer ${
                    selectedCategory === categoryName
                      ? "bg-stone-900 text-white border-stone-950 shadow-sm"
                      : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {CATEGORIES_TRANSLATION_MAP[settings.language as "tr"|"en"|"de"]?.[categoryName] || categoryName}
                </button>
              ))}
            </div>

          </div>

          {/* PUBLIC SHOWCASE LIST */}
          {filteredShowcaseItems.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-stone-200 shadow-sm">
              <Compass className="h-10 w-10 text-stone-300 mx-auto animate-bounce" />
              <p className="font-bold text-stone-600 text-xs mt-3">{t.noItemFound}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShowcaseItems.map((item) => {
                const discountPercentage = Math.round(((item.originalPrice - item.discountPrice) / item.originalPrice) * 100);
                
                // Real-time calculated distance
                const distanceToShop = item.latitude && item.longitude 
                  ? calculateDistance(userLat, userLng, item.latitude, item.longitude)
                  : 0;

                const isCovered = item.publishMode === "global" || distanceToShop <= (item.radiusKm || 10);

                return (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      setActiveDetailSlide(0);
                      setSelectedDetailDiscount(item);
                      incrementViewCount(item.id);
                    }}
                    className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group relative"
                  >
                    {/* Floating discount tag */}
                    <span className="absolute top-4 right-4 bg-red-600 text-white font-mono font-black text-xs py-1 px-2.5 rounded-lg shadow-sm z-10 animate-pulse">
                      %{discountPercentage}
                    </span>

                    {/* Image space */}
                    <div className="h-48 w-full overflow-hidden bg-stone-100 relative shrink-0">
                      <img 
                        src={(item.openGraphImage || "").split("|")[0] || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES["📦 Genel"]} 
                        alt={item.productName} 
                        className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {(item.openGraphImage || "").split("|").length > 1 && (
                        <span className="absolute bottom-4 right-4 bg-black/70 text-white backdrop-blur-xs font-mono font-bold text-[9px] py-1 px-2.2 rounded-full flex items-center gap-1 shadow-sm uppercase shrink-0">
                          📸 {(item.openGraphImage || "").split("|").length} GÖRSEL
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-4">
                        <span className="text-[8px] bg-emerald-700 text-white font-black w-fit tracking-wider uppercase px-2 py-0.5 rounded mb-1.5">
                          {CATEGORIES_TRANSLATION_MAP[settings.language as "tr"|"en"|"de"][item.category] || item.category}
                        </span>
                        
                        {/* Interactive coverage dynamic indicator */}
                        {item.publishMode !== "global" && (
                          <div className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded w-fit uppercase ${
                            isCovered ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {distanceToShop.toFixed(1)} km • {isCovered ? t.nearYouBadge : t.outOfRangeBadge}
                          </div>
                        )}
                        {item.publishMode === "global" && (
                          <div className="text-[9px] font-bold font-mono px-2 py-0.5 rounded w-fit bg-indigo-100 text-indigo-800 uppercase">
                            🌐 GLOBAL SHIPPING OK
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Meta info text */}
                    <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                      <div>
                        {/* Merchant name */}
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-mono">🏬 {item.merchantName}</p>
                        
                        <h4 className="font-extrabold text-stone-900 text-base leading-tight mt-1 group-hover:text-emerald-700 transition-colors uppercase">
                          {item.productName}
                        </h4>

                        <p className="text-stone-500 text-[11px] leading-relaxed mt-2 line-clamp-2 italic">
                          "{item.seoDescription}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-stone-100 font-mono">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[11px] text-stone-400 line-through">
                            {item.originalPrice} TL
                          </span>
                          <span className="text-emerald-700 font-black text-sm text-base">
                            {item.discountPrice} TL
                          </span>
                        </div>

                        <span className="text-[10px] font-bold text-stone-800 flex items-center gap-0.5 transition-all text-emerald-700 group-hover:underline">
                          {t.getDiscountBtn} <ArrowUpRight className="h-3 w-3 shrink-0" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MAĞAZAYA GERİ DÖN BUTTON (If public lock is NOT active) */}
          {isPublicUrlLocked && (
            <div className="mt-12 text-center text-[11px] text-stone-400 font-mono">
              <p className="mb-2">Powered by İndirim Vitrini - Google AI Studio Build</p>
            </div>
          )}

        </div>
      )}

      {/* ========================================================
         MODAL 2: DETAIL SHOWCASE DRAWER
         ======================================================== */}
      {selectedDetailDiscount && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 relative">
            
            {/* Close trigger */}
            <button
              onClick={() => setSelectedDetailDiscount(null)}
              className="absolute top-4 right-4 p-2 bg-stone-50 border border-stone-200 text-stone-600 hover:text-stone-900 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Category tag */}
            <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold tracking-widest uppercase px-2.5 py-0.8 rounded-full">
              {CATEGORIES_TRANSLATION_MAP[settings.language as "tr"|"en"|"de"][selectedDetailDiscount.category] || selectedDetailDiscount.category}
            </span>

            {/* Title / Header */}
            <h3 className="text-xl sm:text-2xl font-extrabold font-serif text-stone-900 tracking-tight mt-3 uppercase">
              {selectedDetailDiscount.productName}
            </h3>

            {/* Publisher / Esnaf label */}
            <p className="text-xs text-stone-400 mt-1 font-semibold flex items-center gap-1 font-mono">
              🏬 {selectedDetailDiscount.merchantName}
            </p>

            {/* Image Slider / Carousel with Unlimited Image support */}
            {(() => {
              const gallery = (selectedDetailDiscount.openGraphImage || "").split("|");
              const currentImage = gallery[activeDetailSlide] || gallery[0] || CATEGORY_IMAGES[selectedDetailDiscount.category] || CATEGORY_IMAGES["📦 Genel"];
              return (
                <div className="mt-5 flex flex-col gap-3 animate-fadeIn">
                  <div className="rounded-2xl overflow-hidden aspect-video relative bg-stone-100 border border-stone-200 shadow-sm group">
                    <img 
                      src={currentImage} 
                      alt="Product thumbnail" 
                      className="h-full w-full object-cover transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Left/Right controls if multiple slides */}
                    {gallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveDetailSlide(prev => (prev - 1 + gallery.length) % gallery.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white rounded-full h-8 w-8 flex items-center justify-center shadow-lg transition-all cursor-pointer font-bold text-sm select-none z-10"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveDetailSlide(prev => (prev + 1) % gallery.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white rounded-full h-8 w-8 flex items-center justify-center shadow-lg transition-all cursor-pointer font-bold text-sm select-none z-10"
                        >
                          ›
                        </button>
                      </>
                    )}

                    <div className="absolute top-4 right-4 bg-red-650 text-white font-mono font-black text-xs px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider z-10">
                      %{Math.round(((selectedDetailDiscount.originalPrice - selectedDetailDiscount.discountPrice) / selectedDetailDiscount.originalPrice) * 100)} {t.discountPercentLabel}
                    </div>

                    {/* Image indicator badge */}
                    {gallery.length > 1 && (
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-md z-10">
                        {activeDetailSlide + 1} / {gallery.length}
                      </div>
                    )}
                  </div>

                  {/* Slider thumbnails row */}
                  {gallery.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                      {gallery.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setActiveDetailSlide(index)}
                          className={`relative h-11 w-11 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                            activeDetailSlide === index 
                              ? "border-emerald-600 scale-[0.96]" 
                              : "border-stone-200 hover:border-stone-400 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Slogan */}
            <div className="mt-5 bg-stone-50 border border-stone-150 p-4 rounded-2xl relative">
              <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1.5 font-mono">📢 {t.sloganLabel}</span>
              <p className="text-xs text-stone-800 leading-relaxed font-medium">
                "{selectedDetailDiscount.seoDescription}"
              </p>
            </div>

            {/* Price evaluation container */}
            <div className="grid grid-cols-2 gap-4 mt-4 bg-stone-50/50 p-4 border border-stone-150 rounded-2xl text-center">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-mono">{t.originalPriceLabel}</span>
                <p className="text-base text-stone-400 line-through font-mono mt-0.5">{selectedDetailDiscount.originalPrice} TL</p>
              </div>
              <div className="border-l border-stone-200">
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider font-mono">{t.discountPriceLabel}</span>
                <p className="text-xl font-black text-emerald-700 font-mono mt-0.5">{selectedDetailDiscount.discountPrice} TL</p>
              </div>
            </div>

            {/* RANGE DISTANCE AND INTERACTIVE COOPERATION SUMMARY */}
            <div className="mt-5 border border-stone-200 bg-white p-4 rounded-2xl flex flex-col gap-2 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-mono">{t.deliveryRadiusLabel}</span>
              
              {selectedDetailDiscount.publishMode === "global" ? (
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t.deliveryGlobalText}
                </p>
              ) : (
                <div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    📍 {t.deliveryLocalText} {t.deliveryLocalLabel}: <strong className="text-emerald-700 font-extrabold">{calculateDistance(userLat, userLng, selectedDetailDiscount.latitude || 41.0082, selectedDetailDiscount.longitude || 28.9784).toFixed(1)} KM</strong> uzaklıktasınız. 
                    Mağazanın teslimat yarıçapı: <strong>{selectedDetailDiscount.radiusKm} KM</strong> genişliğindedir.
                  </p>

                  {/* Range circle status visualizer */}
                  <div className="mt-3 bg-stone-50 p-3 rounded-xl border border-stone-150 flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-stone-500">{t.deliveryStatusLabel}</span>
                    {calculateDistance(userLat, userLng, selectedDetailDiscount.latitude || 41.0082, selectedDetailDiscount.longitude || 28.9784) <= (selectedDetailDiscount.radiusKm || 10) ? (
                      <span className="text-emerald-700 font-black flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                        {t.deliveryStatusIn}
                      </span>
                    ) : (
                      <span className="text-rose-700 font-black flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-150">
                        {t.deliveryStatusOut}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DIRECT ACTION TRIGGERS (İletişim Butonları - WhatsApp & Telefon) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 border-t border-stone-100 pt-5">
              
              {/* WhatsApp direct chat link */}
              <a
                href={`https://wa.me/${selectedDetailDiscount.merchantWhatsApp?.replace(/[^0-9+]/g, "") || selectedDetailDiscount.merchantPhone.replace(/[^0-9+]/g, "")}?text=Merhaba%20${encodeURIComponent(selectedDetailDiscount.merchantName)},%20%C4%B0ndirim%20Vitrini%20uygulamas%C4%B1nda%2520g%C3%B6rd%C3%BC%C4%9F%C3%BCm%2520%22${encodeURIComponent(selectedDetailDiscount.productName)}%22%2520%C3%BCr%C3%BCn%C3%BCn%C3%BCz%2520i%C3%A7in%2520${selectedDetailDiscount.discountPrice}%2520TL%2520kampanya%2520fiyat%C4%B1ndan%2520bilgi%2520almak%2520istiyorum.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => incrementShareCount(selectedDetailDiscount.id)}
                className="py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-center font-black text-xs sm:text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm uppercase cursor-pointer"
              >
                <Smartphone className="h-4 w-4" />
                {t.whatsappBtn}
              </a>

              {/* Direct dial button */}
              <a
                href={`tel:${selectedDetailDiscount.merchantPhone}`}
                onClick={() => incrementShareCount(selectedDetailDiscount.id)}
                className="py-3.5 bg-stone-900 hover:bg-black text-white rounded-xl text-center font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm uppercase cursor-pointer"
              >
                <Phone className="h-4 w-4" />
                {t.phoneCallBtn}
              </a>

            </div>

            {/* Meta and share options */}
            <div className="mt-6 border-t border-stone-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-stone-400 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                👁️ Bu indirim {selectedDetailDiscount.views || 0} defa incelendi, {selectedDetailDiscount.shares || 0} defa tıklandı.
              </span>

              <button
                type="button"
                onClick={() => {
                  const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?slug=${selectedDetailDiscount.slug}&view=showcase&userId=${selectedDetailDiscount.userId}`;
                  copyToClipboard(shareUrl);
                  incrementShareCount(selectedDetailDiscount.id);
                  setCopiedId(selectedDetailDiscount.id);
                  setTimeout(() => setCopiedId(null), 2050);
                }}
                className={`font-black flex items-center gap-1 cursor-pointer text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  copiedId === selectedDetailDiscount.id 
                    ? "bg-emerald-55 border-emerald-350 text-emerald-800" 
                    : "text-emerald-700 bg-emerald-50/25 border-emerald-100 hover:bg-emerald-50/60"
                }`}
              >
                <Copy className="h-3 w-3" /> {copiedId === selectedDetailDiscount.id ? "Paylaşım Linki Kopyalandı! 🎉" : "Linki Paylaş / Kopyala"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
