import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
// Firebase Admin SDK'yı standart import ile en başa alıyoruz.
// Bu, Vercel'in derleme sürecinde modülü doğru şekilde paketlemesini sağlar.
import admin from "firebase-admin";

>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
dotenv.config();

// ESM/CJS uyumlu __dirname tanımı
const __dirname = process.cwd();

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
// Firebase Admin SDK - Dynamic async import for proper ESM/CJS interop
let firebaseAdmin: any = null;
let firebaseImported = false;
let firebasePromise: Promise<any> | null = null;

async function loadFirebaseAdminSDK() {
  if (firebaseImported) return firebaseAdmin;

  if (firebasePromise) return firebasePromise;

  firebasePromise = (async () => {
    try {
      console.log("📥 Firebase Admin SDK'yı dinamik import etmeye başlıyor...");
      // firebase-admin v13 ESM import
      const admin = await import("firebase-admin");
      firebaseAdmin = admin.default || admin;
      firebaseImported = true;

      console.log("✅ firebase-admin import başarılı");
      console.log(`   - admin.credential type: ${typeof firebaseAdmin.credential}`);
      console.log(`   - admin.initializeApp type: ${typeof firebaseAdmin.initializeApp}`);
      console.log(`   - admin.firestore type: ${typeof firebaseAdmin.firestore}`);

      return firebaseAdmin;
    } catch (err) {
      console.warn("⚠️ firebase-admin import başarısız:", err);
      firebaseImported = true;
      return null;
    }
  })();

  return firebasePromise;
}

<<<<<<< HEAD
=======
=======
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4

    // Firebase Admin SDK'yı async import et
    const admin = await loadFirebaseAdminSDK();
    if (!admin) {
      console.warn("⚠️  Firebase Admin SDK yüklenemedi - fallback to file-based mode");
      firebaseReady = false;
      return;
    }

    console.log("📋 Env variables kontrol:");
    console.log("  - FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "✅" : "❌");
    console.log("  - FIREBASE_PRIVATE_KEY_ID:", process.env.FIREBASE_PRIVATE_KEY_ID ? "✅" : "❌");
    console.log("  - FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? `✅ (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : "❌");
    console.log("  - FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "✅" : "❌");
    console.log("  - FIREBASE_CLIENT_ID:", process.env.FIREBASE_CLIENT_ID ? "✅" : "❌");

    // Check if Firebase Admin SDK has required methods
    console.log("🔍 Firebase Admin SDK kontrol:");
    console.log("  - admin.credential type:", typeof admin?.credential);
    console.log("  - admin.credential.cert type:", typeof admin?.credential?.cert);
    console.log("  - admin.initializeApp type:", typeof admin?.initializeApp);
    console.log("  - admin.firestore type:", typeof admin?.firestore);

<<<<<<< HEAD
=======
=======
 
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
    if (!admin?.credential?.cert || !admin?.initializeApp || !admin?.firestore) {
      console.warn("⚠️  Firebase Admin SDK eksik metotlar - fallback to file-based mode");
      firebaseReady = false;
      return;
    }
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4

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

<<<<<<< HEAD
=======
=======
    // The service account object requires ONLY these three properties.
    // Extra properties can cause initialization to fail.
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
 
    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      console.warn("⚠️  Firestore credentials eksik - fallback to file-based mode");
      firebaseReady = false;
      return;
    }
 
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
    if (!admin.apps || admin.apps.length === 0) {
      console.log("🔧 Firebase initializeApp çağrılıyor...");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
      console.log("✅ Firebase initializeApp başarılı");
    }

    // Firestore instance al
    firestoreDb = admin.firestore();
    console.log("📝 Firestore instance alındı");

    // Sync health test - don't use await in sync context
    // Health check happens asynchronously when first query runs
    console.log("✅ Firestore instance ready (health check on first query)");

<<<<<<< HEAD
=======
=======
    }
 
    firestoreDb = admin.firestore();
 
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
    console.log("✅ Firestore initialized successfully");
    firebaseReady = true;
  } catch (err) {
    console.error("❌ Firestore initialization failed:", err);
    firebaseReady = false;
  }
}

<<<<<<< HEAD
// Firebase initialization will be done before server starts

=======
<<<<<<< HEAD
// Firebase initialization will be done before server starts

=======
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
// ============================================
// EXPRESS APP
// ============================================

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Increase JSON payload limit for images (up to 50MB for base64 images)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ============================================
// STATIC FILES & SPA FALLBACK
// ============================================

// Serve frontend static files (built by Vite)
// __dirname = process.cwd(), so dist is at ./dist or ../dist depending on runtime
const distPath = (() => {
  // Development: dist is in project root
  // Production: dist is in project root after build
  const p1 = path.join(__dirname, "dist");
  if (fs.existsSync(p1)) return p1;
  // Fallback for legacy paths
  return path.join(__dirname, "../dist");
})();

app.use(express.static(distPath));

// SPA Fallback: Non-API routes go to index.html
app.get("*", (req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(distPath, "index.html"));
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
<<<<<<< HEAD
  if (!req.user?.userId) {
=======
<<<<<<< HEAD
  if (!req.user?.userId) {
=======
  if (!req.user || !req.user.userId) {
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
    // Always return 200 for health check (even in fallback mode)
    res.status(200).json(health);
  } catch (err) {
    res.status(200).json({
      status: "degraded",
      error: "Health check error",
<<<<<<< HEAD
=======
=======
    res.status(health.status === "ok" ? 200 : 503).json(health);
  } catch (err) {
    res.status(500).json({
      status: "degraded",
      error: "Health check endpoint failed unexpectedly.",
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
      message: String(err)
    });
  }
});

// ============================================
// HELPER: Google Indexing API
// ============================================

async function notifyGoogleIndexing(url: string): Promise<boolean> {
  try {
    // Google Indexing API endpoint
    const endpoint = "https://www.googleapis.com/indexing/v3/urlNotifications:publish";
    const apiKey = process.env.GOOGLE_INDEXING_API_KEY;

    if (!apiKey) {
      console.warn(`⚠️ GOOGLE_INDEXING_API_KEY env variable yok, mock mod kullanılıyor`);
      console.log(`📡 [MOCK] Google Indexing notification logged for: ${url}`);
      return true;
    }

    const requestBody = {
      url: url,
      type: "URL_UPDATED"
    };

    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      console.log(`✅ Google Indexing API: URL başarıyla gönderildi: ${url}`);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`⚠️ Google Indexing API error (${response.status}):`, errorData);
      return false;
    }
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

<<<<<<< HEAD
    const userId = req.user!.userId;
=======
<<<<<<< HEAD
    const userId = req.user!.userId;
=======
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Yetkilendirme gerekli" });
    }

>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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

<<<<<<< HEAD
app.post("/api/products", async (req: AuthRequest, res: Response) => {
=======
<<<<<<< HEAD
app.post("/api/products", async (req: AuthRequest, res: Response) => {
=======
app.post("/api/products", requireAuth, async (req: AuthRequest, res: Response) => {
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Database not available in fallback mode" });
    }

<<<<<<< HEAD
    const userId = req.user!.userId;
=======
<<<<<<< HEAD
    const userId = req.user!.userId;
=======
    const userId = req.user?.userId;
    if (!userId) {
      // requireAuth bunu zaten yapar ama yine de güvenli kodlama için ekleyelim
      return res.status(401).json({ error: "Yetkilendirme gerekli" });
    }
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4

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
<<<<<<< HEAD
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
=======
<<<<<<< HEAD
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
=======
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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

<<<<<<< HEAD
app.put("/api/products/:id", async (req: AuthRequest, res: Response) => {
=======
<<<<<<< HEAD
app.put("/api/products/:id", async (req: AuthRequest, res: Response) => {
=======
app.put("/api/products/:id", requireAuth, async (req: AuthRequest, res: Response) => {
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Database not available in fallback mode" });
    }

<<<<<<< HEAD
    const userId = req.user!.userId;
=======
<<<<<<< HEAD
    const userId = req.user!.userId;
=======
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Yetkilendirme gerekli" });
    }

>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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
<<<<<<< HEAD
      lastUpdated: new Date().toISOString(),
=======
<<<<<<< HEAD
      lastUpdated: new Date().toISOString(),
=======
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
    };

    await docRef.update(updateData);
    res.json({ id, ...updateData });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Ürün güncellenemedi" });
  }
});

<<<<<<< HEAD
app.delete("/api/products/:id", async (req: AuthRequest, res: Response) => {
=======
<<<<<<< HEAD
app.delete("/api/products/:id", async (req: AuthRequest, res: Response) => {
=======
app.delete("/api/products/:id", requireAuth, async (req: AuthRequest, res: Response) => {
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Database not available in fallback mode" });
    }

<<<<<<< HEAD
    const userId = req.user!.userId;
=======
<<<<<<< HEAD
    const userId = req.user!.userId;
=======
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Yetkilendirme gerekli" });
    }

>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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

    // ⭐ ÖNEMLI MANTIK:
    // Her kullanıcı sadece KENDİ ürünlerini vitrininde görecek
    // - userId varsa: userId'nin ürünlerini getir
    // - slug varsa: slug'a ait ürünü getir (slug'un sahibini userId'den al)

    // If Firestore available, use it
    if (firebaseReady && firestoreDb && userId) {
      try {
        console.log(`🔥 Firestore'dan okuyuyor - users/${userId}/publicDiscounts`);

        // ⭐ ÖNEMLI: slug varsa da, userId'nin TÜM ürünlerini getir
        // slug detay olarak açılacak, vitrin tüm ürünleri gösterecek
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

        if (slug) {
          console.log(`✅ Firestore'dan ${discounts.length} indirim okundu (slug=${slug} detay aç, vitrin tüm ürünleri göster)`);
        } else {
          console.log(`✅ Firestore'dan ${discounts.length} indirim okundu`);
        }

        return res.json(discounts);
      } catch (fsErr) {
        console.error(`❌ Firestore read hatası:`, fsErr);
        console.warn("Fallback mode'a geçiliyor...");
      }
    } else if (!userId && slug) {
      console.log(`🔍 Public share detected (slug=${slug} without userId) - fallback mode kullanılacak`);
    } else {
      console.warn(`⚠️ Firestore hazır değil veya userId yok, fallback mode kullanılıyor`);
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

    // ⭐ Her kullanıcı kendi ürünlerini görecek
    // ⭐ ÖNEMLI: slug varsa, paylaşılan linktir
    //   - userId'nin TÜM ürünlerini vitrinde göster
    //   - slug ürünü detay olarak seç
    let userDiscounts = allDiscounts.filter((d: any) => {
      const isActive = d.isActive === true;

      if (userId) {
        // userId varsa: her zaman userId'nin tüm ürünlerini göster
        // (slug varsa bile, vitrin tüm ürünleri gösterecek, slug detay olarak aç)
        return isActive && d.userId === userId;
      } else if (slug) {
        // Slug varsa ama userId yoksa: slug'u ara (fallback)
        return isActive && d.slug === slug;
      } else {
        return isActive;
      }
    });

    if (slug && userId) {
      console.log(`✅ Fallback mod: slug=${slug} + userId=${userId} ile ${userDiscounts.length} indirim döndürülüyor (slug detay aç)`);
    } else if (slug) {
      console.log(`✅ Fallback mod: slug=${slug} ile ${userDiscounts.length} indirim döndürülüyor`);
    } else if (userId) {
      console.log(`✅ Fallback mod: userId=${userId} ile ${userDiscounts.length} ürün döndürülüyor`);
    } else {
      console.log(`✅ Fallback mod: ${userDiscounts.length} aktif indirim döndürülüyor`);
    }

    res.json(userDiscounts);
  } catch (err) {
    console.error("Error fetching discounts:", err);
    res.json([]);
  }
});

<<<<<<< HEAD
app.post("/api/public-discounts", async (req: AuthRequest, res: Response) => {
=======
<<<<<<< HEAD
app.post("/api/public-discounts", async (req: AuthRequest, res: Response) => {
=======
app.post("/api/public-discounts", async (req: Request, res: Response) => {
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
  try {
    const { productId, productName, originalPrice, discountPrice, seoTitle } = req.body;

    if (!productId || !originalPrice || !discountPrice) {
      return res.status(400).json({ error: "Eksik alanlar" });
    }

    // Get userId from query, body, or auth header
<<<<<<< HEAD
    const userId = req.query.userId as string || req.body.userId || req.user?.userId || "unknown";
=======
<<<<<<< HEAD
    const userId = req.query.userId as string || req.body.userId || req.user?.userId || "unknown";
=======
    const userId = req.query.userId as string || req.body.userId || (req as AuthRequest).user?.userId || "unknown";
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4

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
      openGraphImage: req.body.openGraphImage || "",
<<<<<<< HEAD
      publishMode: req.body.publishMode || "local",
=======
<<<<<<< HEAD
      publishMode: req.body.publishMode || "local",
=======
      publishMode: req.body.publishMode || "global",
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
      latitude: req.body.latitude || 0,
      longitude: req.body.longitude || 0,
      radiusKm: req.body.radiusKm || 5,
      adCopy: req.body.adCopy || "",
      views: 0,
      shares: 0,
      isActive: true,
<<<<<<< HEAD
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
=======
<<<<<<< HEAD
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
=======
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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
<<<<<<< HEAD
    const userId = req.query.userId as string || req.user?.userId;
=======
<<<<<<< HEAD
    const userId = req.query.userId as string || req.user?.userId;
=======
    const userId = req.query.userId as string || req.user?.userId || req.body.userId;
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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

app.put("/api/public-discounts/:id/views", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const userId = req.query.userId as string || req.user?.userId;
=======
<<<<<<< HEAD
    const userId = req.query.userId as string || req.user?.userId;
=======
    const userId = req.query.userId as string || req.user?.userId || req.body.userId;
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4

    console.log(`📊 PUT /api/public-discounts/${id}/views - userId: ${userId}`);

    let updated = false;

    // Try Firestore first
    if (firebaseReady && firestoreDb && userId) {
      try {
        console.log(`  🔥 Firestore'da aranıyor...`);
        // Firestore'da userId koleksiyonunun altında ara
        const docRef = firestoreDb
          .collection("users")
          .doc(userId)
          .collection("publicDiscounts")
          .doc(id);

        const doc = await docRef.get();
        console.log(`  📝 Firestore doc bulundu: ${doc.exists}`);

        if (doc.exists) {
          const updatedData = {
            ...doc.data(),
            views: (doc.data().views || 0) + 1,
<<<<<<< HEAD
            updatedAt: new Date().toISOString()
=======
<<<<<<< HEAD
            updatedAt: new Date().toISOString()
=======
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
          };
          await doc.ref.update(updatedData);
          updated = true;
          res.json(updatedData);
          return;
          console.log(`  ✅ Firestore'da güncellendi`);
        }
      } catch (err) {
        console.warn("⚠️ Firestore views update failed:", err);
      }
    }

    // Fallback: update in db_data.json
    if (!updated) {
      try {
        const dbPath = path.join(process.cwd(), "db_data.json");
        console.log(`  📄 db_data.json aranıyor: ${dbPath}`);

        let dbData: any = { publicDiscounts: [] };

        if (fs.existsSync(dbPath)) {
          const content = fs.readFileSync(dbPath, "utf-8");
          dbData = JSON.parse(content);
          console.log(`  📋 db_data.json'da ${dbData.publicDiscounts?.length || 0} indirim var`);
        } else {
          console.warn(`  ⚠️ db_data.json bulunamadı`);
        }

        const discount = dbData.publicDiscounts?.find((d: any) => d.id === id);
        console.log(`  🔍 İndirim ara - id: ${id}, bulundu: ${!!discount}`);

        if (discount) {
          discount.views = (discount.views || 0) + 1;
<<<<<<< HEAD
          discount.updatedAt = new Date().toISOString();
=======
<<<<<<< HEAD
          discount.updatedAt = new Date().toISOString();
=======
          discount.updatedAt = new Date().toISOString(); // Fallback'te ISO string kalabilir
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
          fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), "utf-8");
          console.log(`  ✅ db_data.json'da güncellendi (views: ${discount.views})`);
          res.json(discount);
          return;
        } else {
          console.warn(`  ❌ İndirim bulunamadı: ${id}`);
        }
      } catch (err) {
        console.error("❌ db_data.json views update failed:", err);
      }
    }

    res.status(updated ? 200 : 404).json({ success: updated });
  } catch (err) {
    console.error("Error updating views:", err);
    res.status(500).json({ error: "Views güncellenemedi" });
  }
});

app.put("/api/public-discounts/:id/shares", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const userId = req.query.userId as string || req.user?.userId;
=======
<<<<<<< HEAD
    const userId = req.query.userId as string || req.user?.userId;
=======
    const userId = req.query.userId as string || req.user?.userId || req.body.userId;
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4

    console.log(`📊 PUT /api/public-discounts/${id}/shares - userId: ${userId}`);

    let updated = false;

    // Try Firestore first
    if (firebaseReady && firestoreDb && userId) {
      try {
        console.log(`  🔥 Firestore'da aranıyor...`);
        // Firestore'da userId koleksiyonunun altında ara
        const docRef = firestoreDb
          .collection("users")
          .doc(userId)
          .collection("publicDiscounts")
          .doc(id);

        const doc = await docRef.get();
        console.log(`  📝 Firestore doc bulundu: ${doc.exists}`);

        if (doc.exists) {
          const updatedData = {
            ...doc.data(),
            shares: (doc.data().shares || 0) + 1,
<<<<<<< HEAD
            updatedAt: new Date().toISOString()
=======
<<<<<<< HEAD
            updatedAt: new Date().toISOString()
=======
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
          };
          await doc.ref.update(updatedData);
          updated = true;
          res.json(updatedData);
          return;
          console.log(`  ✅ Firestore'da güncellendi`);
        }
      } catch (err) {
        console.warn("⚠️ Firestore shares update failed:", err);
      }
    }

    // Fallback: update in db_data.json
    if (!updated) {
      try {
        const dbPath = path.join(process.cwd(), "db_data.json");
        console.log(`  📄 db_data.json aranıyor: ${dbPath}`);

        let dbData: any = { publicDiscounts: [] };

        if (fs.existsSync(dbPath)) {
          const content = fs.readFileSync(dbPath, "utf-8");
          dbData = JSON.parse(content);
          console.log(`  📋 db_data.json'da ${dbData.publicDiscounts?.length || 0} indirim var`);
        } else {
          console.warn(`  ⚠️ db_data.json bulunamadı`);
        }

        const discount = dbData.publicDiscounts?.find((d: any) => d.id === id);
        console.log(`  🔍 İndirim ara - id: ${id}, bulundu: ${!!discount}`);

        if (discount) {
          discount.shares = (discount.shares || 0) + 1;
<<<<<<< HEAD
          discount.updatedAt = new Date().toISOString();
=======
<<<<<<< HEAD
          discount.updatedAt = new Date().toISOString();
=======
          discount.updatedAt = new Date().toISOString(); // Fallback'te ISO string kalabilir
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
          fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), "utf-8");
          console.log(`  ✅ db_data.json'da güncellendi (shares: ${discount.shares})`);
          res.json(discount);
          return;
        } else {
          console.warn(`  ❌ İndirim bulunamadı: ${id}`);
        }
      } catch (err) {
        console.error("❌ db_data.json shares update failed:", err);
      }
    }

    res.status(updated ? 200 : 404).json({ success: updated });
  } catch (err) {
    console.error("Error updating shares:", err);
    res.status(500).json({ error: "Shares güncellenemedi" });
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
    if (!firebaseReady || !firestoreDb) {
      // Fallback: return default settings
      return res.json(defaultSettings);
    }

    const userId = req.user?.userId;
    if (!userId) {
<<<<<<< HEAD
=======
=======
    const userId = req.user?.userId;
    if (!userId || !firebaseReady || !firestoreDb) {
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
app.post("/api/settings", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "userId gerekli" });
    }

<<<<<<< HEAD
=======
=======
app.post("/api/settings", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Database not available in fallback mode" });
    }

    const settingsData = {
      language: req.body.language || "tr",
      merchantName: req.body.merchantName,
      merchantPhone: req.body.merchantPhone,
      merchantWhatsApp: req.body.merchantWhatsApp,
<<<<<<< HEAD
      updatedAt: new Date().toISOString(),
    };

=======
<<<<<<< HEAD
      updatedAt: new Date().toISOString(),
    };

=======
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Database not available in fallback mode" });
    }

>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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

// ============================================
// API: RECOVERY & DIAGNOSTICS
// ============================================

// ⭐ YENİ: Tüm discountları userId'ye göre listele (diagnostic amaçlı)
app.get("/api/admin/list-all-discounts", async (req: Request, res: Response) => {
  try {
    const queryUserId = req.query.userId as string;
    const machinePrefix = req.query.machinePrefix as string;

    if (!queryUserId && !machinePrefix) {
      return res.status(400).json({
        error: "userId veya machinePrefix parametresi gerekli",
        example: "/api/admin/list-all-discounts?userId=license_AE3C8E03B175FA2A_unknown"
      });
    }

    console.log(`\n📊 Admin: Tüm discountları listele - userId: ${queryUserId}, prefix: ${machinePrefix}`);

    if (firebaseReady && firestoreDb) {
      try {
        const usersSnapshot = await firestoreDb.collection("users").get();
        const allDiscounts: any[] = [];

        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;

          // MachinePrefix ile match et
          if (machinePrefix && !userId.includes(machinePrefix)) {
            continue;
          }

          // userId ile match et
          if (queryUserId && userId !== queryUserId) {
            continue;
          }

          const discountsSnapshot = await userDoc.ref.collection("publicDiscounts").get();

          for (const discountDoc of discountsSnapshot.docs) {
            const discount = discountDoc.data();
            allDiscounts.push({
              currentUserId: userId,
              storedUserId: discount.userId,
              id: discountDoc.id,
              productName: discount.productName,
              slug: discount.slug,
              isActive: discount.isActive,
              views: discount.views || 0,
              shares: discount.shares || 0,
              publishedAt: discount.publishedAt,
            });
          }
        }

        console.log(`✅ ${allDiscounts.length} discount bulundu`);
        return res.json({
          count: allDiscounts.length,
          discounts: allDiscounts
        });
      } catch (err) {
        console.error("Firestore list error:", err);
        return res.status(500).json({ error: "Firestore error", details: String(err) });
      }
    } else {
      // Fallback mode: db_data.json'dan oku
      console.log("📄 Fallback mode - db_data.json'dan okuyoruz");
      const dbPath = path.join(process.cwd(), "db_data.json");

      if (!fs.existsSync(dbPath)) {
        return res.status(404).json({
          error: "db_data.json bulunamadı",
          discounts: []
        });
      }

      try {
        const dbContent = fs.readFileSync(dbPath, "utf-8");
        const dbData = JSON.parse(dbContent);
        const allDiscounts = dbData.publicDiscounts || [];

        // machinePrefix ile filtrele
        const filtered = allDiscounts.filter((d: any) => {
          if (machinePrefix && !d.userId?.includes(machinePrefix)) {
            return false;
          }
          if (queryUserId && d.userId !== queryUserId) {
            return false;
          }
          return true;
        });

        console.log(`✅ ${filtered.length} discount bulundu (fallback mode)`);
        return res.json({
          count: filtered.length,
          discounts: filtered,
          mode: "fallback"
        });
      } catch (parseErr) {
        return res.status(500).json({
          error: "db_data.json parse error",
          discounts: []
        });
      }
    }
  } catch (err) {
    console.error("Admin list error:", err);
    res.status(500).json({ error: "Internal error", details: String(err) });
  }
});

// ⭐ YENİ: Recovery - eski userId'deki discountları yeni userId'ye taşı
app.post("/api/admin/recover-discounts", async (req: AuthRequest, res: Response) => {
  try {
    const { oldUserId, newUserId } = req.body;

    if (!oldUserId || !newUserId) {
      return res.status(400).json({
        error: "oldUserId ve newUserId parametreleri gerekli",
        example: {
          oldUserId: "license_AE3C8E03B175FA2A_unknown",
          newUserId: "user_4956C39550333A28_zeqn03ik0"
        }
      });
    }

    console.log(`\n🔧 Admin: Recovery başlıyor - ${oldUserId} → ${newUserId}`);

    if (firebaseReady && firestoreDb) {
      try {
        // Eski userId'deki tüm discountları bul
        const oldUserRef = firestoreDb.collection("users").doc(oldUserId);
        const discountsSnapshot = await oldUserRef.collection("publicDiscounts").get();

        console.log(`📦 ${discountsSnapshot.size} discount taşınacak (Firestore)`);

        let movedCount = 0;
        for (const discountDoc of discountsSnapshot.docs) {
          const discountData = discountDoc.data();

          // Yeni location'da oluştur
          const newDocRef = firestoreDb
            .collection("users")
            .doc(newUserId)
            .collection("publicDiscounts")
            .doc(discountDoc.id);

          const updatedDiscount = {
            ...discountData,
            userId: newUserId,
            recoveredAt: new Date().toISOString(),
            recoveredFrom: oldUserId,
          };

          await newDocRef.set(updatedDiscount);
          console.log(`  ✅ "${discountData.productName}" taşındı`);

          // Eski location'dan sil
          await discountDoc.ref.delete();
          movedCount++;
        }

        console.log(`✅ Recovery tamamlandı - ${movedCount} discount taşındı`);

        return res.json({
          success: true,
          message: `${movedCount} discount başarıyla taşındı`,
          oldUserId,
          newUserId,
          movedCount
        });
      } catch (err) {
        console.error("Recovery error:", err);
        return res.status(500).json({
          error: "Recovery failed",
          details: String(err)
        });
      }
    } else {
      // Fallback mode: db_data.json'da işlem yap
      console.log("📄 Fallback mode - db_data.json'da işlem yapılıyor");
      const dbPath = path.join(process.cwd(), "db_data.json");

      if (!fs.existsSync(dbPath)) {
        return res.status(404).json({
          error: "db_data.json bulunamadı",
          success: false
        });
      }

      try {
        const dbContent = fs.readFileSync(dbPath, "utf-8");
        const dbData = JSON.parse(dbContent);
        const allDiscounts = dbData.publicDiscounts || [];

        // Eski userId'deki discountları bul
        const discountsToMove = allDiscounts.filter((d: any) => d.userId === oldUserId);

        console.log(`📦 ${discountsToMove.length} discount taşınacak (fallback mode)`);

        // Yeni userId ile güncelle
        let movedCount = 0;
        for (const discount of discountsToMove) {
          discount.userId = newUserId;
          discount.recoveredAt = new Date().toISOString();
          discount.recoveredFrom = oldUserId;
          console.log(`  ✅ "${discount.productName}" taşındı`);
          movedCount++;
        }

        // Dosyaya yaz
        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), "utf-8");

        console.log(`✅ Recovery tamamlandı - ${movedCount} discount taşındı (fallback)`);

        return res.json({
          success: true,
          message: `${movedCount} discount başarıyla taşındı (fallback mode)`,
          oldUserId,
          newUserId,
          movedCount,
          mode: "fallback"
        });
      } catch (fileErr) {
        console.error("Fallback recovery error:", fileErr);
        return res.status(500).json({
          error: "Recovery failed in fallback mode",
          details: String(fileErr)
        });
      }
    }
  } catch (err) {
    console.error("Recovery endpoint error:", err);
    res.status(500).json({ error: "Internal error", details: String(err) });
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4
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
<<<<<<< HEAD
=======
=======
let firebaseInitialization: Promise<void> | null = null;
export function ensureFirebaseInitialized() {
  if (!firebaseInitialization) {
    firebaseInitialization = initializeFirebase();
  }
  return firebaseInitialization;
}
if (!process.env.VERCEL) {
  (async () => {
    console.log("\n🚀 Firebase initialization başlatılıyor...");
    await ensureFirebaseInitialized();
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
}
>>>>>>> origin/main
>>>>>>> 27aad49c287f0d696f4803f2fd459c9d4308d4f4

export default app;
