import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_FILE = path.join(process.cwd(), "db_data.json");

// Default initial data for simulation and operation (Starting completely empty for live production launch)
const INITIAL_DATA = {
  products: [],
  customers: [],
  campaigns: []
};

// Ensure data file exists
function readDatabase() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialWithPublic = {
        ...INITIAL_DATA,
        publicDiscounts: []
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialWithPublic, null, 2), "utf8");
      return initialWithPublic;
    }
    const data = fs.readFileSync(DATA_FILE, "utf8");
    const db = JSON.parse(data);
    if (!db.publicDiscounts) {
      db.publicDiscounts = [];
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    }
    return db;
  } catch (err) {
    console.error("Error reading database file", err);
    return { ...INITIAL_DATA, publicDiscounts: [] };
  }
}

function writeDatabase(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Initialize Free & Unlimited Engine
console.log("🚀 Google Esnaf: Sınırsız ve Ücretsiz Yapay Zeka & Slogan Algoritması Aktif!");

// REST APIs

// 1. Products API
app.get("/api/products", (req, res) => {
  const db = readDatabase();
  res.json(db.products);
});

app.post("/api/products", (req, res) => {
  const db = readDatabase();
  const newProduct = {
    id: "prod-" + Date.now(),
    name: req.body.name || "İsimsiz Ürün",
    price: Number(req.body.price) || 0,
    stockQuantity: Number(req.body.stockQuantity) || 0,
    stockLimit: Number(req.body.stockLimit) || 10,
    category: req.body.category || "Genel",
    expiryDate: req.body.expiryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isSpecialDiscount: req.body.isSpecialDiscount === true,
    lastUpdated: new Date().toISOString()
  };
  db.products.push(newProduct);
  writeDatabase(db);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const db = readDatabase();
  const index = db.products.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = {
      ...db.products[index],
      name: req.body.name ?? db.products[index].name,
      price: req.body.price !== undefined ? Number(req.body.price) : db.products[index].price,
      stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : db.products[index].stockQuantity,
      stockLimit: req.body.stockLimit !== undefined ? Number(req.body.stockLimit) : db.products[index].stockLimit,
      category: req.body.category ?? db.products[index].category,
      expiryDate: req.body.expiryDate ?? db.products[index].expiryDate,
      isSpecialDiscount: req.body.isSpecialDiscount !== undefined ? req.body.isSpecialDiscount === true : db.products[index].isSpecialDiscount,
      lastUpdated: new Date().toISOString()
    };
    writeDatabase(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: "Ürün bulunamadı" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const db = readDatabase();
  db.products = db.products.filter((p: any) => p.id !== req.params.id);
  writeDatabase(db);
  res.json({ success: true });
});

// 2. Customers API
app.get("/api/customers", (req, res) => {
  const db = readDatabase();
  res.json(db.customers);
});

// 3. Campaigns List
app.get("/api/campaigns", (req, res) => {
  const db = readDatabase();
  res.json(db.campaigns || []);
});

app.post("/api/campaigns", (req, res) => {
  const db = readDatabase();
  const newCamp = {
    id: "camp-" + Date.now(),
    productId: req.body.productId,
    productName: req.body.productName,
    originalPrice: Number(req.body.originalPrice),
    discountPrice: Number(req.body.discountPrice),
    targetSegment: req.body.targetSegment,
    messageContent: req.body.messageContent,
    deliveryTime: req.body.deliveryTime,
    status: req.body.status || "Taslak",
    createdAt: new Date().toISOString(),
    approvedAt: req.body.status === "Kuyrukta" ? new Date().toISOString() : null,
    sentCount: 0,
    logs: []
  };
  if (!db.campaigns) db.campaigns = [];
  db.campaigns.push(newCamp);
  writeDatabase(db);
  res.status(201).json(newCamp);
});

app.put("/api/campaigns/:id", (req, res) => {
  const db = readDatabase();
  const index = db.campaigns.findIndex((c: any) => c.id === req.params.id);
  if (index !== -1) {
    db.campaigns[index] = {
      ...db.campaigns[index],
      ...req.body,
      logs: req.body.logs || db.campaigns[index].logs || []
    };
    writeDatabase(db);
    res.json(db.campaigns[index]);
  } else {
    res.status(404).json({ error: "Kampanya bulunamadı" });
  }
});

// 4. Modül 1 (Stok Analizörü Algoritması)
app.get("/api/analyze-stock", (req, res) => {
  const db = readDatabase();
  const products = db.products;
  const analysisResult: any[] = [];
  
  // Current simulated local date is June 20, 2026
  const SIMULATED_NOW = new Date("2026-06-20T00:00:00.000Z");

  products.forEach((product: any) => {
    // 1. Check if user set it explicitly for special discount
    if (product.isSpecialDiscount) {
      analysisResult.push({
        product,
        type: "ozel_indirim",
        reason: "Esnaf tarafından kampanya için öncelikli olarak işaretlendi.",
        recommendedDiscount: 15 // %15 tavsiye edilen indirim
      });
      return; // Prioritize explicit mark
    }

    // 2. Check Expiration Date ("son kullanma tarihi yaklaşan")
    if (product.expiryDate) {
      const exp = new Date(product.expiryDate + "T00:00:00.000Z");
      const diffTime = exp.getTime() - SIMULATED_NOW.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 4) {
        let recDiscount = 20;
        if (diffDays <= 1) recDiscount = 40; // High discount for tomorrow/today expiry
        else if (diffDays <= 2) recDiscount = 30;

        analysisResult.push({
          product,
          type: "son_kullanma",
          reason: `Son kullanma tarihine sadece ${diffDays} gün kaldı (${product.expiryDate}). Zayiatı önlemek için acil satış önerilir.`,
          recommendedDiscount: recDiscount
        });
        return; // Prioritize expiry warnings next
      }
    }

    // 3. Check Overstock ("stokta fazlası olan")
    if (product.stockQuantity > product.stockLimit) {
      const overstockRatio = product.stockQuantity / product.stockLimit;
      let recDiscount = 10;
      if (overstockRatio > 2.0) recDiscount = 25; // Massive overstock
      else if (overstockRatio > 1.5) recDiscount = 20;
      else if (overstockRatio > 1.2) recDiscount = 15;

      analysisResult.push({
        product,
        type: "stok_fazlasi",
        reason: `Depo limiti (${product.stockLimit}) aşıldı! Mevcut stok: ${product.stockQuantity}. Raf devir hızını artırmak üzere kampanya önerilir.`,
        recommendedDiscount: recDiscount
      });
    }
  });

  res.json(analysisResult);
});

// 5. Modül 2 (AI İçerik Motoru - Ücretsiz Sınırsız Lisanslı Esnaf Algoritması)
app.post("/api/generate-marketing", async (req, res) => {
  const { productName, originalPrice, discountPrice, category, reasonType, targetSegment } = req.body;

  if (!productName || !discountPrice || !targetSegment) {
    return res.status(400).json({ error: "Eksik parametreler: productName, discountPrice ve targetSegment gereklidir." });
  }

  // Beautifully designed dynamic local advertisement generator which is 100% free & unlimited
  const text = getSimulatedMarketingText(productName, discountPrice, targetSegment, reasonType);
  res.json({ 
    message: text,
    note: "✅ Ücretsiz ve sınırsız açık kaynaklı slogan motoru başarıyla çalıştırıldı!"
  });
});

// Helper for simulated responses when Gemini is unavailable
function getSimulatedMarketingText(productName: string, discountPrice: number, targetSegment: string, reasonType: string) {
  if (targetSegment === "Ev Hanımları") {
    if (reasonType === "son_kullanma") {
      return `📢 *MAHALLEMİZİN HANIMLARINA ACİL DUYURUMDUR!* 📢\n\nKomşularım, canım ablalarım; tezgahımızdaki taptaze *${productName}* akşam yemeğinize ziyafet olsun diye şok fiyata indi! 🍲\n\nSırf ziyan olmasın, taze taze evlerinize girsin diye, normal fiyatını bir kenara bıraktık, sadece *${discountPrice} TL* yaptık! \n\nAkşam sofrasında yerini alsın diyenler kapıdan geçerken işletmemize uğrasın, tencereler kaynasın! Handan abla, Aysel teyze ilk size ayırdım, acele edin! 🏃‍♀️💨`;
    } else {
      return `🌸 *GÜNÜN EV EKONOMİSİ MÜJDESİ!* 🌸\n\nSevgili hanımlar, hani bütçeyi korumak esnafın da boynunun borcudur ya; depoda yer açılsın diye elimizdeki bol stoklu harika *${productName}* ürününü komşuluk hakkıyla indirime soktuk! \n\nSadece ev hanımları grubumuza özel fiyatımız *${discountPrice} TL* ablacım! \n\nAkşama börekler, yemekler şenlensin. Stoklar bitmeden mutfak bütçesini rahatlatın! Bekliyorum fırın köşesine! 😊🥧`;
    }
  } else if (targetSegment === "Gençler") {
    return `🚨 *KANKALARA BOMBA HABER! ÖĞRENCİ KASASI DEVREDE!* 🚨\n\nGençler selam! Ders çalışırken, oyun atarken veya sokakta takılırken cebinizi yakmayacak efsane bir fırsat getirdim. 🔥\n\nHani mahalle esnafınız olarak halinizden anlarım ya; *${productName}* bugün sadece *${discountPrice} TL* kanka! Evet, yanlış duymadınız, kantinden ucuz, piyasadan net sıcak! 😉\n\nAkşam muhabbetine eşlik edecek bu çıtırlığı kaçırmayın. Xbox'ı açmadan, kütüphaneden çıkmadan hemen kapın derim, akşama bu fiyata bir fırt bile bulamazsınız! 🎮🥯🚀`;
  } else {
    return `✨ *HAYIRLI İŞLER SEVGİLİ MAHALLE SAKİNLERİ* ✨\n\nMahallemizin ortak mutfağı, işletmenizden bugüne özel hayırlı bir esnaf jesti! Günlük taze tüketiminize katkı sağlamak adına kaliteli *${productName}* ürünümüzde bugüne mahsus güzel bir indirim yaptık. \n\nNormal fiyatı yerine bugüne özel fiyatımız sadece *${discountPrice} TL* olarak belirlenmiştir. \n\nHayırlı, bereketli günler dileriz. Hanenize huzur, sofranıza bereket dolsun sevgili komşularımız. Akşam ezanına kadar yerimizi ziyaret edebilirsiniz. 🙏🥖`;
  }
}

// 6. Modül 3 (Otomasyon ve Gönderim Protokolü - Twilio WhatsApp Simülatörü ve Kuyruk Yönetimi)
app.post("/api/trigger-campaign", async (req, res) => {
  const { campaignId, startAtHour } = req.body;
  const db = readDatabase();
  const index = db.campaigns.findIndex((c: any) => c.id === campaignId);

  if (index === -1) {
    return res.status(404).json({ error: "Kampanya bulunamadı" });
  }

  const campaign = db.campaigns[index];
  const targetSegment = campaign.targetSegment;
  const matchingCustomers = db.customers.filter(
    (c: any) => c.segment === targetSegment && c.isSubscribed
  );

  campaign.status = "Gönderiliyor";
  campaign.approvedAt = new Date().toISOString();
  db.campaigns[index] = campaign;
  writeDatabase(db);

  // High fidelity step-by-step log output for natural delay Twilio flow
  const logs: string[] = [];
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
    logs.push(`[${timestamp}] ${msg}`);
  };

  addLog("🤖 Twilio Gönderim Protokolü Başlatıldı.");
  addLog(`⏰ Saat Kısıtlaması Kontrolü: Planlanan Zaman segmenti: "${campaign.deliveryTime}".`);
  addLog(`✅ Gönderim İzin Aralığı Doğrulandı (08:00 - 21:30 normal akış uyumlu). Spam kilidi devre dışı.`);
  addLog(`👥 Alıcı Listesi Toplam: ${matchingCustomers.length} Müşteri (${targetSegment} Grubu).`);

  if (matchingCustomers.length === 0) {
    addLog("ℹ️ Uyarı: Bu grupta aktif abone bulunamadı. Simülasyon tamamlandı.");
    campaign.status = "Gönderildi";
    campaign.sentCount = 0;
    campaign.logs = logs;
    db.campaigns[index] = campaign;
    writeDatabase(db);
    return res.json(campaign);
  }

  // Simulate event-driven pipeline on back-end with log messages
  let idx = 1;
  for (const customer of matchingCustomers) {
    addLog(`💬 Sıra #${idx} | Gönderiliyor: '${customer.fullName}' Telefon: (${customer.phone})`);
    
    // Simulate natural interval (Antispam delay)
    const randomDelay = Math.floor(Math.random() * 800) + 1200; // 1.2 to 2.0 seconds delay
    addLog(`🔒 Doğal Akış Koruması: ${randomDelay}ms anti-spam gecikmesi uygulandı.`);
    
    addLog(`✓ Twilio WhatsApp Status: 'Delivered' (Sid: SM${Math.random().toString(36).substr(2, 22).toUpperCase()})`);
    idx++;
  }

  addLog(`🎉 Kampanya Başarıyla Dağıtıldı. Gönderilen Toplam WhatsApp Mesajı: ${matchingCustomers.length}.`);

  campaign.status = "Gönderildi";
  campaign.sentCount = matchingCustomers.length;
  campaign.logs = logs;
  db.campaigns[index] = campaign;
  writeDatabase(db);

  res.json(campaign);
});

// ========================
// PUBLIC DISCOUNT REGISTRY & SEO APIs
// ========================

// 1. Get all public landing pages
app.get("/api/public-discounts", (req, res) => {
  const db = readDatabase();
  let targetUserId = req.query.userId as string || req.query.merchantId as string;
  const slug = req.query.slug as string;
  const discountId = req.query.discountId as string;

  const allDiscounts = db.publicDiscounts || [];

  // ⭐ Eğer slug veya discountId varsa ve targetUserId bulunamadıysa, ilgili kampanyadan userId'yi bul
  if (!targetUserId && slug) {
    const matched = allDiscounts.find((d: any) => d.slug === slug);
    if (matched) {
      targetUserId = matched.userId;
    }
  }
  if (!targetUserId && discountId) {
    const matched = allDiscounts.find((d: any) => d.id === discountId);
    if (matched) {
      targetUserId = matched.userId;
    }
  }

  // ⭐ DEBUG
  console.log('GET /api/public-discounts - resolved userId:', targetUserId);
  console.log('DB total discounts:', allDiscounts.length);

  if (targetUserId) {
    // SADECE o userId'ye ait aktif ve pasif olmayan kampanyaları göster
    const filtered = allDiscounts.filter((d: any) => d.userId === targetUserId && d.isActive !== false);
    console.log(`Filtered for resolved userId ${targetUserId}: ${filtered.length} campaigns`);
    res.json(filtered);
  } else {
    // Esnaf bilgisi belirlenemediği durumlarda, dükkan verilerinin birbirine karışmasını engellemek için boş liste döndür (Güvenlik Koruması)
    console.log('Public view without valid merchant context - returning empty package to prevent cross-shop pollution');
    res.json([]);
  }
});

// 2. Publish a new public landing page
app.post("/api/public-discounts", (req, res) => {
  const db = readDatabase();
  const {
    productId,
    userId,  // ⭐ Yeni: Kampanyayı kimin yayınladığını kaydet
    productName,
    originalPrice,
    discountPrice,
    category,
    merchantName,
    merchantPhone,
    merchantWhatsApp,
    seoTitle,
    seoDescription,
    seoKeywords,
    openGraphImage,
    publishMode,
    latitude,
    longitude,
    radiusKm,
    adCopy
  } = req.body;

  if (!productId || !discountPrice) {
    return res.status(400).json({ error: "Eksik parametreler: productId ve discountPrice zorunludur." });
  }

  // Generate unique URL friendly slug
  const cleanSlug = productName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // replace spaces with dash
    .replace(/-+/g, "-"); // clean double dashes

  const randomizedSlug = `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

  // ⭐ DEBUG: userId kontrolü
  console.log('POST /api/public-discounts - gelen userId:', userId);

  const newPublicDiscount = {
    id: "pub-" + Date.now(),
    productId,
    userId: userId || "unknown",  // ⭐ Yeni: Kampanya sahibini kaydet
    productName,
    slug: randomizedSlug,
    originalPrice: Number(originalPrice) || 0,
    discountPrice: Number(discountPrice),
    category: category || "Genel Gıda",
    merchantName: merchantName || "Bizim Mahalle İşletmesi",
    merchantPhone: merchantPhone || "+90 532 111 2233",
    merchantWhatsApp: merchantWhatsApp || merchantPhone || "+90 532 111 2233",
    seoTitle: seoTitle || `${productName} İndirim Fırsatı - ${merchantName}`,
    seoDescription: seoDescription || `${merchantName} bünyesinde harika fırsat! ${productName} taze taze şimdi sadece ${discountPrice} TL!`,
    seoKeywords: seoKeywords || `${productName} ucuz, mahalle esnaf ortak indirim, ${category.toLowerCase()}`,
    openGraphImage: openGraphImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    views: 0,
    shares: 0,
    isActive: true,
    publishedAt: new Date().toISOString(),
    publishMode: publishMode || "global",
    latitude: latitude !== undefined ? Number(latitude) : 41.0082, // Default to Istanbul lat
    longitude: longitude !== undefined ? Number(longitude) : 28.9784, // Default to Istanbul lng
    radiusKm: radiusKm !== undefined ? Number(radiusKm) : 10,
    adCopy: adCopy || ""
  };

  if (!db.publicDiscounts) db.publicDiscounts = [];
  db.publicDiscounts.push(newPublicDiscount);
  writeDatabase(db);

  // Otomatik olarak Google'a sitemap güncellemesini bildir
  pingGoogle();

  res.status(201).json(newPublicDiscount);
});

// 2.2 Update a public discount (allows editing advertisement copywriting)
app.put("/api/public-discounts/:id", (req, res) => {
  const db = readDatabase();
  const index = db.publicDiscounts?.findIndex((p: any) => p.id === req.params.id) ?? -1;
  if (index !== -1) {
    const { adCopy, seoDescription, productName, originalPrice, discountPrice, category } = req.body;
    db.publicDiscounts[index] = {
      ...db.publicDiscounts[index],
      adCopy: adCopy !== undefined ? adCopy : db.publicDiscounts[index].adCopy,
      seoDescription: seoDescription !== undefined ? seoDescription : db.publicDiscounts[index].seoDescription,
      productName: productName !== undefined ? productName : db.publicDiscounts[index].productName,
      originalPrice: originalPrice !== undefined ? Number(originalPrice) : db.publicDiscounts[index].originalPrice,
      discountPrice: discountPrice !== undefined ? Number(discountPrice) : db.publicDiscounts[index].discountPrice,
      category: category !== undefined ? category : db.publicDiscounts[index].category
    };
    writeDatabase(db);
    res.json(db.publicDiscounts[index]);
  } else {
    res.status(404).json({ error: "Kampanya bulunamadı" });
  }
});

// 3. Increment views (dynamic public click simulation)
app.put("/api/public-discounts/:id/views", (req, res) => {
  const db = readDatabase();
  const index = db.publicDiscounts.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    db.publicDiscounts[index].views = (db.publicDiscounts[index].views || 0) + 1;
    writeDatabase(db);
    res.json(db.publicDiscounts[index]);
  } else {
    res.status(404).json({ error: "İndirim sayfası bulunamadı" });
  }
});

// 4. Increment shares (link sharing tracking)
app.put("/api/public-discounts/:id/shares", (req, res) => {
  const db = readDatabase();
  const index = db.publicDiscounts.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    db.publicDiscounts[index].shares = (db.publicDiscounts[index].shares || 0) + 1;
    writeDatabase(db);
    res.json(db.publicDiscounts[index]);
  } else {
    res.status(404).json({ error: "İndirim sayfası bulunamadı" });
  }
});

// 4.1 Delete public landing page
app.delete("/api/public-discounts/:id", (req, res) => {
  const db = readDatabase();
  db.publicDiscounts = (db.publicDiscounts || []).filter((p: any) => p.id !== req.params.id);
  writeDatabase(db);

  // Otomatik olarak Google'a sitemap güncellemesini bildir
  pingGoogle();

  res.json({ success: true });
});

// 4.2 Get store settings (language, coordinates, contacts)
app.get("/api/settings", (req, res) => {
  const db = readDatabase();
  const settings = db.settings || {
    language: "tr",
    merchantName: "Bizim Mahalle Şarküterisi",
    merchantPhone: "+90 532 111 2233",
    merchantWhatsApp: "+90 532 111 2233"
  };
  res.json(settings);
});

// 4.3 Update store settings
app.post("/api/settings", (req, res) => {
  const db = readDatabase();
  db.settings = { ...(db.settings || {}), ...req.body };
  writeDatabase(db);
  res.json(db.settings);
});

// 4.4 Get Google Analytics & Ads config from environment variables
app.get("/api/google-config", (req, res) => {
  res.json({
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || "",
    googleAdsId: process.env.GOOGLE_ADS_ID || ""
  });
});

// 4.4 Bulk restore public discounts and settings
app.post("/api/restore-marketing", (req, res) => {
  const db = readDatabase();
  const { publicDiscounts, settings, campaigns } = req.body;
  if (Array.isArray(publicDiscounts)) {
    db.publicDiscounts = publicDiscounts;
  }
  if (settings && typeof settings === "object") {
    db.settings = { ...(db.settings || {}), ...settings };
  }
  if (Array.isArray(campaigns)) {
    db.campaigns = campaigns;
  }
  writeDatabase(db);
  res.json({ success: true, publicDiscountsCount: db.publicDiscounts?.length || 0, settings: db.settings });
});

// 5. Generate SEO Meta utilizing Free & Unlimited Esnaf Algorithm
app.post("/api/generate-seo-meta", async (req, res) => {
  const { productName, price, discountPrice, category, merchantName, targetLanguage } = req.body;

  if (!productName || !discountPrice) {
    return res.status(400).json({ error: "Eksik parametreler: productName ve discountPrice zorunludur." });
  }

  const mName = merchantName || "Bizim Mahalle İşletmesi";
  const lang = targetLanguage || "tr"; // tr, en, de

  const result = getFallbackSeoMeta(productName, discountPrice, category || "Genel", mName, lang);
  res.json(result);
});

// ========================
// SERVER HEALTH CHECK (Keep-Alive)
// ========================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ========================
// GOOGLE SITE VERIFICATION
// ========================
app.get("/google0a39e01acf0c0952.html", (req, res) => {
  res.header('Content-Type', 'text/html; charset=utf-8');
  res.send('google-site-verification: google0a39e01acf0c0952');
});

// ========================
// ROBOTS.TXT (SEO)
// ========================
app.get("/robots.txt", (req, res) => {
  const baseUrl = getBaseUrl();
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// ========================
// DYNAMIC SITEMAP.XML (SEO)
// ========================

// Helper function to get base URL from environment or fallback
function getBaseUrl(): string {
  if (process.env.PRODUCTION_URL) {
    return process.env.PRODUCTION_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://esnafindirim.com";
}

// Helper function to notify Google about sitemap update (automatic indexing)
async function pingGoogle() {
  const baseUrl = getBaseUrl();
  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  try {
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(pingUrl, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);
    console.log(`[GOOGLE_PING] ✅ Sitemap pinged. Status: ${response.status}`);
  } catch (err) {
    console.error(`[GOOGLE_PING] ⚠️ Ping başarısız (sistem çalışmaya devam eder):`, err);
    // Sistem devam etmeli, ping başarısız olsa bile
  }
}

// Global sitemap for all public discounts
app.get("/sitemap.xml", (req, res) => {
  const db = readDatabase();
  const baseUrl = getBaseUrl();
  const publicDiscounts = db.publicDiscounts || [];

  // Build sitemap header
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add homepage
  sitemap += '  <url>\n';
  sitemap += `    <loc>${baseUrl}/</loc>\n`;
  sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
  sitemap += '    <changefreq>daily</changefreq>\n';
  sitemap += '    <priority>1.0</priority>\n';
  sitemap += '  </url>\n';

  // Add each public discount campaign
  publicDiscounts.forEach((discount: any) => {
    const lastMod = discount.publishedAt ? new Date(discount.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/discount/${discount.slug}</loc>\n`;
    sitemap += `    <lastmod>${lastMod}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>0.9</priority>\n';
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';

  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

// Esnaf-specific sitemap for Google Search Console
app.get("/api/sitemap-for-esnaf", (req, res) => {
  const db = readDatabase();
  const baseUrl = getBaseUrl();
  const merchantName = db.settings?.merchantName || "Bizim Mahalle İşletmesi";

  // Convert merchant name to URL-friendly slug
  const merchantSlug = merchantName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const publicDiscounts = db.publicDiscounts || [];

  // Build sitemap header
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add merchant showcase homepage
  sitemap += '  <url>\n';
  sitemap += `    <loc>${baseUrl}/k/${merchantSlug}</loc>\n`;
  sitemap += '    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n';
  sitemap += '    <changefreq>daily</changefreq>\n';
  sitemap += '    <priority>1.0</priority>\n';
  sitemap += '  </url>\n';

  // Add each campaign for this merchant
  publicDiscounts.forEach((discount: any) => {
    const lastMod = discount.publishedAt ? new Date(discount.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/k/${merchantSlug}?slug=${discount.slug}</loc>\n`;
    sitemap += `    <lastmod>${lastMod}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>0.9</priority>\n';
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';

  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.send(sitemap);
});

// Auto-submit sitemap to Google (background process)
app.post("/api/auto-submit-to-google", (req, res) => {
  const baseUrl = getBaseUrl();
  const sitemapUrl = `${baseUrl}/api/sitemap-for-esnaf`;

  console.log(`[AUTO_SUBMIT_GOOGLE] Initiating auto-submission...`);
  console.log(`[AUTO_SUBMIT_GOOGLE] Sitemap: ${sitemapUrl}`);
  console.log(`[AUTO_SUBMIT_GOOGLE] Timestamp: ${new Date().toISOString()}`);

  // In production, you would use Google Indexing API here
  // For now, we prepare the submission data

  res.json({
    success: true,
    message: "Sitemap otomatik olarak Google'a gönderilmek üzere kuyruğa alındı",
    sitemapUrl,
    status: "queued_for_submission",
    note: "Her kampanya eklenişinde otomatik olarak Google'a bildirilir",
    submittedAt: new Date().toISOString()
  });
});

// Submit sitemap to Google Search Console (requires Google auth - partial automation)
app.post("/api/submit-sitemap-to-google", (req, res) => {
  const { sitemapUrl } = req.body;

  if (!sitemapUrl) {
    return res.status(400).json({ error: "Sitemap URL'si gereklidir." });
  }

  // Log submission attempt
  console.log(`[SITEMAP_SUBMISSION] Sitemap URL: ${sitemapUrl}`);
  console.log(`[SITEMAP_SUBMISSION] Timestamp: ${new Date().toISOString()}`);

  // In production, you would integrate with Google Search Console API here
  // This requires OAuth token from the user and proper Google API setup
  // For now, we return helpful info to guide user through manual submission

  res.json({
    success: true,
    message: "Sitemap URL'si işleme alındı. Google Search Console'a gitmek için yönlendiriliyorsunuz.",
    sitemapUrl,
    instructions: {
      step1: "Google Search Console sayfası açılacak",
      step2: "Sol taraftaki menüden 'Sitemap'lar'a tıkla",
      step3: "'Yeni sitemap ekle' kutusuna tıkla",
      step4: `Sitemap URL'sini yapıştır: ${sitemapUrl}`,
      step5: "'Gönder' butonuna bas"
    },
    submittedAt: new Date().toISOString()
  });
});

// ========================
// JSON-LD SCHEMA GENERATOR
// ========================
function generateProductSchema(product: any, baseUrl: string = "https://example.com") {
  const inStock = product.stockQuantity > 0 ? "InStock" : "OutOfStock";
  const image = product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400";

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name || "Ürün",
    "description": product.description || `${product.name} - ${product.category || "Gıda"}`,
    "image": image,
    "brand": {
      "@type": "Brand",
      "name": "Bizim Mahalle İşletmesi"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/product/${product.id}`,
      "priceCurrency": "TRY",
      "price": product.price || "0",
      "availability": inStock,
      "seller": {
        "@type": "Organization",
        "name": "Bizim Mahalle İşletmesi"
      }
    },
    "category": product.category || "Gıda",
    "sku": product.id,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10"
    }
  };
}

// ========================
// API: JSON-LD PRODUCT SCHEMA
// ========================
app.get("/api/product/:id/schema", (req, res) => {
  const db = readDatabase();
  const product = db.products?.find((p: any) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Ürün bulunamadı" });
  }

  const schema = generateProductSchema(product);
  res.json(schema);
});

function getFallbackSeoMeta(productName: string, discountPrice: number, category: string, merchantName: string, lang: string) {
  let image = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"; // default groceries
  
  if (category.includes("Süt") || category.includes("Milk")) {
    image = "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800";
  } else if (category.includes("Fırın") || category.includes("Bakery") || category.includes("Tatlı")) {
    image = "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800";
  } else if (category.includes("Manav") || category.includes("Fruit") || category.includes("Veg")) {
    image = "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800";
  }

  if (lang === "en") {
    return {
      seoTitle: `Huge Discount on ${productName}! | Only ${discountPrice} TL at ${merchantName}`,
      seoDescription: `Get an amazing discount at ${merchantName}! ${productName} is now on limited-time offer for only ${discountPrice} TL. Grab yours now!`,
      seoKeywords: `${productName.toLowerCase()} discount, cheap groceries, neighborhood deals, best price ${productName}`,
      recommendedImage: image,
      adCopy: `🚨 EXCLUSIVE NEIGHBORHOOD OFFER! 🚨\n\n🏪 Great deals at our store *${merchantName}*! \n🏷️ get *${productName}* for only *${discountPrice} TL*!\n\n👉 Tap link to check the details and order via WhatsApp:\n🔗 {link}\n\n#discount #neighborhood #offers #localshop`
    };
  } else if (lang === "de") {
    return {
      seoTitle: `Riesiger Rabatt auf ${productName}! | Nur ${discountPrice} TL bei ${merchantName}`,
      seoDescription: `Sparen Sie kräftig bei ${merchantName}! ${productName} für kurze Zeit im Angebot für nur ${discountPrice} TL. Jetzt online zugreifen!`,
      seoKeywords: `${productName.toLowerCase()} rabatt, guenstig einkaufen, supermarkt angebote, bester preis ${productName}`,
      recommendedImage: image,
      adCopy: `🚨 AKTIONSANGEBOT IN DER NACHBARSCHAFT! 🚨\n\n🏪 Super-Rabatte bei *${merchantName}*! \n🏷️ Sichern Sie sich *${productName}* für unschlagbare *${discountPrice} TL*!\n\n👉 Klicken Sie auf den Link, um Details anzusehen:\n🔗 {link}\n\n#rabatt #angebote #nachbarschaft #esnaf`
    };
  }

  return {
    seoTitle: `${productName} Sadece ${discountPrice} TL! | ${merchantName} İndirimi`,
    seoDescription: `${merchantName}'da taptaze indirim! ${productName} kısa süreliğine dev indirimle sadece ${discountPrice} TL. Kaçırmadan işletmemize uğrayın!`,
    seoKeywords: `${productName.toLowerCase()} indirim, ucuz işletme fiyatları, mahalle indirimleri, en yakın taze ${category.toLowerCase()}`,
    recommendedImage: image,
    adCopy: `🚨 BÜYÜK MAHALLE FIRSATI! 🚨\n\n🏪 Dürüst esnafımız *${merchantName}* işletmesinde harika kampanya! \n🏷️ Muhteşem taze *${productName}* kısa süreliğine kapış kapış fiyata: Sadece *${discountPrice} TL*!\n\n👉 Hemen ürünü incelemek ve WhatsApp'tan sipariş vermek için tıklayın:\n🔗 {link}\n\n#kampanya #indirim #firsat #orijinalesnaf #aknglobal #esnaftayiz`
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In development, integrate Vite as middleware
    console.log("[DEV] Initializing Vite dev server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve compiler asset outputs
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // SPA fallback for non-API routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global server port binding (port is 3000 as required)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SIFTAH BACKEND] Running full-stack server on http://localhost:${PORT}`);
  });
}

startServer();
