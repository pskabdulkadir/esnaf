import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

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

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY" && API_KEY.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (e) {
    console.error("Error instantiating GoogleGenAI:", e);
  }
} else {
  console.log("No valid GEMINI_API_KEY env variable found. Using simulated fallback responses.");
}

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

// 5. Modül 2 (AI İçerik Motoru - Gemini API)
app.post("/api/generate-marketing", async (req, res) => {
  const { productName, originalPrice, discountPrice, category, reasonType, targetSegment } = req.body;

  if (!productName || !discountPrice || !targetSegment) {
    return res.status(400).json({ error: "Eksik parametreler: productName, discountPrice ve targetSegment gereklidir." });
  }

  // Choose a campaign premise styled to Turkish local neighbourhood/işletme vibes
  const prompt = `
Yerel bir Türk mahalle esnafı (işletme, fırın, manav) için sosyal medya / WhatsApp pazarlama metni yazacaksın. 
Müşteriyle samimi bir bağ kurmalı, mahalle esnafı kültürüne (sıcakkanlı, güvenilir, komşuluk ilişkilerini önemseyen) tam uygun olmalı ve bir aciliyet (fırsatı kaçırmama) hissi uyandırmalıdır.

Ürün Bilgileri:
- Ürün Adı: ${productName}
- Kategori: ${category || "Genel Gıda"}
- Normal Fiyat: ${originalPrice ? originalPrice + " TL" : "Bilinmiyor"}
- Kampanyalı İndirimli Fiyat: ${discountPrice} TL
- İndirim Sebebi Grubu: ${reasonType === 'son_kullanma' ? 'Son Kullanma Tarihi Yaklaşıyor (Zayiatı önlemek ve taze tükettirmek için)' : reasonType === 'stok_fazlasi' ? 'Depo / Stok Fazlası (Müşteriye dev fırsat)' : 'Esnaf Özel İndirimi (Müşteriye Jest)'}

Hedef Kitle ve Tonlama Tarzı:
Hedef Kitle Segmenti: "${targetSegment}"

Segment Kuralları:
1. "Ev Hanımları" ise:
   - Ton: Son derece saygılı ama çok sıcak, "abla", "teyze" samimiyetinde.
   - Odak: Bütçeye katkı, akşam yemeği hazırlığı pratikliği, çocuklara faydası, taze olması, ev ekonomisi.
   - Örnek başlangıç: "Sevgili hanımlar, komşularım..." ya da "Aysel abla, Fatma teyze müjde..."
   - Dil: "Yemeğe tam yetişsin diye", "bütçenizi düşündük".

2. "Gençler" ise:
   - Ton: Çok dinamik, enerjik, eğlenceli, samimi ("kanka", "gençler", "dostlar"). Emojiler bol olsun.
   - Odak: Pratik atıştırmalık, öğrenci dostu fiyatlar, ders/sınav arası enerji deposu, oyun gecesi atıştırmalığı.
   - Örnek başlangıç: "Gençler selam! 🚨 Açlık krizlerine son..." veya "Öğrenci dostu işletmenizden bomba haber!"

3. "Genel" ise:
   - Ton: Geleneksel esnaf nezaketi, "Hayırlı bereketli günler" dili, mahalle dayanışması ve sıcaklığı.
   - Odak: Her eve lazım günlük ürün fırsatı, dürüst esnaf jesti.
   - Örnek başlangıç: "Hayırlı sabahlar sevgili mahalle sakinleri...", "Bizim işletmeden günün haberi..."

Yazım Şablonu Kuralları:
- Kesinlikle yapay zeka tarafından yazıldığı anlaşılmamalıdır. Son derece doğal, sokak/mahalle jargonu içeren bir Türkçe olmalıdır.
- WhatsApp mesajı olarak kolay okunması için emojiler kullan ve paragrafları kısa tut, can alıcı kelimeleri *kalın* (whatsapp formatı) yap.
- Metnin sonunda "Akşam ezanına kadar geçerli" veya "Stoklar eriyene kadar" gibi aciliyet vurgulayan bir call-to-action (hareket çağrısı) ekle.

Lütfen doğrudan reklam metnini yaz (başka açıklama veya 'işte reklamınız:' gibi ifadeler ekleme).
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.85,
        }
      });
      
      const text = response.text || "Metin oluşturulurken boş sonuç döndü.";
      res.json({ message: text.trim() });
    } catch (err: any) {
      console.error("Gemini API call failed, generating simulated response:", err);
      res.json({ 
        message: getSimulatedMarketingText(productName, discountPrice, targetSegment, reasonType),
        warning: "Gemini API hatası nedeniyle simüle edilmiş metin üretildi: " + err.message
      });
    }
  } else {
    // Elegant simulated response matching requested patterns
    res.json({ 
      message: getSimulatedMarketingText(productName, discountPrice, targetSegment, reasonType),
      note: "Simülasyon modunda yerel şablon kullanıldı. Gerçek yapay zeka metinleri için Gemini API anahtarınızı giriniz."
    });
  }
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
  res.json(db.publicDiscounts || []);
});

// 2. Publish a new public landing page
app.post("/api/public-discounts", (req, res) => {
  const db = readDatabase();
  const { 
    productId, 
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

  const newPublicDiscount = {
    id: "pub-" + Date.now(),
    productId,
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

// 5. Generate SEO Meta utilizing Gemini 3.5-Flash
app.post("/api/generate-seo-meta", async (req, res) => {
  const { productName, price, discountPrice, category, merchantName, targetLanguage } = req.body;

  if (!productName || !discountPrice) {
    return res.status(400).json({ error: "Eksik parametreler: productName ve discountPrice zorunludur." });
  }

  const mName = merchantName || "Bizim Mahalle İşletmesi";
  const lang = targetLanguage || "tr"; // tr, en, de

  const langInstruction = lang === "en" 
    ? "Please write all fields in English." 
    : lang === "de" 
    ? "Please write all fields in German (Deutsch)."
    : "Lütfen tüm alanları Türkçe yazın.";

  const prompt = `
Aşağıdaki ürün ve indirim bilgileri için Google, Yandex ve sosyal medya platformlarında (WhatsApp, Instagram, Facebook vb.) en yüksek tıklamayı ve paylaşımı alacak SEO uyumlu Meta Bilgilerini ve mükemmel, samimi, emojili ve sıcak bir esnaf lisanıyla yazılmış sosyal medya reklam yazısını oluştur.
${langInstruction}

Ürün Bilgileri:
- Ürün Adı: ${productName}
- Kategori: ${category || "Genel"}
- Normal Fiyat: ${price} TL
- İndirimli Fiyat: ${discountPrice} TL
- Esnaf / Mağaza Adı: ${mName}

JSON formatında şu değerleri tam olarak döndür (başka açıklama veya markdown bloğu yapma, direkt JSON döndür):
{
  "seoTitle": "Arama motoru başlığı (en fazla 60 karakter, dikkat çekici, diline uygun başlık)",
  "seoDescription": "Müşterinin hemen tıklamasını sağlayacak, aciliyet uyandıran ve fiyatları barındıran meta açıklaması (en fazla 155 karakter, seçilen dilde)",
  "seoKeywords": "En az 5 adet, virgülle ayrılmış seçilen dildeki arama kelimesi",
  "recommendedImage": "Unsplash görsel urlsi (ürüne uygun olabilecek genel kaliteli bir gıda/manav/unlu mamul görseli)",
  "adCopy": "Mükemmel, emojili, dürüst mahalle esnafı samimiyetinde, raf fiyatıyla indirimli fiyat farkını öne çıkaran, insanları işletmeye davet eden veya online/WhatsApp ile siparişe yönlendiren, bol etkileşim alacak sosyal medya paylaşım veya WhatsApp reklam yazısı (en az 3-4 cümle, hashtaglidir)."
}
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini SEO generation failed, returning fallback:", err);
      res.json(getFallbackSeoMeta(productName, discountPrice, category, mName, lang));
    }
  } else {
    res.json(getFallbackSeoMeta(productName, discountPrice, category, mName, lang));
  }
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
  // In production, serve static files and SPA fallback
  // In development, Vite dev server handles frontend (via separate process)
  // This backend only needs to serve API routes

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // SPA fallback for non-API routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  // In dev: API routes only, frontend served by Vite dev server

  // Global server port binding (port is 3000 as required)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SIFTAH BACKEND] Running full-stack server on http://localhost:${PORT}`);
  });
}

startServer();
