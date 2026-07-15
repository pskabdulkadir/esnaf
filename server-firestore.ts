import express from "express";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import * as admin from "firebase-admin";
import { db } from "./src/lib/firebase";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Increase JSON payload limit for images (up to 50MB for base64 images)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

console.log("🚀 Siftah: Firestore-based Backend başlatılıyor...");

// ============================================
// MIDDLEWARE: Authentication (Lisans Anahtarı)
// ============================================
interface AuthRequest extends express.Request {
  user?: {
    userId: string;
  };
}

app.use((req: AuthRequest, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    req.user = { userId: authHeader.slice(7) };
  }
  next();
});

// Auth guard middleware
function requireAuth(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  if (!req.user?.userId) {
    return res.status(401).json({ error: "Yetkilendirme gerekli (Authorization header: Bearer {userId})" });
  }
  next();
}

// ============================================
// HEALTH CHECK
// ============================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "Firestore",
    environment: process.env.NODE_ENV || "development"
  });
});

// ============================================
// 1. PRODUCTS API
// ============================================

app.get("/api/products", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("products")
      .get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Ürünler alınamadı" });
  }
});

app.post("/api/products", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    // Validation
    if (!req.body.name || typeof req.body.name !== "string" || req.body.name.trim().length === 0) {
      return res.status(400).json({ error: "Ürün adı gereklidir" });
    }
    if (typeof req.body.price !== "number" || req.body.price < 0) {
      return res.status(400).json({ error: "Fiyat geçerli bir sayı olmalıdır" });
    }

    const productId = "prod_" + Date.now();
    const now = admin.firestore.Timestamp.now();

    const productData = {
      name: req.body.name.trim(),
      price: Number(req.body.price),
      stockQuantity: Math.max(0, Number(req.body.stockQuantity) || 0),
      stockLimit: Math.max(1, Number(req.body.stockLimit) || 10),
      category: req.body.category || "Genel",
      expiryDate: req.body.expiryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isSpecialDiscount: req.body.isSpecialDiscount === true,
      lastUpdated: now,
      createdAt: now
    };

    await db
      .collection("users")
      .doc(userId)
      .collection("products")
      .doc(productId)
      .set(productData);

    res.status(201).json({ id: productId, ...productData });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Ürün kaydedilemedi" });
  }
});

app.put("/api/products/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("products")
      .doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }

    const updateData = {
      name: req.body.name ?? doc.data()?.name,
      price: req.body.price !== undefined ? Number(req.body.price) : doc.data()?.price,
      stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : doc.data()?.stockQuantity,
      stockLimit: req.body.stockLimit !== undefined ? Number(req.body.stockLimit) : doc.data()?.stockLimit,
      category: req.body.category ?? doc.data()?.category,
      expiryDate: req.body.expiryDate ?? doc.data()?.expiryDate,
      isSpecialDiscount: req.body.isSpecialDiscount !== undefined ? req.body.isSpecialDiscount === true : doc.data()?.isSpecialDiscount,
      lastUpdated: admin.firestore.Timestamp.now()
    };

    await docRef.update(updateData);
    res.json({ id, ...updateData });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Ürün güncellenemedi" });
  }
});

app.delete("/api/products/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await db
      .collection("users")
      .doc(userId)
      .collection("products")
      .doc(id)
      .delete();

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Ürün silinemedi" });
  }
});

// ============================================
// 2. CUSTOMERS API
// ============================================

app.get("/api/customers", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("customers")
      .get();

    const customers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Müşteriler alınamadı" });
  }
});

// ============================================
// 3. CAMPAIGNS API
// ============================================

app.get("/api/campaigns", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("campaigns")
      .get();

    const campaigns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(campaigns);
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    res.status(500).json({ error: "Kampanyalar alınamadı" });
  }
});

app.post("/api/campaigns", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const campaignId = "camp_" + Date.now();
    const now = admin.firestore.Timestamp.now();

    const campaignData = {
      productId: req.body.productId,
      productName: req.body.productName,
      originalPrice: Number(req.body.originalPrice),
      discountPrice: Number(req.body.discountPrice),
      targetSegment: req.body.targetSegment,
      messageContent: req.body.messageContent,
      deliveryTime: req.body.deliveryTime,
      status: req.body.status || "Taslak",
      sentCount: 0,
      logs: [],
      createdAt: now,
      approvedAt: req.body.status === "Kuyrukta" ? now : null,
      updatedAt: now
    };

    await db
      .collection("users")
      .doc(userId)
      .collection("campaigns")
      .doc(campaignId)
      .set(campaignData);

    res.status(201).json({ id: campaignId, ...campaignData });
  } catch (err) {
    console.error("Error creating campaign:", err);
    res.status(500).json({ error: "Kampanya kaydedilemedi" });
  }
});

app.put("/api/campaigns/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("campaigns")
      .doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Kampanya bulunamadı" });
    }

    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.Timestamp.now()
    };

    await docRef.update(updateData);
    res.json({ id, ...updateData });
  } catch (err) {
    console.error("Error updating campaign:", err);
    res.status(500).json({ error: "Kampanya güncellenemedi" });
  }
});

// ============================================
// 4. PUBLIC DISCOUNTS API
// ============================================

app.get("/api/public-discounts", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId query parametresi gerekli" });
    }

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("publicDiscounts")
      .get();

    const discounts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(discounts);
  } catch (err) {
    console.error("Error fetching public discounts:", err);
    res.status(500).json({ error: "İndirimler alınamadı" });
  }
});

app.post("/api/public-discounts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Validation
    const { productId, originalPrice, discountPrice, seoTitle, seoDescription } = req.body;
    if (!productId || !originalPrice || !discountPrice) {
      return res.status(400).json({ error: "Eksik alanlar: productId, originalPrice, discountPrice gerekli" });
    }

    const discountId = "discount_" + Date.now();
    const now = admin.firestore.Timestamp.now();

    const discountData = {
      productId,
      productName: req.body.productName,
      slug: req.body.slug || productId.toLowerCase().replace(/\s+/g, "-"),
      originalPrice: Number(originalPrice),
      discountPrice: Number(discountPrice),
      category: req.body.category || "Genel",
      merchantName: req.body.merchantName,
      merchantPhone: req.body.merchantPhone,
      merchantWhatsApp: req.body.merchantWhatsApp,
      seoTitle,
      seoDescription,
      seoKeywords: req.body.seoKeywords || "",
      openGraphImage: req.body.openGraphImage || "",
      adCopy: req.body.adCopy || "",
      views: 0,
      shares: 0,
      isActive: true,
      publishMode: req.body.publishMode || "global",
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      radiusKm: req.body.radiusKm,
      publishedAt: now,
      createdAt: now,
      updatedAt: now
    };

    await db
      .collection("users")
      .doc(userId)
      .collection("publicDiscounts")
      .doc(discountId)
      .set(discountData);

    res.status(201).json({ id: discountId, ...discountData });
  } catch (err) {
    console.error("Error creating public discount:", err);
    res.status(500).json({ error: "İndirim kaydedilemedi" });
  }
});

app.put("/api/public-discounts/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("publicDiscounts")
      .doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "İndirim bulunamadı" });
    }

    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.Timestamp.now()
    };

    await docRef.update(updateData);
    res.json({ id, ...updateData });
  } catch (err) {
    console.error("Error updating public discount:", err);
    res.status(500).json({ error: "İndirim güncellenemedi" });
  }
});

app.put("/api/public-discounts/:id/views", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId query parametresi gerekli" });
    }

    const { id } = req.params;
    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("publicDiscounts")
      .doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "İndirim bulunamadı" });
    }

    const currentViews = doc.data()?.views || 0;
    await docRef.update({
      views: currentViews + 1,
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.json({ success: true, views: currentViews + 1 });
  } catch (err) {
    console.error("Error updating views:", err);
    res.status(500).json({ error: "Görüntülemeler güncellenemedi" });
  }
});

app.put("/api/public-discounts/:id/shares", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId query parametresi gerekli" });
    }

    const { id } = req.params;
    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("publicDiscounts")
      .doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "İndirim bulunamadı" });
    }

    const currentShares = doc.data()?.shares || 0;
    await docRef.update({
      shares: currentShares + 1,
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.json({ success: true, shares: currentShares + 1 });
  } catch (err) {
    console.error("Error updating shares:", err);
    res.status(500).json({ error: "Paylaşımlar güncellenemedi" });
  }
});

app.delete("/api/public-discounts/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await db
      .collection("users")
      .doc(userId)
      .collection("publicDiscounts")
      .doc(id)
      .delete();

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting public discount:", err);
    res.status(500).json({ error: "İndirim silinemedi" });
  }
});

// ============================================
// 5. SETTINGS API
// ============================================

app.get("/api/settings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const doc = await db
      .collection("users")
      .doc(userId)
      .collection("data")
      .doc("user_data")
      .get();

    const settings = doc.exists ? doc.data() : {
      language: "tr",
      merchantName: "Bilinmeyen İşletme",
      merchantPhone: "",
      merchantWhatsApp: ""
    };

    res.json(settings);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: "Ayarlar alınamadı" });
  }
});

app.post("/api/settings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const settingsData = {
      language: req.body.language || "tr",
      merchantName: req.body.merchantName,
      merchantPhone: req.body.merchantPhone,
      merchantWhatsApp: req.body.merchantWhatsApp,
      updatedAt: admin.firestore.Timestamp.now()
    };

    await db
      .collection("users")
      .doc(userId)
      .collection("data")
      .doc("user_data")
      .set(settingsData, { merge: true });

    res.json({ success: true, ...settingsData });
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ error: "Ayarlar güncellenemedi" });
  }
});

// ============================================
// 6. SITEMAP & SEO APIs
// ============================================

app.get("/api/sitemap-for-esnaf", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.json([]);
    }

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("publicDiscounts")
      .where("isActive", "==", true)
      .get();

    const sitemapData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug,
        title: data.seoTitle,
        description: data.seoDescription,
        lastmod: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
        priority: 0.8
      };
    });

    res.json(sitemapData);
  } catch (err) {
    console.error("Error fetching sitemap data:", err);
    res.status(500).json({ error: "Sitemap verisi alınamadı" });
  }
});

app.get("/api/sitemap-for-esnaf.xml", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.type("application/xml").send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("publicDiscounts")
      .where("isActive", "==", true)
      .get();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const lastmod = data.updatedAt?.toDate?.().toISOString() || new Date().toISOString();
      const url = `${process.env.PRODUCTION_URL || "http://localhost:3000"}/discount/${data.slug}`;

      xml += `  <url>\n`;
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += '</urlset>';

    res.type("application/xml").send(xml);
  } catch (err) {
    console.error("Error generating sitemap XML:", err);
    res.type("application/xml").send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

// ============================================
// 7. EXPORT/BACKUP API (Yeni - Firestore'dan JSON export)
// ============================================

app.get("/api/export-backup", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Tüm user verilerini oku
    const productsSnap = await db.collection("users").doc(userId).collection("products").get();
    const customersSnap = await db.collection("users").doc(userId).collection("customers").get();
    const campaignsSnap = await db.collection("users").doc(userId).collection("campaigns").get();
    const discountsSnap = await db.collection("users").doc(userId).collection("publicDiscounts").get();
    const settingsSnap = await db.collection("users").doc(userId).collection("data").doc("user_data").get();

    const backup = {
      products: productsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      customers: customersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      campaigns: campaignsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      publicDiscounts: discountsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      settings: settingsSnap.exists ? settingsSnap.data() : {},
      exportedAt: new Date().toISOString(),
      userId
    };

    // JSON dosyası olarak gönder
    res.setHeader("Content-Disposition", `attachment; filename="backup_${userId}_${Date.now()}.json"`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    console.error("Error exporting backup:", err);
    res.status(500).json({ error: "Backup export edilemedi" });
  }
});

// ============================================
// 8. IMPORT/RESTORE API (Yeni - JSON'dan Firestore'a restore)
// ============================================

app.post("/api/restore-backup", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { products, customers, campaigns, publicDiscounts, settings } = req.body;

    const batch = db.batch();

    // Ürünler
    if (Array.isArray(products) && products.length > 0) {
      products.forEach(product => {
        const docRef = db
          .collection("users")
          .doc(userId)
          .collection("products")
          .doc(product.id || "prod_" + Date.now());
        batch.set(docRef, product);
      });
    }

    // Müşteriler
    if (Array.isArray(customers) && customers.length > 0) {
      customers.forEach(customer => {
        const docRef = db
          .collection("users")
          .doc(userId)
          .collection("customers")
          .doc(customer.id || "cust_" + Date.now());
        batch.set(docRef, customer);
      });
    }

    // Kampanyalar
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      campaigns.forEach(campaign => {
        const docRef = db
          .collection("users")
          .doc(userId)
          .collection("campaigns")
          .doc(campaign.id || "camp_" + Date.now());
        batch.set(docRef, campaign);
      });
    }

    // Public Discounts
    if (Array.isArray(publicDiscounts) && publicDiscounts.length > 0) {
      publicDiscounts.forEach(discount => {
        const docRef = db
          .collection("users")
          .doc(userId)
          .collection("publicDiscounts")
          .doc(discount.id || "discount_" + Date.now());
        batch.set(docRef, discount);
      });
    }

    // Settings
    if (settings && Object.keys(settings).length > 0) {
      const settingsRef = db
        .collection("users")
        .doc(userId)
        .collection("data")
        .doc("user_data");
      batch.set(settingsRef, settings, { merge: true });
    }

    await batch.commit();

    res.json({ success: true, message: "Veriler başarıyla restore edildi" });
  } catch (err) {
    console.error("Error restoring backup:", err);
    res.status(500).json({ error: "Backup restore edilemedi" });
  }
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
  console.log(`\n✅ Siftah Backend is running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔥 Database: Firestore (Multi-tenant: users/{userId})\n`);
});

export default app;
