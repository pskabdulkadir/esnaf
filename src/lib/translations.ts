export interface TranslationSet {
  // Sidebar tabs
  tabDashboard: string;
  tabSales: string;
  tabInventory: string;
  tabExpenses: string;
  tabLookup: string;
  tabAutomation: string;
  tabContact: string;
  tabMarketer: string;
  tabGuide: string;

  // Header & Global Shell
  corpPortal: string;
  addChangeBrand: string;
  currentRoleManager: string;
  currentRoleOperator: string;
  roleChangeBtn: string;
  factoryResetBtn: string;
  systemItems: string;
  catalogTable: string;
  criticalAlerts: string;
  salesLogTable: string;
  expensesTable: string;
  realtimeMapped: string;
  sqliteSovereignty: string;
  deviceIdentity: string;
  portalVersion: string;
  offlineGrace: string;
  cloudLicenseStatus: string;
  downloadData: string;
  uploadData: string;
  backupInfo: string;
  sqliteDump: string;
  catalog: string;
  sales: string;
  expenses: string;
  systemTime: string;

  // Dashboard View
  controlPanel: string;
  overviewSubtitle: string;
  kpiSalesVolume: string;
  kpiTotalExpenses: string;
  kpiNetProfit: string;
  kpiProfitMargin: string;
  kpiCriticalStocks: string;
  itemsLabel: string;
  salesChartTitle: string;
  expensesChartTitle: string;
  topProductsTitle: string;
  topProductsSubtitle: string;
  revenueLabel: string;
  quantityLabel: string;
  criticalNoticeTitle: string;
  criticalNoticeSubtitle: string;
  resolveNowBtn: string;

  // Sales Entry View
  cashSalesPoint: string;
  salesPointSubtitle: string;
  barcodeInputPlaceholder: string;
  scanBarcodeBtn: string;
  productName: string;
  quantity: string;
  pricePerUnit: string;
  subtotal: string;
  addToCartBtn: string;
  shoppingCart: string;
  emptyCart: string;
  applyDiscount: string;
  totalAmount: string;
  completeSaleBtn: string;
  cannotExceedStock: string;
  saleCompletedSuccess: string;
  searchProductPlaceholder: string;

  // Inventory View
  invHeaderTitle: string;
  invHeaderSubtitle: string;
  searchProductLbl: string;
  filterAll: string;
  filterCritical: string;
  addProductBtn: string;
  totalStockCount: string;
  totalStockInv: string;
  profitPotential: string;
  colId: string;
  colName: string;
  colBarcode: string;
  colCategory: string;
  colPurchasePrice: string;
  colSalePrice: string;
  colCurrentStock: string;
  colActions: string;
  editProductModalTitle: string;
  newProductModalTitle: string;
  requiredFieldsError: string;
  saveBtn: string;
  cancelBtn: string;
  generateBarcode: string;
  cameraScanLabel: string;

  // Expenses View
  expHeaderTitle: string;
  expHeaderSubtitle: string;
  addExpenseBtn: string;
  colDescription: string;
  colAmount: string;
  colDate: string;
  colCategoryName: string;
  expenseCategoryTax: string;
  expenseCategoryLogistics: string;
  expenseCategoryOps: string;
  newExpenseModalTitle: string;

  // Quick Lookup View
  lookupHeaderTitle: string;
  lookupHeaderSubtitle: string;
  barcodeSearchPlaceholder: string;
  lookupFound: string;
  lookupNotFound: string;
  scanCameraLabel: string;

  // Automation & Bots View
  autoHeaderTitle: string;
  autoHeaderSubtitle: string;
  botStatus: string;
  botActive: string;
  botInactive: string;
  startBotBtn: string;
  stopBotBtn: string;
  crmRetentionRules: string;
  ruleLabel: string;
  dispatchTimer: string;
  whatsappDeliveryQueue: string;
  emptyQueue: string;
  systemActivityLogs: string;
  clearLogsBtn: string;

  // Contact Center View
  contactHeaderTitle: string;
  contactHeaderSubtitle: string;
  addNewContactBtn: string;
  fullNameLabel: string;
  phoneLabel: string;
  customerSegmentLabel: string;
  notesLabel: string;
  phoneCallBtn: string;
  whatsappMessageBtn: string;
  newContactModalTitle: string;

  // Marketer View
  marketerLogoLabel: string;
  marketerSubtitle: string;
  marketerEsnafTitle: string;
  marketerCustomerTitle: string;
  marketerSettingsTab: string;
  marketerAddDiscountTab: string;
  marketerPortfolioTab: string;
  marketerStoreNameLabel: string;
  marketerPhoneLabel: string;
  marketerWhatsappLabel: string;
  marketerActiveCount: string;
  marketerCampaignDetails: string;
  marketerCampaignSubtitle: string;
  marketerCategoryLabel: string;
  marketerProductNameLabel: string;
  marketerOriginalPriceLabel: string;
  marketerDiscountPriceLabel: string;
  marketerDiscountPercentLabel: string;
  marketerSloganLabel: string;
  marketerSloganPlaceholder: string;
  marketerPublishScopeLabel: string;
  marketerRadiusLabel: string;
  marketerGlobalLabel: string;
  marketerRadiusKmLabel: string;
  marketerLocationSelectorLabel: string;
  marketerGpsLocBtn: string;
  marketerAddressLabel: string;
  marketerPublishBtn: string;
  marketerPreviewBtn: string;
  marketerPreviewTip: string;
  marketerActivePortfolioTitle: string;
  marketerActivePortfolioSubtitle: string;
  marketerViewsCountLabel: string;
  marketerSharesCountLabel: string;
  marketerDeleteBtn: string;
  marketerCopiedAlert: string;
  marketerCustomerHeaderTitle: string;
  marketerCustomerHeaderSubtitle: string;
  marketerAllCategories: string;
  marketerProximityTab: string;
  marketerAllDealsTab: string;
  marketerSearchPlaceholder: string;
  marketerDistanceLabel: string;
  marketerNearYouBadge: string;
  marketerOutOfRangeBadge: string;
  marketerGetDiscountBtn: string;
  marketerWhatsappBtn: string;
  marketerPhoneCallBtn: string;
  marketerShareDisclaimer: string;
  marketerCloseBtn: string;
  marketerHowMuchDusted: string;
  marketerDeliveryRadiusLabel: string;
  marketerDeliveryGlobalText: string;
  marketerUnlimitedImagesTitle: string;
  marketerUnlimitedImagesDesc: string;
  marketerLocalAiGeneratorBtn: string;
  marketerFreeTag: string;

  // Interactive User Manual & Voice Assistant
  guideTitle: string;
  guideSubtitle: string;
  guideSequenceTab: string;
  guideVoiceAssistantTitle: string;
  guideMuteButton: string;
  guideUnmuteButton: string;
  guideReadAloudBtn: string;
  guideStopVoiceBtn: string;
  guideIsMutedStatus: string;
  guideIsReadingStatus: string;
  guideStep1Title: string;
  guideStep1Desc: string;
  guideStep2Title: string;
  guideStep2Desc: string;
  guideStep3Title: string;
  guideStep3Desc: string;
  guideStep4Title: string;
  guideStep4Desc: string;
  guideStep5Title: string;
  guideStep5Desc: string;
  guideStep6Title: string;
  guideStep6Desc: string;
  guideClickReadLabel: string;
}

export const TRANSLATIONS: Record<'tr' | 'en' | 'de', TranslationSet> = {
  tr: {
    tabDashboard: "Yönetim Kontrol Paneli",
    tabSales: "Kasa Satış Ekranı",
    tabInventory: "Depo ve Envanter Yönetimi",
    tabExpenses: "Giderler ve Harcamalar",
    tabLookup: "Barkod ile Hızlı Arama",
    tabAutomation: "Otomasyon & Botlar",
    tabContact: "İletişim Merkezi",
    tabMarketer: "Pazarlamacı",
    tabGuide: "Kullanım Kılavuzu & Sesli Asistan",

    corpPortal: "KURUMSAL PORTAL",
    addChangeBrand: "✍️ Şirket Adı Ekle/Değiştir",
    currentRoleManager: "Mevcut Yetki: Yönetici",
    currentRoleOperator: "Mevcut Yetki: Görevli",
    roleChangeBtn: "DEĞİŞTİR",
    factoryResetBtn: "Sistem Fabrika Ayarlarına Şablon Gönder",
    systemItems: "Sistem Kalemleri (SQLite)",
    catalogTable: "Katalog Tablosu",
    criticalAlerts: "Kritik Uyarılar",
    salesLogTable: "Satış Log Tablosu",
    expensesTable: "Gider Tablosu",
    realtimeMapped: "Gerçek SQLite Relational Tabloları Mapped.",
    sqliteSovereignty: "SQLite Veri Egemenliği",
    deviceIdentity: "Cihaz Kimliği",
    portalVersion: "Portal Sürüm",
    offlineGrace: "⚡ Çevrimdışı Tolerans Aktif",
    cloudLicenseStatus: "Bulut Lisans Durumu",
    downloadData: "VERİLERİ İNDİR",
    uploadData: "VERİLERİ YÜKLE",
    backupInfo: "💾 Tüm verilerinizi güvenli şekilde indirin. Tarayıcı sıfırlandığında yeniden yükleyin.",
    sqliteDump: "SQLITE DUMP (.SQL)",
    catalog: "Katalog",
    sales: "Satış",
    expenses: "Gider",
    systemTime: "SİSTEM SAATİ",

    controlPanel: "Yönetim Kontrol Paneli",
    overviewSubtitle: "Küresel operasyonların, satış otomasyonlarının ve stok kontrollerinin gerçek zamanlı genel görünümü.",
    kpiSalesVolume: "Toplam Satış Hacmi",
    kpiTotalExpenses: "Toplam Gider Miktarı",
    kpiNetProfit: "Net Kar/Zarar",
    kpiProfitMargin: "Brüt Kar Marjı",
    kpiCriticalStocks: "Kritik Stok Uyarıları",
    itemsLabel: "kalem",
    salesChartTitle: "Günlük Satış Trendleri (TL)",
    expensesChartTitle: "Gider Türü Dağılım Grafiği (TL)",
    topProductsTitle: "En Çok Satan Ürünler Liderlik Tablosu",
    topProductsSubtitle: "Tüm finansal dönemler içinde ciro bazlı sıralamadır.",
    revenueLabel: "Ciro",
    quantityLabel: "Adet",
    criticalNoticeTitle: "Depoda kritik düzeyde düşük stoklu ürünler tespit edildi!",
    criticalNoticeSubtitle: "Müşterilerin durma noktasına gelmemesi için envanter yenilemesi sipariş etmelisiniz veya hemen 'Kritik' filtreye giderek detayları inceleyin.",
    resolveNowBtn: "Envantere Git",

    cashSalesPoint: "Kasa Hızlı Satış Noktası (POS)",
    salesPointSubtitle: "Manuel barkod girişi veya hızlı katalog üzerinden ürün ekleyerek anında SQLite onaylı fiziksel satış kayıt edin.",
    barcodeInputPlaceholder: "Ürün Barkodunu girin veya sağdaki listeden seçin...",
    scanBarcodeBtn: "Kamera Barkod Tara",
    productName: "Ürün Adı",
    quantity: "Miktar (Adet)",
    pricePerUnit: "Fiyat / Adet",
    subtotal: "Ara Toplam",
    addToCartBtn: "Sepete Ekle & Güncelle",
    shoppingCart: "Müşteri Kasa Sepeti",
    emptyCart: "Sepetiniz henüz boş. Barkod okutun veya aşağıdan katalogdan ekleyin.",
    applyDiscount: "İskonto / İndirim Oranı",
    totalAmount: "Genel Ödenecek Tutar",
    completeSaleBtn: "Ödemeyi Al ve Satışı Tamamla",
    cannotExceedStock: "Hata: Girdiğiniz miktar mevcut stok miktarını aşamaz!",
    saleCompletedSuccess: "SQLite Onaylandı: Satış başarıyla sisteme işlendi, stoktan tüşürüldü!",
    searchProductPlaceholder: "Katalogda tıkla-ekle arama...",

    invHeaderTitle: "Depo ve Envanter Yönetimi",
    invHeaderSubtitle: "Depodaki ürünlerin gerçek zamanlı listesi, maliyet hesapları ve barkod kayıt merkezi.",
    searchProductLbl: "Ürün ara (Ad, Barkod, ID)...",
    filterAll: "Tüm Ürünler ({count})",
    filterCritical: "⚠️ Stok Alarmı Verenler ({count})",
    addProductBtn: "➕ Yeni Ürün Ekle",
    totalStockCount: "Mevcut Toplam Adet",
    totalStockInv: "Depo Giriş Maliyeti",
    profitPotential: "Beklenen Toplam Brüt Kar",
    colId: "ÜRÜN ID",
    colName: "ÜRÜN ADI & KATEGORİ",
    colBarcode: "BARKOD KODU",
    colCategory: "KATEGORİ",
    colPurchasePrice: "ALIŞ FİYATI",
    colSalePrice: "SATIŞ FİYATI",
    colCurrentStock: "RAFTA/STOKTA",
    colActions: "İŞLEMLER",
    editProductModalTitle: "Ürün Kartı Düzenle",
    newProductModalTitle: "Yeni Ürün Kayıt Kartı",
    requiredFieldsError: "Lütfen tüm zorunlu alanları doldurunuz!",
    saveBtn: "Kaydet",
    cancelBtn: "Vazgeç",
    generateBarcode: "Rastgele Üret",
    cameraScanLabel: "Kamerayla Tara",

    expHeaderTitle: "Giderler ve Finansal Harcamalar",
    expHeaderSubtitle: "İşletmeye ait vergi, lojistik ve operasyonel giderlerin dökümü ve cari kayıt logları.",
    addExpenseBtn: "➕ Yeni Gider Beyannamesi Girişi",
    colDescription: "HARCAMA DETAYI / AÇIKLAMA",
    colAmount: "MİKTAR",
    colDate: "HARCAMA TARİHİ",
    colCategoryName: "GİDER TÜRÜ",
    expenseCategoryTax: "Vergi Beyannamesi",
    expenseCategoryLogistics: "Lojistik / Mazot",
    expenseCategoryOps: "Operasyonel Maliyet",
    newExpenseModalTitle: "Yeni Gider Fişi Kaydet",

    lookupHeaderTitle: "Barkod ile Hızlı Sorgulama",
    lookupHeaderSubtitle: "Müşteri önünde ürün barkodunu okutarak fiyata, stoğa ve kritik seviyeye anında erişin.",
    barcodeSearchPlaceholder: "Barkod numarasını buraya yazın veya kamerayı başlatın...",
    lookupFound: "Ürün Başarıyla Sorgulandı",
    lookupNotFound: "Katalogda bu barkoda ait bir ürün bulunamadı. Lütfen barkod numarasını kontrol edin.",
    scanCameraLabel: "Sorgu Kamerasını Başlat",

    autoHeaderTitle: "Otomasyon ve Bot Kanalları",
    autoHeaderSubtitle: "Siftah-Bot arka planda çalışarak müşteriyi takip eder, son kullanma tarihlerini analiz eder ve ciro artırır.",
    botStatus: "Siftah-Bot Aktiflik Durumu",
    botActive: "AKTİF ÇALIŞIYOR (Dinlemede)",
    botInactive: "DURDURULDU (Çevrimdışı)",
    startBotBtn: "Otomasyonu Başlat",
    stopBotBtn: "Botu Durdur",
    crmRetentionRules: "Aktif Yapay Zekasız Müşteri Elde Tutma Kuralları",
    ruleLabel: "Kural",
    dispatchTimer: "Periyodik Gönderim Sıklığı",
    whatsappDeliveryQueue: "Bekleyen WhatsApp Sevk/Gönderim Kuyruğu",
    emptyQueue: "Gönderim kuyruğunda bekleyen sevk kaydı bulunmamaktadır.",
    systemActivityLogs: "Otomasyon Sistem Logları",
    clearLogsBtn: "Günlüğü Temizle",

    contactHeaderTitle: "Komşu & Müşteri İletişim Rehberi",
    contactHeaderSubtitle: "Müşterilerinizin segment grupları, özel notları ve telefon rehberi kayıtları.",
    addNewContactBtn: "➕ Yeni Kişi Ekle",
    fullNameLabel: "Ad Soyadı",
    phoneLabel: "Telefon Numarası",
    customerSegmentLabel: "Segment Sınıfı",
    notesLabel: "Müşteri Notu",
    phoneCallBtn: "Hızlı Ara",
    whatsappMessageBtn: "Aç",
    newContactModalTitle: "Yeni Müşteri Kartı Tanımla",

    marketerLogoLabel: "Kurumsal İndirim Vitrini & Reklam Portalı",
    marketerSubtitle: "Müşterileriniz için tamamen ücretsiz, sınırsız ve reklamsız açık kaynaklı indirim vitrini tanımlayın.",
    marketerEsnafTitle: "Esnaf Panel",
    marketerCustomerTitle: "Müşteri Vitrini",
    marketerSettingsTab: "Dil & Şirket İletişimi",
    marketerAddDiscountTab: "➕ Yeni İndirimli Reklam Tanımla",
    marketerPortfolioTab: "📚 Yayındaki Reklam Portföyü",
    marketerStoreNameLabel: "Mağaza / İşletme Adı",
    marketerPhoneLabel: "Telefon Numarası",
    marketerWhatsappLabel: "WhatsApp İletişim",
    marketerActiveCount: "Şu an Canlı Yayındaki Kampanya Sayısı",
    marketerCampaignDetails: "Reklam ve İndirim Kampanya Kartı Girişi",
    marketerCampaignSubtitle: "Bilgileri girin, ücretsiz sınırsız yerel algoritmik botlarımızla saniyeler içinde büyüleyici pazarlama sloganınızı ve SEO başlıklarını anında oluşturun.",
    marketerCategoryLabel: "Ürün Kategorisi",
    marketerProductNameLabel: "Ürün Adı",
    marketerOriginalPriceLabel: "Orijinal Satış Fiyatı (TL)",
    marketerDiscountPriceLabel: "Afiş/Kampanya Fiyatı (TL)",
    marketerDiscountPercentLabel: "Kazanç Oranı",
    marketerSloganLabel: "Müşterileri Ceveden Harika Reklam Metni",
    marketerSloganPlaceholder: "Müşterilere WhatsApp ve web aramalarında gösterilecek heyecan verici kampanya metnini buraya girin...",
    marketerPublishScopeLabel: "Hedef Kitle & Lokasyon Erişim Alanı",
    marketerRadiusLabel: "Lokasyon Yarıçapı Sınırı",
    marketerGlobalLabel: "Uluslararası / Kargo ile Teslim",
    marketerRadiusKmLabel: "İşletme Teslimat Mesafe Limiti",
    marketerLocationSelectorLabel: "Harita Üzerinde İşletme Konumu",
    marketerGpsLocBtn: "Cihaz GPS Konumunu Al",
    marketerAddressLabel: "Açık Yol Adresi",
    marketerPublishBtn: "REKLAMI ŞİMDİ CANLI VİTRİNE EKLE!",
    marketerPreviewBtn: "MÜŞTERİ VİTRİN KANTI ANLIK ÖNİZLEMESİ",
    marketerPreviewTip: "Bu kart, müşterilerin web sayfasında göreceği mobil uyumlu akıllı tasarımdır.",
    marketerActivePortfolioTitle: "Yayındaki Aktif Reklam Portföyünüz",
    marketerActivePortfolioSubtitle: "Ürünlerinizin analizlerini takip edin, düzenleme yapın veya yayından kaldırın.",
    marketerViewsCountLabel: "Kişi Görüntüledi",
    marketerSharesCountLabel: "Kişi Paylaştı/İletişime Geçti",
    marketerDeleteBtn: "Yayından Kaldır",
    marketerCopiedAlert: "Kampanya WhatsApp paylaşım linki başarıyla panoya kopyalandı! 🚀",
    marketerCustomerHeaderTitle: "Çevrenizdeki Taze Esnaf Fırsatları",
    marketerCustomerHeaderSubtitle: "Mahallenizin dürüst esnafından doğrudan aracısız, komisyon ödemeden taze indirimler! WhatsApp ile hemen sipariş verin.",
    marketerAllCategories: "Tüm İndirimler",
    marketerProximityTab: "📍 En Yakın Fırsatlar",
    marketerAllDealsTab: "🌐 Global Kampanyalar",
    marketerSearchPlaceholder: "İndirimlerde ve kampanyalarda ara...",
    marketerDistanceLabel: "Uzaklık Mesafesi",
    marketerNearYouBadge: "Yakınınızda",
    marketerOutOfRangeBadge: "Menzil Dışı",
    marketerGetDiscountBtn: "Kampanya Kartını İncele",
    marketerWhatsappBtn: "WhatsApp Sipariş Hattı",
    marketerPhoneCallBtn: "Doğrudan Telefonla Ara",
    marketerShareDisclaimer: "WhatsApp, Instagram veya Facebook üzerinden bu kampanyayı yönlendirebilirsiniz.",
    marketerCloseBtn: "Detayları Kapat",
    marketerHowMuchDusted: " TL İNDİRİM!",
    marketerDeliveryRadiusLabel: "📍 Sevk ve Ulaştırma Alanı:",
    marketerDeliveryGlobalText: "🌐 Dünya Geneline Teslimat: Bu ürün konum sınırlaması olmaksızın kargo veya kuryeyle her yere ulaştırılır.",
    marketerUnlimitedImagesTitle: "Ürün Görseli Galerisi (Sınırsız Görsel)",
    marketerUnlimitedImagesDesc: "İstediğiniz kadar ürün resmi yükleyin veya internet URL'si girin. Sınırsız fotoğraf galerisi oluşturulacaktır.",
    marketerLocalAiGeneratorBtn: "✨ Esnaf-Metin Botuyla Slogan & SEO Yaz (Ücretsiz & Sınırsız)",
    marketerFreeTag: "AÇIK KAYNAK ÜCRETSİZ MOTOR",

    // User Manual & Voice Assistant
    guideTitle: "Esnaf Portal Kullanım Kılavuzu",
    guideSubtitle: "Tüm panelleri, butonları ve akışları adım adım sesli ve yazılı anlatan interaktif kılavuz.",
    guideSequenceTab: "Sıralı Adım Adım Akış Şeması",
    guideVoiceAssistantTitle: "Yapay Zekasız Sesli Asistan",
    guideMuteButton: "🔊 Sesi Aç",
    guideUnmuteButton: "🔇 Sesi Sustur",
    guideReadAloudBtn: "▶️ Bu Adımı Seslendir",
    guideStopVoiceBtn: "⏹️ Durdur",
    guideIsMutedStatus: "Ses Durumu: SUSTURULDU",
    guideIsReadingStatus: "Okuma Durumu: AKTİF",
    guideStep1Title: "Aşama 1: Envanter & Depo Girişi (Ürün Ekleme)",
    guideStep1Desc: "Sistemi kullanmaya başlarken ilk yapmanız gereken 'Depo ve Envanter Yönetimi' sekmesine girerek 'Yeni Ürün Ekle' butonuyla ürünlerinizi kaydetmektir. Alış fiyatı, satış fiyatı ve 'Kritik Stok Sınırı' (stok bu sayının altına düştüğünde uyarı verir) girmelisiniz. Ayrıca kasanızın yanındayken 'Rastgele Üret' butonuyla anında barkod kodu atayabilir veya kamera butonuyla taranmasını sağlayabilirsiniz. Tüm bu kayıtlar tarayıcınızdaki gerçek, yerel ve egemen SQLite veritabanınıza anında, güvenli şekilde kaydedilir.",
    guideStep2Title: "Aşama 2: Kasa Hızlı Satış Ekranı ve Stok Düşümleri",
    guideStep2Desc: "Mağazanızda bir ürün satıldığında 'Kasa Satış Ekranı' sekmesine gidin. Ürünlerinizi ister listeden üstüne tıklayarak ister barkod girişi alanına yazarak sepetinize ekleyin. Satış miktarını belirtin, isterseniz iskonto uygulayın. 'Ödemeyi Al ve Satışı Tamamla' butonuna bastığınızda, satış SQLite veritabanına işlenirken Otomasyon Motoru depodaki mevcut stok miktarından satılan hammadde miktarını otomatik olarak düşer. Böylece envanteriniz her saniye hatasız kalır.",
    guideStep3Title: "Aşama 3: Gider ve Cari Maliyet Beyannameleri",
    guideStep3Desc: "Kar ve zarar tablolarınızın doğru hesaplanması için sadece satışı değil, cari harcamaları da girmelisiniz. 'Giderler ve Harcamalar' sekmesine gidip 'Yeni Gider Beyannamesi Girişi' butonuyla vergi ödemelerini, lojistik maliyetleri (akaryakıt, kurye) veya genel operasyon masraflarını cari kayda geçirin. Bu işlem, 'Yönetim Kontrol Paneli'ndeki Net Kar/Zarar göstergesini ve maliyet pasta grafiğini otomatik ve anlık olarak güncelleyecektir.",
    guideStep4Title: "Aşama 4: Pazarlamacı & Sınırsız Görselli Reklam Vitrini",
    guideStep4Desc: "İndirim veya kampanyalarınızı tüm mahallenize duyurmak için 'Pazarlamacı' sekmesine gelin. 'Yeni İndirimli Reklam Tanımla' kısmında esnaf isminizi, telefonunuzu ve ürünü tanımlayın. Ürün Görseli ekleme bölümünde 'Sınırsız Görsel' desteğiyle, cihazınızdan dilediğiniz kadar fotoğrafı yükleyebilir veya web adreslerini ekleyerek zengin bir galeri kurabilirsiniz. 'Esnaf-Metin Botu' butonu ile hiçbir yapay zeka ücreti ödemeden, tamamen sınırsız ve tescilli algoritmamızla seçtiğin kategoriye özel Türkçe, İngilizce veya Almanca muazzam reklam sloganları üretebilirsiniz. Reklamı yayınladığınızda, müşterilerinize gönderebileceğiniz veya sosyal medyada paylaşabileceğiniz canlı indirim vitrin linki oluşturulur.",
    guideStep5Title: "Aşama 5: Otomasyon Kuralları & Siftah-Bot Müşteri Takibi",
    guideStep5Desc: "Müşterilerinizi sürekli dükkanınıza çekmek istiyorsanız 'Otomasyon & Botlar' sekmesine gidin 'Otomasyonu Başlat' butonuyla Siftah-Bot'u devreye alın. Bot, son kullanma tarihi yaklaşan veya depoda gereksiz biriken stok fazlası ürünleri periyodik olarak analiz ederek, hangi müşteri segmentine (Ev Hanımları, Gençler veya Genel) hangi indirim oranın sunulması gerektiğini belirler ve sevk kuyruğu oluşturur. 'İletişim' rehberine eklediğiniz müşterilerinize bu sevk mesajlarını WhatsApp üzerinden otomatik formatta kolayca gönderebilirsiniz.",
    guideStep6Title: "Aşama 6: SQLite Veri Egemenliği ve Çift Taraflı Yedekleme",
    guideStep6Desc: "Bu sistem internet kesintilerinden etkilenmeyen veri egemenliğiyle çalışır. Verilerinizi güvenceye almak için sol panel altındaki 'VERİLERİ İNDİR' butonunu kullanarak tüm veri yapınızı tek tıklamayla bilgisayarınıza yedekleyin. Tarayıcınız sıfırlansa bile 'VERİLERİ YÜKLE' butonuyla sıfır kayıpla anında sistemi canlandırabilirsiniz. Alternatif olarak, 'SQLITE DUMP (.SQL)' butonu ile standart SQL formatında veya CSV formatlarında veri çıktılarını alarak Excel'e aktarabilirsiniz.",
    guideClickReadLabel: "👉 Herhangi bir adıma tıklayarak sistemi sesli olarak asistanımızdan dinleyebilirsiniz!"
  },
  en: {
    tabDashboard: "Management Dashboard",
    tabSales: "POS Cash Counter",
    tabInventory: "Inventory & Warehouse",
    tabExpenses: "Expenses & Costs",
    tabLookup: "Barcode Lookup",
    tabAutomation: "Automation & Bots",
    tabContact: "Contact Hub",
    tabMarketer: "Marketing Desk",
    tabGuide: "User Guide & Voice Assistant",

    corpPortal: "ENTERPRISE PORTAL",
    addChangeBrand: "✍️ Edit Brand/Company Name",
    currentRoleManager: "Role: Administrator",
    currentRoleOperator: "Role: Operator",
    roleChangeBtn: "CHANGE",
    factoryResetBtn: "Send Default Template to Factory Settings",
    systemItems: "System Database Entities (SQLite)",
    catalogTable: "Store Catalog",
    criticalAlerts: "Critical Stock Alerts",
    salesLogTable: "Sales History Logs",
    expensesTable: "Expense Records Table",
    realtimeMapped: "Real SQLite Relational Tables Mapped.",
    sqliteSovereignty: "SQLite Data Sovereignty",
    deviceIdentity: "Device ID",
    portalVersion: "Portal Version",
    offlineGrace: "⚡ Offline Grace Period Active",
    cloudLicenseStatus: "License Verification Status",
    downloadData: "DOWNLOAD ALL DATA",
    uploadData: "UPLOAD RESTORE YEDEK",
    backupInfo: "💾 Securely download your databases. Upload back in case of cache clear.",
    sqliteDump: "SQLITE DUMP (.SQL)",
    catalog: "Catalog",
    sales: "Sales",
    expenses: "Expenses",
    systemTime: "SYSTEM TIME",

    controlPanel: "Management Dashboard",
    overviewSubtitle: "Real-time consolidated overview of global commerce operations, sales automation, and inventory control.",
    kpiSalesVolume: "Total Sales Revenue",
    kpiTotalExpenses: "Total Expense Amount",
    kpiNetProfit: "Net Profit / Loss",
    kpiProfitMargin: "Gross Profit Margin",
    kpiCriticalStocks: "Critical Stock Warnings",
    itemsLabel: "items",
    salesChartTitle: "Daily Sales Trends (CURRENCY)",
    expensesChartTitle: "Expenses Break-Down Chart (CURRENCY)",
    topProductsTitle: "Top Selling Products Leaderboard",
    topProductsSubtitle: "Ranked based on total turnover within current financial cycle.",
    revenueLabel: "Turnover",
    quantityLabel: "Qty",
    criticalNoticeTitle: "Critically low stock detected in warehouse!",
    criticalNoticeSubtitle: "Please order inventory replenishment to prevent retail disruption. Go to 'Critical' filter for detailed lines.",
    resolveNowBtn: "Go to Inventory",

    cashSalesPoint: "POS Quick Sales Point",
    salesPointSubtitle: "Register physical sales verified via local SQLite instantly by typing barcode or selecting from catalog list below.",
    barcodeInputPlaceholder: "Enter barcode or tap product from below list...",
    scanBarcodeBtn: "Camera Barcode Reader",
    productName: "Product Name",
    quantity: "Quantity (Unit)",
    pricePerUnit: "Price / Unit",
    subtotal: "Subtotal",
    addToCartBtn: "Put to Cart & Update",
    shoppingCart: "Customer Cart",
    emptyCart: "Your cart is empty. Scan barcode or tap products from catalog below.",
    applyDiscount: "Discount Rate (%)",
    totalAmount: "Grand Total Due",
    completeSaleBtn: "Receive Payment & Finish Sale",
    cannotExceedStock: "Error: Entered quantity cannot exceed current inventory stock!",
    saleCompletedSuccess: "SQLite Verified: Sale processed, product stock updated in real time!",
    searchProductPlaceholder: "Search catalog to click & insert...",

    invHeaderTitle: "Inventory & Warehouse Controls",
    invHeaderSubtitle: "Real-time catalog listing, investment metrics, and integrated barcode scanner setup.",
    searchProductLbl: "Search item (Name, Barcode, ID)...",
    filterAll: "All Catalogue ({count})",
    filterCritical: "⚠️ Stock Alarm ({count})",
    addProductBtn: "➕ Create New Product",
    totalStockCount: "Consolidated Physical Qty",
    totalStockInv: "Warehouse Investment Value",
    profitPotential: "Expected Gross Profit Potential",
    colId: "ITEM ID",
    colName: "ITEM NAME & GENRE",
    colBarcode: "BARCODE VALUE",
    colCategory: "CATEGORY",
    colPurchasePrice: "COST PRICE",
    colSalePrice: "UNIT PRICE",
    colCurrentStock: "STOCK COUNT",
    colActions: "ACTIONS",
    editProductModalTitle: "Modify Product Card",
    newProductModalTitle: "Register Product Card",
    requiredFieldsError: "Please fill in all required parameters!",
    saveBtn: "Save changes",
    cancelBtn: "Cancel",
    generateBarcode: "Auto Generate",
    cameraScanLabel: "Scan Barcode",

    expHeaderTitle: "Expenses & Cost Tracking",
    expHeaderSubtitle: "Log business costs like taxation, logistical overheads, or operational costs with relational tracking.",
    addExpenseBtn: "➕ Add Expense Statement",
    colDescription: "EXPENSE REASON / DETAIL",
    colAmount: "COST VALUE",
    colDate: "RECORD DATE",
    colCategoryName: "EXPENSE TYPE",
    expenseCategoryTax: "Tax Declaration",
    expenseCategoryLogistics: "Logistics & Dist.",
    expenseCategoryOps: "Operational Work",
    newExpenseModalTitle: "Save New Expense Bill",

    lookupHeaderTitle: "Instant Barcode Lookup",
    barcodeSearchPlaceholder: "Write barcode digits here or boot context camera reader...",
    lookupHeaderSubtitle: "Pull catalog pricing, warehouse limits, and alerts instantly on target barcode read.",
    lookupFound: "Product Retrieved Successfully",
    lookupNotFound: "Could not locate package matching this barcode. Please re-check input values.",
    scanCameraLabel: "Turn On Inquiry Camera",

    autoHeaderTitle: "Automation & Robo CRM Desk",
    autoHeaderSubtitle: "Siftah-Bot runs background processes to identify overstocked shelf spaces or aging products, boosting inventory rate.",
    botStatus: "Siftah-Bot Active Condition",
    botActive: "BOT RUNNING (Active Listening)",
    botInactive: "STOPPED (Offline Mode)",
    startBotBtn: "Start Automation Engine",
    stopBotBtn: "Deactivate Bot",
    crmRetentionRules: "Active Pure Rules-Based Retention Criteria",
    ruleLabel: "Heuristic Constraint",
    dispatchTimer: "Cycle Delivery Frequency",
    whatsappDeliveryQueue: "Pending WhatsApp CRM Dispatch Queue",
    emptyQueue: "No entries currently waiting in messaging queue.",
    systemActivityLogs: "Automation System Event Registry",
    clearLogsBtn: "Purge Event Log",

    contactHeaderTitle: "Neighborhood & Customer CRM",
    contactHeaderSubtitle: "Store customer communication records, personal notes, and segments in SQL relational arrays.",
    addNewContactBtn: "➕ New Client Profile",
    fullNameLabel: "Full Legal Name",
    phoneLabel: "Phone Number",
    customerSegmentLabel: "Customer Segment Class",
    notesLabel: "Special Notes",
    phoneCallBtn: "Call Now",
    whatsappMessageBtn: "Open Chat",
    newContactModalTitle: "Set Customer Card",

    marketerLogoLabel: "Corporate Promo & Discount Vitrine Portal",
    marketerSubtitle: "Establish a free, responsive, and unlimited discount showcase page for your retail customers.",
    marketerEsnafTitle: "Merchant Desk",
    marketerCustomerTitle: "Customer Page",
    marketerSettingsTab: "Translations & Store Info",
    marketerAddDiscountTab: "➕ Define Discount Campaign",
    marketerPortfolioTab: "📚 Published Deals Catalog",
    marketerStoreNameLabel: "Store / Company Brand Name",
    marketerPhoneLabel: "Phone Number",
    marketerWhatsappLabel: "WhatsApp Support",
    marketerActiveCount: "Deals Transmitting Worldwide",
    marketerCampaignDetails: "Campaign & Deal Parameters Entry",
    marketerCampaignSubtitle: "Populate basic data and leverage our unlimited, free local rule engines to forge slogans and meta values automatically.",
    marketerCategoryLabel: "Product Category",
    marketerProductNameLabel: "Product Name",
    marketerOriginalPriceLabel: "List Price (CURRENCY)",
    marketerDiscountPriceLabel: "Deal Price (CURRENCY)",
    marketerDiscountPercentLabel: "Net Savings",
    marketerSloganLabel: "Enticing Customer Copywriting slogan",
    marketerSloganPlaceholder: "Write your discount announcement to attract customers via SEO search ranking or WhatsApp chats...",
    marketerPublishScopeLabel: "Target Segment & Geographic Reach",
    marketerRadiusLabel: "Proximity Boundary (Radius)",
    marketerGlobalLabel: "Global Scope / Mail Delivery Allowed",
    marketerRadiusKmLabel: "Store Delivery Range Cap",
    marketerLocationSelectorLabel: "Verify Merchant GPS Coordinates on Map",
    marketerGpsLocBtn: "Harvest Device Coordinates",
    marketerAddressLabel: "Street Address",
    marketerPublishBtn: "BROADCAST CAMPAIGN TO LIVE WEB VITRINE!",
    marketerPreviewBtn: "CUSTOMER SMARTPHONE INTERFACE PREVIEW",
    marketerPreviewTip: "Simulated representation of the responsive card layout on client screens.",
    marketerActivePortfolioTitle: "Active Live Retail Campaigns Catalogue",
    marketerActivePortfolioSubtitle: "Trace traffic analytics, update records, or delete campaign items.",
    marketerViewsCountLabel: "Device Impressions",
    marketerSharesCountLabel: "WhatsApp Direct Inquiries",
    marketerDeleteBtn: "Unpublish Campaign",
    marketerCopiedAlert: "WhatsApp marketing hyper-link was saved to your clipboard! Share instantly 🚀",
    marketerCustomerHeaderTitle: "Neighborhood Fresh Bargains",
    marketerCustomerHeaderSubtitle: "Commission-free tappy deals directly from neighborhood merchants. Secure fresh products via direct WhatsApp chat!",
    marketerAllCategories: "All Deals",
    marketerProximityTab: "📍 Places Near Me",
    marketerAllDealsTab: "🌐 Shipping / Global",
    marketerSearchPlaceholder: "Type something to search (peynir, milk, bakery...)",
    marketerDistanceLabel: "Proximity Distance",
    marketerNearYouBadge: "Near You",
    marketerOutOfRangeBadge: "Outside Range",
    marketerGetDiscountBtn: "Open Deal Card Details",
    marketerWhatsappBtn: "Direct WhatsApp Ordering",
    marketerPhoneCallBtn: "Call Merchant Hotline",
    marketerShareDisclaimer: "Copy link or forward deal details to friends via WhatsApp or social accounts.",
    marketerCloseBtn: "Close Deck",
    marketerHowMuchDusted: " SAVED OFF!",
    marketerDeliveryRadiusLabel: "📍 Shipping & Delivery Area:",
    marketerDeliveryGlobalText: "🌐 Global Target: Deliverable anywhere globally via commercial postals or freight curriers.",
    marketerUnlimitedImagesTitle: "Store Image Gallery (Unlimited Uploads)",
    marketerUnlimitedImagesDesc: "Upload as many product images as you want or paste links from the web to construct a picture slide.",
    marketerLocalAiGeneratorBtn: "✨ Generate Free Smart Slogan & SEO Content (Local Robot)",
    marketerFreeTag: "100% FREE OFFLINE MOTOR",

    // User Manual & Voice Assistant
    guideTitle: "Digital Portal User Manual",
    guideSubtitle: "An interactive sequentially ordered guide explaining panels, buttons, and workflows with text-to-speech support.",
    guideSequenceTab: "Step-by-Step Flow Chart Sequence",
    guideVoiceAssistantTitle: "Speech synthesis Assistant",
    guideMuteButton: "🔊 Enable Voice",
    guideUnmuteButton: "🔇 Mute Voice",
    guideReadAloudBtn: "▶️ Read Adı Step Out Loud",
    guideStopVoiceBtn: "⏹️ Stop",
    guideIsMutedStatus: "Volume: MUTED",
    guideIsReadingStatus: "Narration: ACTIVE",
    guideStep1Title: "Phase 1: Inventory & Catalogue Initialization",
    guideStep1Desc: "To boot up, open 'Warehouse & Inventory' and tap 'Create New Product'. Set purchase cost, retail price, and 'Stock Warning Threshold' (to alert you on low quantity). Assign barcodes instantly via the random serial generator or trigger laptop camera barcode scanning. All records are instantly saved in your local SQLite database ensuring total data sovereignty.",
    guideStep2Title: "Phase 2: POS Cash Counter Transactions",
    guideStep2Desc: "When checking out client purchases, navigate to 'POS Cash Counter'. Tappy-insert items by tapping from lists or entering barcodes. Set quantity, toggle discounts, and finalize by selecting 'Receive Payment & Finish Sale'. SQLite engine commits transaction while CRM automation decrements sales quantity from item stocks instantly.",
    guideStep3Title: "Phase 3: Log Business Overheads & Expenses",
    guideStep3Desc: "To ensure balance sheets stay green, record overheads in 'Expenses & Costs'. Select 'Add Expense' and post taxes, energy, logistics, or lease bills. This automatically recalculates real-time Net Profits and category allocation ratios displayed inside the Dashboard.",
    guideStep4Title: "Phase 4: Multi-Image Advertising Desk Setup",
    guideStep4Desc: "Navigate to 'Marketing Desk => Define Discount Campaign'. Design product listings with unlimited support for image uploads and web addresses. Click the 'Local Generator' button to automatically forge English, Turkish, or German ad copy and SEO descriptors. Saving provides a live web URL to broadcast directly to neighborhood chat lines.",
    guideStep5Title: "Phase 5: Booting Automation Bot CRM",
    guideStep5Desc: "To trigger sales, go to 'Automation & Bots' and select 'Start Automation Engine'. Siftah-Bot scans warehouse records, identifies bloated inventories or imminent expiry items, calculates discount proportions safely, and loads custom deals matching specified segments (Homemakers, Youth, General) to dispatch lists instantly.",
    guideStep6Title: "Phase 6: Data Backups & Recovery",
    guideStep6Desc: "Your files reside safely in browser sandbox files. Use the 'DOWNLOAD ALL DATA' button to back up all databases as a unified package. If you clear cache, simply select 'UPLOAD' to load back 100% of information. You can also fetch raw SQL dumps or CSV logs for spreadsheets.",
    guideClickReadLabel: "👉 Tap any explaining box to hear the voice assistant recite it!"
  },
  de: {
    tabDashboard: "Management-Dashboard",
    tabSales: "Verkaufskasse (POS)",
    tabInventory: "Lager- & Bestandsverwaltung",
    tabExpenses: "Ausgaben & Kosten",
    tabLookup: "Schnellsuche per Barcode",
    tabAutomation: "Automatisierung & Bots",
    tabContact: "Kontakt-Center",
    tabMarketer: "Marketing-Manager",
    tabGuide: "Handbuch & Sprach-Assistent",

    corpPortal: "UNTERNEHMENSPORTAL",
    addChangeBrand: "✍️ Firmen- / Markennamen ändern",
    currentRoleManager: "Berechtigung: Administrator",
    currentRoleOperator: "Berechtigung: Mitarbeiter",
    roleChangeBtn: "WECHSELN",
    factoryResetBtn: "Standardvorlagen in Werkseinstellungen laden",
    systemItems: "Datenbank-Objekte (SQLite)",
    catalogTable: "Produktkatalog",
    criticalAlerts: "Kritische Warnungen",
    salesLogTable: "Verkaufsprotokoll (Log)",
    expensesTable: "Ausgabentabelle",
    realtimeMapped: "Echte relationale SQLite-Tabellen gemapped.",
    sqliteSovereignty: "SQLite Data Sovereignty",
    deviceIdentity: "Geräte-ID",
    portalVersion: "Portal-Version",
    offlineGrace: "⚡ Offline-Toleranz Aktiv",
    cloudLicenseStatus: "Lizenzüberprüfungsstatus",
    downloadData: "DATEN HERUNTERLADEN",
    uploadData: "DATEN HOCHLADEN / RESTORE",
    backupInfo: "💾 Sichern Sie alle Daten lokal. Laden Sie sie im Falle eines Cache-Resets wieder hoch.",
    sqliteDump: "SQLITE DUMP (.SQL)",
    catalog: "Katalog",
    sales: "Verkäufe",
    expenses: "Ausgaben",
    systemTime: "SYSTEM-UHRZEIT",

    controlPanel: "Management-Dashboard",
    overviewSubtitle: "Echtzeit-Gesamtübersicht über globale Geschäftstransaktionen, Verkaufsautomatisierung und Lagerbestandskontrollen.",
    kpiSalesVolume: "Verkaufsvolumen (Gesamt)",
    kpiTotalExpenses: "Gesamtausgaben",
    kpiNetProfit: "Nettogewinn / -verlust",
    kpiProfitMargin: "Bruttomarge (%)",
    kpiCriticalStocks: "Kritische Bestandsalarme",
    itemsLabel: "artikel",
    salesChartTitle: "Tägliche Umsatztrends (WÄHRUNG)",
    expensesChartTitle: "Ausgabenverteilung nach Art (WÄHRUNG)",
    topProductsTitle: "Bestenliste der meistverkauften Produkte",
    topProductsSubtitle: "Umsatzbasierte Rangliste aller Finanzperioden.",
    revenueLabel: "Umsatz",
    quantityLabel: "Menge",
    criticalNoticeTitle: "Kritisch niedriger Lagerbestand im Lager festgestellt!",
    criticalNoticeSubtitle: "Bitte Bestandsnachbestellung anordnen, um Betriebsunterbrechungen zu vermeiden. Gehen Sie zum Filter 'Kritisch', um Details anzuzeigen.",
    resolveNowBtn: "Lagerverwaltung aufrufen",

    cashSalesPoint: "Verkaufskasse & Schnelltaste (POS)",
    salesPointSubtitle: "Erfassen Sie physische Verkäufe, die sofort über lokales SQLite verifiziert werden, per Barcode-Eingabe oder Klick auf Katalogsymbole.",
    barcodeInputPlaceholder: "Scannen Sie einen Barcode oder klicken Sie auf ein Produkt...",
    scanBarcodeBtn: "Kamera-Barcode-Leser",
    productName: "Produktname",
    quantity: "Menge (Stück)",
    pricePerUnit: "Preis / Einheit",
    subtotal: "Zwischensumme",
    addToCartBtn: "In den Warenkorb & Aktualisieren",
    shoppingCart: "Warenkorb",
    emptyCart: "Der Warenkorb ist leer. Scannen Sie einen Barcode oder wählen Sie Produkte aus der Liste unten.",
    applyDiscount: "Rabatt / Nachlass (%)",
    totalAmount: "Gesamtsumme (Zahlbetrag)",
    completeSaleBtn: "Zahlung erhalten & Verkauf abschließen",
    cannotExceedStock: "Fehler: Die eingegebene Menge darf den aktuellen Lagerbestand nicht überschreiten!",
    saleCompletedSuccess: "SQLite Bestätigt: Verkauf erfolgreich verbucht, Lagerbestand in Echtzeit angepasst!",
    searchProductPlaceholder: "Katalog durchsuchen zum Hinzufügen...",

    invHeaderTitle: "Lager- und Bestandsverwaltung",
    invHeaderSubtitle: "Echtzeit-Katalogauflistung, Investitionskennzahlen und integriertes Barcode-Scan-Zentrum.",
    searchProductLbl: "Artikel suchen (Name, Barcode, ID)...",
    filterAll: "Gesamter Katalog ({count})",
    filterCritical: "⚠️ Bestandsalarme ({count})",
    addProductBtn: "➕ Neues Produkt anlegen",
    totalStockCount: "Gesamtbestand (Stück)",
    totalStockInv: "Lagerinvestitionsvolumen",
    profitPotential: "Erwartetes Bruttomargenpotenzial",
    colId: "PRODUKT ID",
    colName: "PRODUKTNAME & KATEGORIE",
    colBarcode: "BARCODE-WERT",
    colCategory: "KATEGORIEN",
    colPurchasePrice: "EINKAUFSPREIS",
    colSalePrice: "VERKAUFSPREIS",
    colCurrentStock: "LAGERBESTAND",
    colActions: "AKTIONEN",
    editProductModalTitle: "Produktkarte bearbeiten",
    newProductModalTitle: "Produkt registrieren",
    requiredFieldsError: "Bitte alle Pflichtfelder ausfüllen!",
    saveBtn: "Speichern",
    cancelBtn: "Abbrechen",
    generateBarcode: "Auto-Zufall",
    cameraScanLabel: "Barcode scannen",

    expHeaderTitle: "Ausgaben & Kostenüberwachung",
    expHeaderSubtitle: "Erfassen Sie Geschäftskosten wie Steuern, Logistik oder administrative Ausgaben mit relationale Log-Einträgen.",
    addExpenseBtn: "➕ Neue Ausgabe deklarieren",
    colDescription: "BEGRÜNDUNG / EINZELHEITEN",
    colAmount: "BETRAG WERT",
    colDate: "DATUM",
    colCategoryName: "AUSGABENART",
    expenseCategoryTax: "Steuererklärung",
    expenseCategoryLogistics: "Logistik & Transport",
    expenseCategoryOps: "Betriebskosten",
    newExpenseModalTitle: "Ausgabenbeleg speichern",

    lookupHeaderTitle: "Sofortige Barcode-Suche",
    barcodeSearchPlaceholder: "Geben Sie die Barcode-Ziffern ein oder starten Sie den Kamerascanner...",
    lookupHeaderSubtitle: "Preise, Bestandsgrenzen und Warnungen bei Scan des Barcodes sofort abrufen.",
    lookupFound: "Produkt erfolgreich abgerufen",
    lookupNotFound: "Kein Produkt mit diesem Barcode gefunden. Bitte Eingabe prüfen.",
    scanCameraLabel: "Sorgu-Kamera einschalten",

    autoHeaderTitle: "Automatisierungs- & Roboter-CRM",
    autoHeaderSubtitle: "Siftah-Bot optimiert im Hintergrund die Bestandsnutzung, identifiziert überlagerten Bestand und steigert den Umsatz.",
    botStatus: "Siftah-Bot Aktivitätsstatus",
    botActive: "BOT AKTIV (Zuhören)",
    botInactive: "DEAKTIVIERT (Offline-Modus)",
    startBotBtn: "Automatisierung starten",
    stopBotBtn: "Bot stoppen",
    crmRetentionRules: "Aktive regelbasierte Kundenbindungskriterien",
    ruleLabel: "Heuristische Regel",
    dispatchTimer: "Häufigkeit des Sendezyklus",
    whatsappDeliveryQueue: "Ausstehende WhatsApp CRM-Sendewarteschlange",
    emptyQueue: "Derzeit befinden sich keine Einträge in der Warteschlange.",
    systemActivityLogs: "Systemprotokoll Automatisierung",
    clearLogsBtn: "Protokoll leeren",

    contactHeaderTitle: "Kunden- & Nachbarschafts-CRM",
    contactHeaderSubtitle: "Speichern Sie Kommunikationsdaten, persönliche Notizen und Segmente in relationalen Arrays.",
    addNewContactBtn: "➕ Neues Kundenprofil",
    fullNameLabel: "Vollständiger Name",
    phoneLabel: "Telefonnummer",
    customerSegmentLabel: "Kundensegmentklasse",
    notesLabel: "Spezielle Notizen",
    phoneCallBtn: "Jetzt Anrufen",
    whatsappMessageBtn: "Chat öffnen",
    newContactModalTitle: "Kundenprofil anlegen",

    marketerLogoLabel: "Aktions- & Rabatt-Schaufensterportal",
    marketerSubtitle: "Richten Sie ein kostenloses, reaktionsschnelles und unbegrenztes Angebotsportal für Ihre Kunden ein.",
    marketerEsnafTitle: "Händler",
    marketerCustomerTitle: "Kundenansicht",
    marketerSettingsTab: "Übersetzungen & Store-Info",
    marketerAddDiscountTab: "➕ Aktionsangebot anlegen",
    marketerPortfolioTab: "📚 Aktive Kampagnen",
    marketerStoreNameLabel: "Name des Geschäfts / Händlers",
    marketerPhoneLabel: "Telefonnummer",
    marketerWhatsappLabel: "WhatsApp-Support",
    marketerActiveCount: "Weltweit übertragene Angebote",
    marketerCampaignDetails: "Details zur Werbeaktion eingeben",
    marketerCampaignSubtitle: "Geben Sie die Preisdaten ein und nutzen Sie unbegrenzte kostenfreie lokale Algorithmen für Marketing-Slogans und SEO-Texte.",
    marketerCategoryLabel: "Produktkategorie",
    marketerProductNameLabel: "Produktname",
    marketerOriginalPriceLabel: "Listenpreis (WÄHRUNG)",
    marketerDiscountPriceLabel: "Aktionspreis (WÄHRUNG)",
    marketerDiscountPercentLabel: "Nettoersparnis (%)",
    marketerSloganLabel: "Möchten Sie einen ansprechenden Kundenslogan eingeben?",
    marketerSloganPlaceholder: "Verfassen Sie eine Ankündigung, die Kunden per Suche oder WhatsApp-Chat anzieht...",
    marketerPublishScopeLabel: "Zielgruppensegment & geografische Reichweite",
    marketerRadiusLabel: "Kontext-Radius (Liefergebiet)",
    marketerGlobalLabel: "Weltweit / Postversand zulässig",
    marketerRadiusKmLabel: "Lieferdistanz-Grenze des Händlers",
    marketerLocationSelectorLabel: "GPS-Koordinaten des Händlers verifizieren",
    marketerGpsLocBtn: "GPS Koordinaten erfassen",
    marketerAddressLabel: "Straßenadresse",
    marketerPublishBtn: "KAMPAGNE JEZTD LIVE VERÖFFENTLICHEN!",
    marketerPreviewBtn: "SMARTPHONE-VORSCHAU FÜR KUNDEN",
    marketerPreviewTip: "Simulierte Darstellung der responsiven Produktkarte auf Kundengeräten.",
    marketerActivePortfolioTitle: "Aktive Live-Werbekampagnen",
    marketerActivePortfolioSubtitle: "Kennzahlen verfolgen, Einträge anpassen oder Kampagne offline nehmen.",
    marketerViewsCountLabel: "Impressionen",
    marketerSharesCountLabel: "WhatsApp-Anfragen",
    marketerDeleteBtn: "Kampagne löschen",
    marketerCopiedAlert: "WhatsApp Marketing-Kampagnen-Link in die Zwischenablage kopiert! 🚀",
    marketerCustomerHeaderTitle: "Frische Angebote in der Nachbarschaft",
    marketerCustomerHeaderSubtitle: "Provisionsfreie Schnäppchen direkt von Ihren Händlern. Sichern Sie sich Qualität per direktem WhatsApp-Chat!",
    marketerAllCategories: "Alle Angebote",
    marketerProximityTab: "📍 Angebote in meiner Nähe",
    marketerAllDealsTab: "🌐 Briefversand / Global",
    marketerSearchPlaceholder: "Suchen nach (Käse, Milch, Bäckerei...)",
    marketerDistanceLabel: "Entfernung",
    marketerNearYouBadge: "In Ihrer Nähe",
    marketerOutOfRangeBadge: "Außer Reichweite",
    marketerGetDiscountBtn: "Angebotskarte ansehen",
    marketerWhatsappBtn: "Mit Händler chatten (WhatsApp)",
    marketerPhoneCallBtn: "Hotline anrufen",
    marketerShareDisclaimer: "Kopieren Sie den Link oder leiten Sie das Schnäppchen an Ihre Freunde weiter.",
    marketerCloseBtn: "Deck schließen",
    marketerHowMuchDusted: " GESPART!",
    marketerDeliveryRadiusLabel: "📍 Lieferungs & Versandgebiet:",
    marketerDeliveryGlobalText: "🌐 Global Target: Dieser Artikel kann weltweit per Post oder Spedition geliefert werden.",
    marketerUnlimitedImagesTitle: "Produkt-Bildergalerie (Unbegrenzte Uploads)",
    marketerUnlimitedImagesDesc: "Laden Sie beliebig viele Produktbilder hoch oder fügen Sie Web-URLs ein, um eine automatische Bilderserie zu bilden.",
    marketerLocalAiGeneratorBtn: "✨ Slogan & SEO Content kostenlos erstellen (Lokaler Roboter)",
    marketerFreeTag: "100% QUELLE COFFEE ENGINE",

    // User Manual & Voice Assistant
    guideTitle: "Digital-Portal Benutzerhandbuch",
    guideSubtitle: "Ein interaktives, sequentiell geordnetes Handbuch, das Paneele, Schaltflächen und Abläufe mit Sprach-Ausgabe erklärt.",
    guideSequenceTab: "Ablaufdiagramm Schritt für Schritt",
    guideVoiceAssistantTitle: "Sprach-Assistent-Synthesizer",
    guideMuteButton: "🔊 Ton einschalten",
    guideUnmuteButton: "🔇 Ton stumm schalten",
    guideReadAloudBtn: "▶️ Diesen Schritt vorlesen",
    guideStopVoiceBtn: "⏹️ Stopp",
    guideIsMutedStatus: "Ton: STUMM",
    guideIsReadingStatus: "Sprecher: AKTIV",
    guideStep1Title: "Schritt 1: Initialisierung des Bestands",
    guideStep1Desc: "Öffnen Sie 'Lager & Bestand' und wählen Sie 'Neues Produkt anlegen'. Tragen Sie Einkaufskosten, Verkaufspreis und 'Bestandswarnungsgrenze' ein. Erzeugen Sie Barcodes sofort über den Zufallsgenerator oder die Computerkamera. Alle Daten verbleiben souverän in Ihrer relationalen SQLite-Datenbank.",
    guideStep2Title: "Schritt 2: Verkauf an der POS-Kasse buchen",
    guideStep2Desc: "Navigieren Sie zum Abkassieren zu 'Verkaufskasse'. Klicken Sie auf Artikel in den Listen oder tippen Sie Barcodes ein. Legen Sie Mengen und Rabatte fest und klicken Sie auf 'Zahlung erhalten'. Der SQLite-Core verbucht die Transaktion, während die CRM-Automatisierung die verkaufte Menge abzieht.",
    guideStep3Title: "Schritt 3: Geschäftskosten & Ausgaben erfassen",
    guideStep3Desc: "Um die Bilanz grün zu halten, buchen Sie Geschäftsausgaben im 'Ausgaben & Kosten'-Reiter. Tragen Sie Steuern, Logistikbelege (Kraftstoff, Kuriere) oder Mieten ein. Die Nettogewinn-Kennzahlen auf dem Dashboard aktualisieren sich vollautomatisch in Echtzeit.",
    guideStep4Title: "Schritt 4: Werbekampagne mit unbegrenzten Bildern",
    guideStep4Desc: "Gehen Sie zu 'Marketing-Manager => Aktionsangebot anlegen'. Fügen Sie beliebig viele URLs und base64-Bilder zu dem Produkt hinzu, um eine Galerie zu bilden. Mit dem 'Lokale Roboter'-Generator erhalten Sie blitzschnell Slogans in EN, TR oder DE. Nach dem Speichern erhalten Sie einen permanenten Link für WhatsApp-Gruppen.",
    guideStep5Title: "Schritt 5: Siftah-Bot CRM aktivieren",
    guideStep5Desc: "Unter 'Automatisierung & Bots' starten Sie den Automatisierungsserver. Siftah-Bot analysiert ununterbrochen Artikel mit nahendem Ablaufdatum oder Überbestand, berechnet Rabattsätze und fügt Kunden je nach Segment (Hausfrauen, Jugend, Allgemein) in Warteschlangen ein.",
    guideStep6Title: "Schritt 6: Datensicherung & Katastrophenschutz",
    guideStep6Desc: "Datensätze werden sicher in der lokalen Sandbox des Webbrowsers gehalten. Wählen Sie 'DATEN HERUNTERLADEN', um ein Backup-Paket auf den PC zu exportieren. Bei Cache-Verlust laden Sie es einfach per 'DATEN HOCHLADEN' wieder an Ort und Stelle.",
    guideClickReadLabel: "👉 Klicken Sie auf ein Erklärungsfeld, um es sich vorlesen zu lassen!"
  }
};
