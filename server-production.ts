import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// @ts-ignore - Firebase Admin SDK dynamic import
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

    const serviceAccount: any = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri: "https://accounts.google.com/o/oauth2/auth",
      tokenUri: "https://oauth2.googleapis.com/token",
    };

    // Validate credentials
    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      console.warn("⚠️  Firestore credentials eksik - fallback to file-based mode");
      firebaseReady = false;
      return;
    }

    // Initialize Firebase
    if (firebaseAdmin.apps.length === 0) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      });
    }

    firestoreDb = firebaseAdmin.firestore();
    
    // Test connection
    await firestoreDb.collection("_health").doc("test").set({ timestamp: new Date() });
    
    console.log("✅ Firestore initialized successfully");
    firebaseReady = true;
  } catch (err) {
    console.error("❌ Firestore initialization failed:", err);
    firebaseReady = false;
  }
}

// Initialize on startup
await initializeFirebase();

// ============================================
// EXPRESS APP
// ============================================

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Increase JSON payload limit for images (up to 50MB for base64 images)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

    // If Firestore ready, do a quick test
    if (firebaseReady && firestoreDb) {
      try {
<<<<<<< HEAD
        const testDoc = await firestoreDb.collection("_health").doc("test").get();
        health.firebaseConnection = "connected";
      } catch (err) {
        health.firebaseConnection = "failed";
=======
        await firestoreDb.collection("_health").doc("test").get();
        (health as any).firebaseConnection = "connected";
      } catch (err) {
        (health as any).firebaseConnection = "failed";
>>>>>>> origin/main
        health.status = "degraded";
      }
    }

    const statusCode = health.status === "ok" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (err) {
    res.status(500).json({ error: "Health check failed", message: String(err) });
  }
});

// ============================================
// API: PRODUCTS
// ============================================

app.get("/api/products", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Firestore unavailable" });
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

app.post("/api/products", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Firestore unavailable" });
    }

    const userId = req.user!.userId;

    // Validation
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

app.put("/api/products/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Firestore unavailable" });
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

app.delete("/api/products/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Firestore unavailable" });
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
// API: PUBLIC DISCOUNTS (Halka Açık)
// ============================================

app.get("/api/public-discounts", async (req: Request, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Firestore unavailable" });
    }

    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId query parametresi gerekli" });
    }

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

    res.json(discounts);
  } catch (err) {
    console.error("Error fetching discounts:", err);
    res.status(500).json({ error: "İndirimler alınamadı" });
  }
});

app.post("/api/public-discounts", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Firestore unavailable" });
    }

    const userId = req.user!.userId;
    const { productId, productName, originalPrice, discountPrice, seoTitle } = req.body;

    if (!productId || !originalPrice || !discountPrice) {
      return res.status(400).json({ error: "Eksik alanlar" });
    }

    const discountId = "discount_" + Date.now();
    const discountData = {
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
      publishedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };

    await firestoreDb
      .collection("users")
      .doc(userId)
      .collection("publicDiscounts")
      .doc(discountId)
      .set(discountData);

    res.status(201).json({ id: discountId, ...discountData });
  } catch (err) {
    console.error("Error creating discount:", err);
    res.status(500).json({ error: "İndirim kaydedilemedi" });
  }
});

app.delete("/api/public-discounts/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Firestore unavailable" });
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

app.get("/api/settings", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Firestore unavailable" });
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

app.post("/api/settings", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!firebaseReady || !firestoreDb) {
      return res.status(503).json({ error: "Firestore unavailable" });
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

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
