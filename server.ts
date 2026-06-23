import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Firebase Admin SDK
// @ts-ignore - Dynamic import for ESM compatibility
import firebaseAdmin from "firebase-admin";

dotenv.config();

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

    // Check if Firebase Admin SDK is available
    if (!firebaseAdmin || !firebaseAdmin.credential) {
      console.warn("⚠️  Firebase Admin SDK not available - fallback to file-based mode");
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
      firebaseReady = false;
      return;
    }

    if (!firebaseAdmin.apps || firebaseAdmin.apps.length === 0) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      });
    }

    firestoreDb = firebaseAdmin.firestore();

    await firestoreDb.collection("_health").doc("test").set({ timestamp: new Date() });

    console.log("✅ Firestore initialized successfully");
    firebaseReady = true;
  } catch (err) {
    console.error("❌ Firestore initialization failed:", err);
    firebaseReady = false;
  }
}

// Initialize Firebase on startup (not at module level)
initializeFirebase().catch(err => {
  console.warn("Firebase init warning:", err);
});

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
      lastUpdated: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
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
      lastUpdated: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
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

    // CRITICAL: userId is required for privacy/isolation
    if (!userId) {
      return res.status(400).json({ error: "userId query parametresi zorunlu (veri gizliliği)" });
    }

    // If Firestore available, use it
    if (firebaseReady && firestoreDb) {
      const snapshot = await firestoreDb
        .collection("users")
        .doc(userId)
        .collection("publicDiscounts")
        .where("isActive", "==", true)
        .get();

      const discounts = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.json(discounts);
    }

    // Fallback mode: read from db_data.json
    const dbPath = path.join(process.cwd(), "db_data.json");
    let allDiscounts: any[] = [];

    if (fs.existsSync(dbPath)) {
      try {
        const content = fs.readFileSync(dbPath, "utf-8");
        const dbData = JSON.parse(content);
        allDiscounts = dbData.publicDiscounts || [];
      } catch (readErr) {
        console.warn("Error reading db_data.json:", readErr);
      }
    }

    // CRITICAL: STRICT filtering by userId - only return user's own discounts
    const userDiscounts = allDiscounts.filter(
      (d: any) => d.isActive === true && d.userId === userId
    );

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

    // If Firestore available, write there
    if (firebaseReady && firestoreDb) {
      try {
        await firestoreDb
          .collection("users")
          .doc(req.user?.userId || "unknown")
          .collection("publicDiscounts")
          .doc(discountId)
          .set({
            ...discountData,
            publishedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          });
      } catch (fsErr) {
        console.warn("Firestore write failed, using fallback:", fsErr);
      }
    }

    // Fallback: write to db_data.json if not Firestore
    if (!firebaseReady) {
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
      } catch (writeErr) {
        console.warn("db_data.json write failed:", writeErr);
      }
    }

    res.status(201).json({ id: discountId, ...discountData });
  } catch (err) {
    console.error("Error creating discount:", err);
    res.status(500).json({ error: "İndirim kaydedilemedi" });
  }
});

app.delete("/api/public-discounts/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Database not available in fallback mode" });
    }

    const userId = req.user!.userId;
    const { id } = req.params;

    await firestoreDb
      .collection("users")
      .doc(userId)
      .collection("publicDiscounts")
      .doc(id)
      .delete();

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting discount:", err);
    res.status(500).json({ error: "İndirim silinemedi" });
  }
});

// ============================================
// API: SETTINGS
// ============================================

app.get("/api/settings", async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      // Fallback: return default settings
      return res.json({
        language: "tr",
        merchantName: "İşletmem",
        merchantPhone: "",
        merchantWhatsApp: "",
      });
    }

    const userId = req.user!.userId;
    const doc = await firestoreDb
      .collection("users")
      .doc(userId)
      .collection("data")
      .doc("user_data")
      .get();

    const settings = doc.exists
      ? doc.data()
      : {
          language: "tr",
          merchantName: "İşletmem",
          merchantPhone: "",
          merchantWhatsApp: "",
        };

    res.json(settings);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: "Ayarlar alınamadı" });
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
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
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

const server = app.listen(PORT, () => {
  console.log(`\n✅ Production Server running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔥 Database: ${firebaseReady ? "Firestore (siftah-app-v1)" : "FALLBACK MODE"}\n`);

  if (!firebaseReady) {
    console.warn("⚠️  WARNING: Firestore not initialized - using fallback mode");
  }
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
