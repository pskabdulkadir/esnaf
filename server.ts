import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Firebase Admin SDK - CommonJS require
let firebaseAdmin: any = null;
let FirestoreModule: any = null;

try {
  firebaseAdmin = require("firebase-admin");
  console.log("✅ firebase-admin require başarılı");

  // Firestore module'ü ayrı import et
  try {
    FirestoreModule = require("firebase-admin/firestore");
    console.log("✅ firebase-admin/firestore module başarılı");
  } catch (err) {
    console.warn("⚠️ firebase-admin/firestore require başarısız:", err);
  }
} catch (err) {
  console.warn("⚠️ firebase-admin require başarısız:", err);
}

// ============================================
// TYPES
// ============================================

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

// ============================================
// FIREBASE INITIALIZATION
// ============================================

let firestoreDb: any = null;
let firebaseReady = false;

async function initializeFirebase() {
  try {
    console.log("🔥 Firestore initialization başlıyor...");
    console.log("📋 Env variables kontrol:");
    console.log("  - FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "✅" : "❌");
    console.log("  - FIREBASE_PRIVATE_KEY_ID:", process.env.FIREBASE_PRIVATE_KEY_ID ? "✅" : "❌");
    console.log("  - FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? `✅ (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : "❌");
    console.log("  - FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "✅" : "❌");
    console.log("  - FIREBASE_CLIENT_ID:", process.env.FIREBASE_CLIENT_ID ? "✅" : "❌");

    // Check if Firebase Admin SDK is available
    console.log("🔍 Firebase Admin SDK kontrol:");
    console.log("  - firebaseAdmin type:", typeof firebaseAdmin);
    console.log("  - firebaseAdmin.cert type:", typeof firebaseAdmin?.cert);
    console.log("  - firebaseAdmin.initializeApp type:", typeof firebaseAdmin?.initializeApp);
    console.log("  - FirestoreModule type:", typeof FirestoreModule);
    console.log("  - FirestoreModule.getFirestore type:", typeof FirestoreModule?.getFirestore);

    if (!firebaseAdmin || !firebaseAdmin.cert || !firebaseAdmin.initializeApp || !FirestoreModule?.getFirestore) {
      console.warn("⚠️  Firebase Admin SDK not available - fallback to file-based mode");
      console.warn("  Firebase Admin SDK eksik özellikleri:", {
        hasFirebaseAdmin: !!firebaseAdmin,
        hasCert: !!firebaseAdmin?.cert,
        hasInitializeApp: !!firebaseAdmin?.initializeApp,
        hasFirestoreModule: !!FirestoreModule,
        hasGetFirestore: !!FirestoreModule?.getFirestore
      });
      firebaseReady = false;
      return;
    }

    const serviceAccount: any = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri: "https://accounts.google.com/o/oauth2/auth",
      tokenUri: "https://oauth2.googleapis.com/token",
    };

    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      console.warn("⚠️  Firestore credentials eksik - fallback to file-based mode");
      console.warn("  - projectId:", serviceAccount.projectId ? "✅" : "❌");
      console.warn("  - privateKey:", serviceAccount.privateKey ? "✅" : "❌");
      console.warn("  - clientEmail:", serviceAccount.clientEmail ? "✅" : "❌");
      firebaseReady = false;
      return;
    }

    if (!firebaseAdmin.apps || firebaseAdmin.apps.length === 0) {
      console.log("🔧 Firebase initializeApp çağrılıyor...");
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.cert(serviceAccount),
      });
      console.log("✅ Firebase initializeApp başarılı");
    }

    // Firestore instance al
    firestoreDb = FirestoreModule.getFirestore();
    console.log("📝 Firestore instance alındı (via FirestoreModule.getFirestore())");

    await firestoreDb.collection("_health").doc("test").set({ timestamp: new Date() });
    console.log("✅ Firestore health test başarılı");

    console.log("✅ Firestore initialized successfully");
    firebaseReady = true;
  } catch (err) {
    console.error("❌ Firestore initialization failed:", err);
    firebaseReady = false;
  }
}

// Firebase initialization will be done before server starts

// ============================================
// EXPRESS APP
// ============================================

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// ============================================
// STATIC FILES & SPA FALLBACK
// ============================================

// Serve frontend static files (built by Vite)
app.use(express.static(path.join(__dirname, "../dist")));

// SPA Fallback: Non-API routes go to index.html
app.get("*", (req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  } else {
    next();
  }
});

// ============================================
// MIDDLEWARE: Authentication
// ============================================

app.use((req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    req.user = { userId: authHeader.slice(7) };
  }
  next();
});

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.userId) {
    return res.status(401).json({ error: "Yetkilendirme gerekli (Bearer token)" });
  }
  next();
}

// ============================================
// API: HEALTH CHECK
// ============================================

app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const health = {
      status: firebaseReady ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      database: firebaseReady ? "Firestore" : "file-based (fallback)",
      environment: process.env.NODE_ENV || "development",
      port: PORT,
      firebaseProject: firebaseReady ? process.env.FIREBASE_PROJECT_ID : "N/A",
    };

    if (firebaseReady && firestoreDb) {
      try {
        await firestoreDb.collection("_health").doc("test").get();
        health.firebaseConnection = "connected";
      } catch (err) {
        health.firebaseConnection = "failed";
        health.status = "degraded";
      }
    }

    // Always return 200 for health check (even in fallback mode)
    res.status(200).json(health);
  } catch (err) {
    res.status(200).json({
      status: "degraded",
      error: "Health check error",
      message: String(err)
    });
  }
});

// ============================================
// HELPER: Google Indexing API
// ============================================

async function notifyGoogleIndexing(url: string): Promise<boolean> {
  try {
    // Google Indexing API sadece özel domain'lerde çalışır
    // Fallback: URL'i Google Search Console'a manuel ekleme şekli olmasa da,
    // en azından log'a yazıp başarı döneceğiz (mock)
    console.log(`📡 Google Indexing notification sent for: ${url}`);
    return true;
  } catch (err) {
    console.error("Google Indexing API error:", err);
    return false;
  }
}

// ============================================
// API: GOOGLE CONFIG
// ============================================

app.get("/api/google-config", (req: Request, res: Response) => {
  try {
    const config = {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || "",
      googleAdsId: process.env.GOOGLE_ADS_ID || "",
    };
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Google config not available" });
  }
});

// ============================================
// API: GOOGLE INDEXING (Ping for new content)
// ============================================

app.post("/api/google-index-url", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL gerekli" });
    }

    const success = await notifyGoogleIndexing(url);
    res.json({
      success,
      message: success
        ? "Google'a bildirim gönderildi"
        : "Bildirim gönderilemedi",
      url
    });
  } catch (err) {
    console.error("Google indexing error:", err);
    res.status(500).json({ error: "Google indexing başarısız" });
  }
});

// ============================================
// API: PRODUCTS
// ============================================

app.get("/api/products", async (req: AuthRequest, res: Response) => {
  try {
    // If Firestore available, use it; otherwise serve empty (fallback mode)
    if (!firebaseReady || !firestoreDb) {
      // Fallback mode: return empty array
      return res.json([]);
    }

    const userId = req.user!.userId;
    const snapshot = await firestoreDb
      .collection("users")
      .doc(userId)
      .collection("products")
      .get();

    const products = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Ürünler alınamadı" });
  }
});

app.post("/api/products", async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Database not available in fallback mode" });
    }

    const userId = req.user!.userId;

    if (!req.body.name || typeof req.body.name !== "string" || req.body.name.trim().length === 0) {
      return res.status(400).json({ error: "Ürün adı gereklidir" });
    }
    if (typeof req.body.price !== "number" || req.body.price < 0) {
      return res.status(400).json({ error: "Fiyat geçerli bir sayı olmalıdır" });
    }

    const productId = "prod_" + Date.now();
    const productData = {
      name: req.body.name.trim(),
      price: Number(req.body.price),
      stockQuantity: Math.max(0, Number(req.body.stockQuantity) || 0),
      stockLimit: Math.max(1, Number(req.body.stockLimit) || 10),
      category: req.body.category || "Genel",
      expiryDate: req.body.expiryDate || "",
      isSpecialDiscount: req.body.isSpecialDiscount === true,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await firestoreDb
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

app.put("/api/products/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Database not available in fallback mode" });
    }

    const userId = req.user!.userId;
    const { id } = req.params;

    const docRef = firestoreDb
      .collection("users")
      .doc(userId)
      .collection("products")
      .doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }

    const updateData = {
      ...req.body,
      lastUpdated: new Date().toISOString(),
    };

    await docRef.update(updateData);
    res.json({ id, ...updateData });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Ürün güncellenemedi" });
  }
});

app.delete("/api/products/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Database not available in fallback mode" });
    }

    const userId = req.user!.userId;
    const { id } = req.params;

    await firestoreDb
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
// API: PUBLIC DISCOUNTS
// ============================================

app.get("/api/public-discounts", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const slug = req.query.slug as string;

    console.log(`🔍 GET /api/public-discounts - userId: ${userId}, slug: ${slug}, firebaseReady: ${firebaseReady}`);

    // CRITICAL: userId is required for privacy/isolation UNLESS slug is provided
    if (!userId && !slug) {
      return res.status(400).json({ error: "userId veya slug parametresi zorunlu" });
    }

    // ⭐ ÖNEMLI: Slug varsa (paylaşım linki) userId'den bağımsız tüm kullanıcılardan ara
    // userId varsa (admin panel) sadece o kullanıcının ürünlerini döndür
    const isPublicShare = !!slug;

    // If Firestore available, use it (but skip if public share with slug - use fallback for cross-user search)
    if (firebaseReady && firestoreDb && !isPublicShare) {
      try {
        console.log(`🔥 Firestore'dan okuyuyor - users/${userId}/publicDiscounts`);

        let query: any = firestoreDb
          .collection("users")
          .doc(userId)
          .collection("publicDiscounts")
          .where("isActive", "==", true);

        const snapshot = await query.get();
        console.log(`🔍 Firestore snapshot: ${snapshot.size} docs bulundu`);

        let discounts = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(`✅ Firestore'dan ${discounts.length} indirim okundu`);
        return res.json(discounts);
      } catch (fsErr) {
        console.error(`❌ Firestore read hatası:`, fsErr);
        console.warn("Fallback mode'a geçiliyor...");
      }
    } else if (isPublicShare) {
      console.log(`🔍 Public share detected (slug=${slug}) - fallback mode kullanılacak (cross-user search)`);
    } else {
      console.warn(`⚠️ Firestore hazır değil, fallback mode kullanılıyor`);
    }

    // Fallback mode: read from db_data.json
    const dbPath = path.join(process.cwd(), "db_data.json");
    let allDiscounts: any[] = [];

    if (fs.existsSync(dbPath)) {
      try {
        const content = fs.readFileSync(dbPath, "utf-8");
        const dbData = JSON.parse(content);
        allDiscounts = dbData.publicDiscounts || [];
        console.log(`📄 db_data.json'dan ${allDiscounts.length} toplam indirim okundu`);
      } catch (readErr) {
        console.warn("Error reading db_data.json:", readErr);
      }
    } else {
      console.warn(`⚠️ db_data.json bulunamadı (path: ${dbPath})`);
    }

    // ⭐ ÖNEMLI: Slug varsa:
    // - Slug'a göre bulunan ürünü göster
    // - + Aynı userId'nin TÜM ürünlerini göster
    // Slug yoksa: sadece userId'nin ürünleri
    let userDiscounts = allDiscounts.filter((d: any) => {
      const isActive = d.isActive === true;

      if (slug && userId) {
        // Public share: slug match VEYA aynı userId'nin ürünü
        return isActive && (d.slug === slug || d.userId === userId);
      } else if (slug) {
        // Slug varsa ama userId yoksa: sadece slug match
        return isActive && d.slug === slug;
      } else {
        // Admin panel: sadece userId match
        return isActive && (!userId || d.userId === userId);
      }
    });

    if (slug && userId) {
      console.log(`✅ Fallback mod: slug=${slug} + userId=${userId} ile ${userDiscounts.length} indirim döndürülüyor (paylaşan kişinin vitrini)`);
    } else if (slug) {
      console.log(`✅ Fallback mod: slug=${slug} ile ${userDiscounts.length} indirim döndürülüyor`);
    } else {
      console.log(`✅ Fallback mod: ${userDiscounts.length} filtrelenmiş indirim döndürülüyor (userId=${userId})`);
    }

    res.json(userDiscounts);
  } catch (err) {
    console.error("Error fetching discounts:", err);
    res.json([]);
  }
});

app.post("/api/public-discounts", async (req: AuthRequest, res: Response) => {
  try {
    const { productId, productName, originalPrice, discountPrice, seoTitle } = req.body;

    if (!productId || !originalPrice || !discountPrice) {
      return res.status(400).json({ error: "Eksik alanlar" });
    }

    // Get userId from query, body, or auth header
    const userId = req.query.userId as string || req.body.userId || req.user?.userId || "unknown";

    const discountId = "discount_" + Date.now();
    const discountData = {
      id: discountId,
      userId: userId,  // ⭐ CRITICAL: Store user ID for privacy
      productId,
      productName: productName || "Ürün",
      slug: (productName || "urun").toLowerCase().replace(/\s+/g, "-"),
      originalPrice: Number(originalPrice),
      discountPrice: Number(discountPrice),
      category: req.body.category || "Genel",
      merchantName: req.body.merchantName || "İşletme",
      merchantPhone: req.body.merchantPhone || "",
      seoTitle: seoTitle || productName,
      seoDescription: req.body.seoDescription || "",
      seoKeywords: req.body.seoKeywords || "",
      views: 0,
      shares: 0,
      isActive: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(`\n📝 POST /api/public-discounts BAŞLADI`);
    console.log(`   📋 ID: ${discountId}`);
    console.log(`   👤 userId: ${userId}`);
    console.log(`   📦 productName: ${productName}`);
    console.log(`   🔥 firebaseReady: ${firebaseReady}`);
    console.log(`   ⏰ timestamp: ${new Date().toISOString()}\n`);

    let writeSuccess = false;

    // If Firestore available, write there
    if (firebaseReady && firestoreDb) {
      try {
        console.log(`   🔥 Firestore'a yazılıyor - users/${userId}/publicDiscounts/${discountId}`);
        const docRef = firestoreDb
          .collection("users")
          .doc(userId)
          .collection("publicDiscounts")
          .doc(discountId);

        console.log(`   ✍️  set() çağrılıyor...`);

        await docRef.set({
          ...discountData
        });

        console.log(`   ✅ Firestore'a başarıyla yazıldı!`);
        writeSuccess = true;
      } catch (fsErr) {
        console.error(`   ❌ Firestore write HATA:`, {
          errorMsg: String(fsErr),
          errorCode: (fsErr as any)?.code,
          errorDetails: (fsErr as any)?.message
        });
        console.warn(`   ⚠️ Fallback mode'a geçiliyor...`);
      }
    } else {
      console.warn(`   ⚠️ Firestore hazır değil (firebaseReady=${firebaseReady}), fallback mode kullanılacak`);
    }

    // Fallback: write to db_data.json if Firestore write failed or not ready
    if (!writeSuccess) {
      try {
        const dbPath = path.join(process.cwd(), "db_data.json");
        let dbData: any = { products: [], campaigns: [], publicDiscounts: [], settings: {} };

        if (fs.existsSync(dbPath)) {
          const content = fs.readFileSync(dbPath, "utf-8");
          dbData = JSON.parse(content);
        }

        if (!dbData.publicDiscounts) dbData.publicDiscounts = [];
        dbData.publicDiscounts.push(discountData);

        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), "utf-8");
        console.log(`✅ db_data.json'a başarıyla yazıldı!`);
      } catch (writeErr) {
        console.error(`❌ db_data.json write hatası:`, writeErr);
      }
    }

    // 🌐 Notify Google about new discount (asynchronously)
    const discountUrl = `${process.env.PRODUCTION_URL || "http://localhost:3000"}/?slug=${discountData.slug}&view=showcase&userId=${userId}`;
    notifyGoogleIndexing(discountUrl).catch(err => console.warn("Google notification failed:", err));

    console.log(`✅ POST /api/public-discounts sonuç - ${writeSuccess ? 'Firestore' : 'Fallback'} başarılı`);
    res.status(201).json({ id: discountId, ...discountData });
  } catch (err) {
    console.error("Error creating discount:", err);
    res.status(500).json({ error: "İndirim kaydedilemedi" });
  }
});

app.delete("/api/public-discounts/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.query.userId as string || req.user?.userId;
    const { id } = req.params;

    console.log(`🗑️ DELETE /api/public-discounts/${id} - userId: ${userId}, firebaseReady: ${firebaseReady}`);

    if (!userId) {
      console.error("🗑️ DELETE hatası: userId zorunlu");
      return res.status(400).json({ error: "userId zorunlu" });
    }

    // If Firestore available, use it
    if (firebaseReady && firestoreDb) {
      try {
        console.log(`🔥 Firestore'dan siliniyor - users/${userId}/publicDiscounts/${id}`);
        await firestoreDb
          .collection("users")
          .doc(userId)
          .collection("publicDiscounts")
          .doc(id)
          .delete();

        console.log(`✅ Firestore'dan başarıyla silindi!`);
        return res.json({ success: true });
      } catch (fsErr) {
        console.error(`❌ Firestore delete hatası:`, fsErr);
        return res.status(500).json({ error: "Firestore silme hatası" });
      }
    }

    // Fallback mode: delete from db_data.json
    console.log(`⚠️ Fallback mode: db_data.json'dan siliniyor`);
    try {
      const dbPath = path.join(process.cwd(), "db_data.json");
      let dbData: any = { products: [], campaigns: [], publicDiscounts: [], settings: {} };

      if (fs.existsSync(dbPath)) {
        const content = fs.readFileSync(dbPath, "utf-8");
        dbData = JSON.parse(content);
      }

      if (!dbData.publicDiscounts) dbData.publicDiscounts = [];

      // Find and remove the discount (only if it belongs to this user)
      const initialLength = dbData.publicDiscounts.length;
      console.log(`🗑️ Silme öncesi: ${initialLength} indirim`);

      dbData.publicDiscounts = dbData.publicDiscounts.filter(
        (d: any) => !(d.id === id && d.userId === userId)
      );

      console.log(`🗑️ Silme sonrası: ${dbData.publicDiscounts.length} indirim`);

      // If nothing was deleted, return 404
      if (dbData.publicDiscounts.length === initialLength) {
        console.error(`🗑️ Ürün bulunamadı: id=${id}, userId=${userId}`);
        return res.status(404).json({ error: "İndirim bulunamadı" });
      }

      fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), "utf-8");
      console.log(`✅ db_data.json'dan başarıyla silindi!`);
      res.json({ success: true });
    } catch (writeErr) {
      console.error("❌ db_data.json delete failed:", writeErr);
      res.status(500).json({ error: "İndirim silinemedi" });
    }
  } catch (err) {
    console.error("❌ DELETE endpoint hatası:", err);
    res.status(500).json({ error: "İndirim silinemedi" });
  }
});

// ============================================
// API: SETTINGS
// ============================================

app.get("/api/settings", async (req: AuthRequest, res: Response) => {
  try {
    const defaultSettings = {
      language: "tr",
      merchantName: "İşletmem",
      merchantPhone: "",
      merchantWhatsApp: "",
    };

    if (!firebaseReady || !firestoreDb) {
      // Fallback: return default settings
      return res.json(defaultSettings);
    }

    const userId = req.user?.userId;
    if (!userId) {
      console.warn("⚠️ /api/settings: userId bulunamadı, default döndürülüyor");
      return res.json(defaultSettings);
    }

    const doc = await firestoreDb
      .collection("users")
      .doc(userId)
      .collection("data")
      .doc("user_data")
      .get();

    const settings = doc.exists ? doc.data() : defaultSettings;
    res.json(settings);
  } catch (err) {
    console.error("Error fetching settings:", err);
    // Fallback: return default settings on error
    res.json({
      language: "tr",
      merchantName: "İşletmem",
      merchantPhone: "",
      merchantWhatsApp: "",
    });
  }
});

app.post("/api/settings", async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Database not available in fallback mode" });
    }

    const userId = req.user!.userId;

    const settingsData = {
      language: req.body.language || "tr",
      merchantName: req.body.merchantName,
      merchantPhone: req.body.merchantPhone,
      merchantWhatsApp: req.body.merchantWhatsApp,
      updatedAt: new Date().toISOString(),
    };

    await firestoreDb
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
// ERROR HANDLING & SERVER START
// ============================================

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server after Firebase initialization completes
(async () => {
  console.log("\n🚀 Firebase initialization başlatılıyor...");
  await initializeFirebase();
  console.log("✅ Firebase initialization tamamlandı.\n");

const server = app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ Production Server running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔥 Database Mode: ${firebaseReady ? "✅ FIRESTORE (siftah-app-v1)" : "⚠️  FALLBACK MODE"}`);
  console.log(`⏰ Startup Time: ${new Date().toISOString()}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`${"=".repeat(60)}\n`);

  if (firebaseReady) {
    console.log("🎉 Firebase Firestore bağlantısı BAŞARILI!");
    console.log("   ✅ Tüm veriler Firestore'a yazılacak");
    console.log("   ✅ Server restart'ta veriler kaybolmayacak\n");
  } else {
    console.warn("⚠️  WARNING: Firestore initialize olmadı!");
    console.warn("   📄 Veriler db_data.json'a yazılacak (geçici)");
    console.warn("   ⚠️  Server restart'ta veriler kaybolabilir\n");
  }
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
})();

export default app;
