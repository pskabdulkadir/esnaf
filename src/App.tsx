import React, { useState, useEffect } from 'react';
import { lazy, Suspense } from 'react';
import { Product, Sale, Expense, UserRole } from './types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_EXPENSES } from './data';
import Dashboard from './components/Dashboard';
import LicenseGate from './components/LicenseGate';

// Lazy load heavy components for faster initial load
const Inventory = lazy(() => import('./components/Inventory'));
const SalesEntry = lazy(() => import('./components/SalesEntry'));
const Expenses = lazy(() => import('./components/Expenses'));
const QuickLookup = lazy(() => import('./components/QuickLookup'));
const Automation = lazy(() => import('./components/Automation'));
const Contact = lazy(() => import('./components/Contact'));
const Marketer = lazy(() => import('./components/Marketer'));
const GuideAndVoice = lazy(() => import('./components/GuideAndVoice'));
const HelpCenter = lazy(() => import('./components/HelpCenter'));
import { TRANSLATIONS } from './lib/translations';
import { sqliteDb } from './lib/sqlite';
import {
  runSovereigntyAuthCheck,
  forceResyncAuthStatus,
  getOrCreateDeviceId,
  APP_CURRENT_VERSION,
  backupDataToFirestore,
  restoreDataFromFirestore,
  type SecurityStatus
} from './lib/firebase';
import {
  checkAndRestoreLicenseValidity,
  restoreFromBackup
} from './lib/license-manager';
import {
  initLicenseDB,
  getLicenseFromIndexedDB,
  isStoredLicenseValid
} from './lib/license-db';
import { getOrCreateMachineId } from './lib/machine-id';
import { 
  Building2, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  User, 
  ShieldCheck, 
  RotateCcw, 
  Database,
  Eye,
  Cpu,
  AlertTriangle,
  Server,
  Download,
  RefreshCw,
  Lock,
  WifiOff,
  Phone,
  Megaphone,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // License State
  const [isLicenseValid, setIsLicenseValid] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isLicenseValid') === 'true';
    } catch {
      return false;
    }
  });

  // Session Login State (Lisans girdikten sonra şifre kontrolü için)
  // ⭐ ÖNEMLI: localStorage'dan oku, böylece sayfa yenilenirse de kalıcı olur
  const [isSessionLoggedIn, setIsSessionLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isSessionLoggedIn') === 'true';
    } catch {
      return false;
    }
  });

  // Password-only Login State (Logout sonrası sadece şifre girişi için)
  const [showPasswordOnly, setShowPasswordOnly] = useState(false);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Multi-lingual Language Selector State ('tr', 'en', 'de')
  const [language, setLanguage] = useState<'tr' | 'en' | 'de'>(() => {
    try {
      return (localStorage.getItem('akn_language') as 'tr' | 'en' | 'de') || 'tr';
    } catch {
      return 'tr';
    }
  });

  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;

  // License validity check on mount
  // ⭐ ÖZEL: Cihaz tanıması ile IndexedDB'den lisans geri yükleme
  useEffect(() => {
    (async () => {
      try {
        console.log('🔍 App.tsx: Lisans kontrol ediliyor...');

        // SEVIYE 1: localStorage'da hala veri varsa kullan
        const licenseDataStr = localStorage.getItem('license_data');
        const isValidFlag = localStorage.getItem('isLicenseValid');

        if (licenseDataStr && isValidFlag === 'true') {
          try {
            const licenseData = JSON.parse(licenseDataStr);
            if (licenseData.exp && new Date(licenseData.exp) > new Date()) {
              console.log('✅ App: localStorage\'dan geçerli lisans bulundu');
              setIsLicenseValid(true);
              return;
            }
          } catch (e) {
            console.warn('localStorage veri çözümleme hatası:', e);
          }
        }

        // SEVIYE 2: sessionStorage'a kontrol et
        const sessionData = sessionStorage.getItem('license_data_session');
        if (sessionData) {
          try {
            const licenseData = JSON.parse(sessionData);
            if (licenseData.exp && new Date(licenseData.exp) > new Date()) {
              console.log('✅ App: sessionStorage\'dan geçerli lisans bulundu');
              localStorage.setItem('license_data', sessionData);
              localStorage.setItem('isLicenseValid', 'true');
              setIsLicenseValid(true);
              return;
            }
          } catch (e) {
            console.warn('sessionStorage veri çözümleme hatası:', e);
          }
        }

        // SEVIYE 3: Memory'de veri varsa kontrol et
        const memoryData = (window as any).__AKN_LICENSE__;
        if (memoryData && memoryData.data && memoryData.data.exp) {
          if (new Date(memoryData.data.exp) > new Date()) {
            console.log('✅ App: Memory\'den geçerli lisans bulundu');
            const dataStr = JSON.stringify(memoryData.data);
            localStorage.setItem('license_data', dataStr);
            localStorage.setItem('isLicenseValid', 'true');
            sessionStorage.setItem('license_data_session', dataStr);
            setIsLicenseValid(true);
            return;
          }
        }

        // ⭐ SEVIYE 4: IndexedDB'den cihaz ID'ye göre geri yükle (ÖZELLİKLE!)
        // Tarayıcı temizlenmiş olsa bile cihaz tanınır ve lisans otomatik yüklenir
        try {
          console.log('🔍 IndexedDB\'de cihaz tanımlaması yapılıyor...');
          const machineId = getOrCreateMachineId();

          // IndexedDB başlat (timeout ile)
          const dbInitPromise = initLicenseDB();
          const dbInitTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('IndexedDB timeout')), 5000)
          );

          try {
            await Promise.race([dbInitPromise, dbInitTimeout]);
          } catch (dbError) {
            console.warn('⚠️ IndexedDB açılamadı:', dbError);
            throw new Error('IndexedDB unavailable');
          }

          // Cihaz ID'ye göre lisans bul
          const storedLicense = await getLicenseFromIndexedDB(machineId);

          if (storedLicense) {
            // Lisans geçerli mi kontrol et
            const isValid = await isStoredLicenseValid(machineId);

            if (isValid) {
              console.log('🔒 Cihaz tanındı! IndexedDB\'den lisans geri yüklendi');
              const licenseData = storedLicense.licenseData;
              const dataStr = JSON.stringify(licenseData);

              // Tüm seviyelere yeniden yaz
              try {
                localStorage.setItem('license_data', dataStr);
                localStorage.setItem('isLicenseValid', 'true');
                sessionStorage.setItem('license_data_session', dataStr);
                (window as any).__AKN_LICENSE__ = {
                  data: licenseData,
                  timestamp: new Date().getTime(),
                  valid: true
                };
              } catch (storageError) {
                console.warn('⚠️ Saklama yazma hatası:', storageError);
              }

              console.log('✅ Cihaz tanımlaması başarılı, Dashboard açılıyor...');
              setIsLicenseValid(true);
              return;
            }
          }

          console.warn('⚠️ IndexedDB\'de lisans bulunamadı veya geçersiz');
        } catch (indexedDBError) {
          console.warn('⚠️ IndexedDB kontrol hatası:', indexedDBError);
          // IndexedDB başarısız olsa da devam et, başka seviyelerde lisans olabilir
        }

        // SEVIYE 5: Hiçbir yerde veri yoksa
        console.warn('❌ App: Geçerli lisans bulunamadı');
        setIsLicenseValid(false);
        localStorage.setItem('isLicenseValid', 'false');
      } catch (e) {
        console.error('App lisans kontrolü hatası:', e);
        setIsLicenseValid(false);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('akn_language', language);
    } catch (e) {
      console.error(e);
    }
  }, [language]);

  // Permission / Security Mode State (Yonetici is default Admin)
  const [userRole, setUserRole] = useState<UserRole>('Yonetici');

  // Core Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Security Verification status
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isLocked: false,
    lockType: 'none',
    offlineGraceActive: false
  });

  // Hot Toast Notification Feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Corporate Brand Customization States
  const [brandName, setBrandName] = useState<string>(() => {
    try {
      return localStorage.getItem('akn_brand_name') || 'AKN Global Group Ltd';
    } catch {
      return 'AKN Global Group Ltd';
    }
  });
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [tempBrandName, setTempBrandName] = useState('');

  const handleUpdateBrandName = (newName: string) => {
    const name = newName.trim() || 'AKN Global Group Ltd';
    setBrandName(name);
    try {
      localStorage.setItem('akn_brand_name', name);
    } catch (e) {
      console.error(e);
    }
    showToast(`Sistem genel adı "${name}" olarak güncellendi.`, 'success');
    setIsBrandModalOpen(false);
  };

  // Initialize SQLite database and check auth status on startup
  useEffect(() => {
    async function initializeSystem() {
      setIsCheckingAuth(true);

      // 1. Run Firebase cloud verification checks (License verification & update checker)
      try {
        const authStatus = await runSovereigntyAuthCheck();
        setSecurityStatus(authStatus);
      } catch (err) {
        console.warn("Auth check failed on start:", err);
      }

      // 2. Try to restore from Firestore backup first
      let restoredFromCloud = false;
      try {
        const cloudData = await restoreDataFromFirestore();
        if (cloudData && cloudData.products.length > 0) {
          // Cloud backup bulundu, SQLite'ye yükle
          sqliteDb.initializeDefaults(cloudData.products, cloudData.sales, cloudData.expenses);
          setProducts(cloudData.products);
          setSales(cloudData.sales);
          setExpenses(cloudData.expenses);
          restoredFromCloud = true;

          // Doc settings'i localStorage'a kaydET
          if (cloudData.docSettings) {
            localStorage.setItem('automation_doc_settings', JSON.stringify(cloudData.docSettings));
          }

          showToast('Veriler cloud\'dan geri yüklendi!', 'success');
        }
      } catch (err) {
        console.warn("Cloud restore failed, using local SQLite:", err);
      }

      // 3. Eğer cloud'dan restore edilemezse, local SQLite'den yükle
      if (!restoredFromCloud) {
        try {
          // Ensure standard schema tables have fallback defaults seeded on first use
          sqliteDb.initializeDefaults(INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_EXPENSES);

          // Execute SELECT queries to populate application states
          const sqlProducts = sqliteDb.query<Product>("SELECT * FROM Products");
          const sqlSales = sqliteDb.query<Sale>("SELECT * FROM Sales");
          const sqlExpenses = sqliteDb.query<Expense>("SELECT * FROM Expenses");

          setProducts(sqlProducts);
          setSales(sqlSales);
          setExpenses(sqlExpenses);
        } catch (e) {
          console.error("SQLite dynamic relational query loading failed, using fallback arrays", e);
          setProducts(INITIAL_PRODUCTS);
          setSales(INITIAL_SALES);
          setExpenses(INITIAL_EXPENSES);
        }
      }

      // Load role preferences
      try {
        const savedRole = localStorage.getItem('akn_role');
        if (savedRole) {
          setUserRole(savedRole as UserRole);
        }
      } catch (e) {
        console.error("Role loading failed:", e);
      }

      setIsCheckingAuth(false);
    }

    initializeSystem();
  }, []);

  // Keep-alive mechanism: Ping backend nur wenn System aktiv (15 Tage + Admin Allow)
  useEffect(() => {
    const isSystemActive = !securityStatus.isLocked && securityStatus.isWithin15Days && securityStatus.isAccessAllowedByAdmin;

    if (!isSystemActive) {
      console.log('[KEEP-ALIVE] Sistem kapalı - ping durduruldu');
      return;
    }

    console.log('[KEEP-ALIVE] Sistem aktif - ping başlatılıyor (5 dakikada bir)');
    const keepAliveInterval = setInterval(async () => {
      try {
        await fetch("/api/health", { method: "GET" });
        console.log('[KEEP-ALIVE] ✓ Ping başarılı');
      } catch (err) {
        console.warn("[KEEP-ALIVE] Ping hatası (çevrimdışı?):", err);
      }
    }, 5 * 60 * 1000); // 5 dakikada bir

    return () => {
      console.log('[KEEP-ALIVE] Interval temizleniyor');
      clearInterval(keepAliveInterval);
    };
  }, [securityStatus]);

  // JSON-LD Schema injection for SEO (organization-level schema)
  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": brandName || "Bizim Mahalle İşletmesi",
      "url": "https://example.com",
      "logo": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200",
      "description": "Yerel esnaf yönetim ve pazarlama sistemi",
      "sameAs": [
        "https://www.facebook.com",
        "https://www.instagram.com",
        "https://www.twitter.com"
      ]
    };

    // Remove existing script if present
    const existingScript = document.getElementById("org-schema-ld");
    if (existingScript) existingScript.remove();

    // Inject new schema
    const script = document.createElement("script");
    script.id = "org-schema-ld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(script);
  }, [brandName]);

  // Sync state with local SQLite DB helper (reloads state from SQLite and triggers notifications)
  const reloadDataFromSQLite = async () => {
    try {
      const sqlProducts = sqliteDb.query<Product>("SELECT * FROM Products");
      const sqlSales = sqliteDb.query<Sale>("SELECT * FROM Sales");
      const sqlExpenses = sqliteDb.query<Expense>("SELECT * FROM Expenses");

      setProducts(sqlProducts);
      setSales(sqlSales);
      setExpenses(sqlExpenses);

      // Firestore'a backup et
      try {
        const docSettings = localStorage.getItem('automation_doc_settings')
          ? JSON.parse(localStorage.getItem('automation_doc_settings')!)
          : {};

        await backupDataToFirestore(sqlProducts, sqlSales, sqlExpenses, docSettings);
      } catch (err) {
        console.warn("Cloud backup failed (offline?):", err);
      }
    } catch (e) {
      console.error("Failed to reload data from SQLite engine", e);
    }
  };

  // Save changes to local storage helper
  const saveStateToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to lock state to storage for key: ${key}`, e);
    }
  };

  // Toast notifier helper
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Inventory modifications using SQLite SQL Statements
  const handleAddProduct = async (newProduct: Product) => {
    try {
      sqliteDb.run(
        "INSERT INTO Products (id, name, barcode, purchasePrice, salePrice, currentStock, lowStockThreshold, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          newProduct.id,
          newProduct.name,
          newProduct.barcode || '',
          newProduct.purchasePrice,
          newProduct.salePrice,
          newProduct.currentStock,
          newProduct.lowStockThreshold,
          newProduct.category
        ]
      );
      await reloadDataFromSQLite();
      showToast(`Ürün SQLite veritabanına SQL INSERT ile kaydedildi: ${newProduct.name}`, 'success');
    } catch (e) {
      console.error("SQL INSERT for product failed", e);
      showToast("Veri tabanı yazma hatası oluştu.", "warning");
    }
  };

  const handleUpdateProduct = async (modifiedProduct: Product) => {
    try {
      sqliteDb.run(
        "UPDATE Products SET name=?, barcode=?, purchasePrice=?, salePrice=?, currentStock=?, lowStockThreshold=?, category=? WHERE id=?",
        [
          modifiedProduct.name,
          modifiedProduct.barcode || '',
          modifiedProduct.purchasePrice,
          modifiedProduct.salePrice,
          modifiedProduct.currentStock,
          modifiedProduct.lowStockThreshold,
          modifiedProduct.category,
          modifiedProduct.id
        ]
      );
      await reloadDataFromSQLite();
      showToast(`SQL UPDATE tamamlandı: ${modifiedProduct.id} ürün bilgileri güncellendi`, 'info');
    } catch (e) {
      console.error("SQL UPDATE for product failed", e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      sqliteDb.run("DELETE FROM Products WHERE id=?", [id]);
      await reloadDataFromSQLite();
      showToast(`SQL DELETE tamamlandı: Ürün kaydı envanterden silindi.`, 'warning');
    } catch (e) {
      console.error("SQL DELETE for product failed", e);
    }
  };

  // Sales Automation Implementation:
  // Automatically subtracts the sold quantity from Products currentStock
  const handleAddSale = async (newSale: Sale) => {
    try {
      const relProduct = products.find(p => p.id === newSale.productId);

      // SQL transaction representing automation steps
      if (relProduct) {
        const newStock = Math.max(0, relProduct.currentStock - newSale.quantity);
        sqliteDb.run("UPDATE Products SET currentStock=? WHERE id=?", [newStock, newSale.productId]);
      }

      sqliteDb.run(
        "INSERT INTO Sales (id, productId, quantity, totalAmount, date) VALUES (?, ?, ?, ?, ?)",
        [
          newSale.id,
          newSale.productId,
          newSale.quantity,
          newSale.totalAmount,
          newSale.date
        ]
      );

      await reloadDataFromSQLite();

      const prodName = relProduct ? relProduct.name : newSale.productId;
      showToast(
        `Satış kaydedildi. SQL ONAYLI: "${prodName}" stok miktarından ${newSale.quantity} adet düşüldü.`,
        'success'
      );
    } catch (e) {
      console.error("SQL transaction for recording sale failed", e);
    }
  };

  // Expenses logs matching relational model
  const handleAddExpense = async (newExpense: Expense) => {
    try {
      sqliteDb.run(
        "INSERT INTO Expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)",
        [
          newExpense.id,
          newExpense.description,
          newExpense.amount,
          newExpense.category,
          newExpense.date
        ]
      );
      await reloadDataFromSQLite();
      showToast(`SQLite Gider belgesi kaydedildi: ${newExpense.id} ($${newExpense.amount.toFixed(2)})`, 'success');
    } catch (e) {
      console.error("SQL INSERT for expense failed", e);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      sqliteDb.run("DELETE FROM Expenses WHERE id=?", [id]);
      await reloadDataFromSQLite();
      showToast(`SQL DELETE tamamlandı: Gider kaydı geri alındı.`, 'warning');
    } catch (e) {
      console.error("SQL DELETE for expense failed", e);
    }
  };

  // Security switcher helper
  const toggleRole = () => {
    const nextRole = userRole === 'Yonetici' ? 'Uye' : 'Yonetici';
    setUserRole(nextRole);
    localStorage.setItem('akn_role', nextRole);
    showToast(`Kullanıcı güvenlik yetkisi değiştirildi: ${nextRole === 'Yonetici' ? 'Tam Yönetici Yetkisi' : 'Sınırlı Satış Görevlisi'}`, 'info');
  };

  // Diagnostic Data Reset returning state to pristine local DB schemas
  const handleResetDataToDefaults = () => {
    if (confirm(`${brandName} sistemindeki tüm ürün envanterini, satışları ve giderleri sıfırlayarak varsayılan şablona döndürmek istediğinizden emin misiniz?\n\nBu işlem yerel SQLite veritabanınızı fabrika ayarlarına döndürecektir.`)) {
      try {
        sqliteDb.resetToDefaults(INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_EXPENSES);
        reloadDataFromSQLite();
        setUserRole('Yonetici');
        localStorage.setItem('akn_role', 'Yonetici');
        
        showToast(`${brandName} SQLite yerel veritabanı fabrika ayarlarına döndürüldü.`, "info");
        setCurrentTab('dashboard');
      } catch (e) {
        console.error("SQL Reset execution failed", e);
      }
    }
  };

  // SQLite Data Export file triggers (Disaster Recovery & Sovereignty backup)
  const handleExportSQL = () => {
    try {
      showToast("Relational SQL veritabanı çıktısı hesaplanıyor...", "info");
      const dump = sqliteDb.exportToSQLDump();
      const blob = new Blob([dump], { type: 'text/sql;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      
      const fileSafeBrand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.setAttribute("download", `${fileSafeBrand}_sqlite_sovereignty_backup_${new Date().toISOString().split('T')[0]}.sql`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Relational SQL işlem kayıt döküm dosyası başarıyla indirildi.", "success");
    } catch (e) {
      console.error(e);
      showToast("Veri tabanı dışarı aktarma hatası", "warning");
    }
  };

  const handleExportCSV = (tableName: 'Products' | 'Sales' | 'Expenses') => {
    try {
      showToast(`${tableName} tablosu CSV formatına dönüştürülüyor...`, "info");
      const csv = sqliteDb.exportToCSVDump(tableName);
      if (!csv) {
        showToast(`${tableName} tablosunda dışa aktarılacak satır bulunamadı.`, "info");
        return;
      }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      
      const fileSafeBrand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.setAttribute("download", `${fileSafeBrand}_sqlite_${tableName.toLowerCase()}_backup.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`${tableName} verileriniz CSV dosyası olarak cihazınıza indirildi.`, "success");
    } catch (e) {
      console.error(e);
      showToast("CSV dönüştürme başarısız oldu", "warning");
    }
  };

  // Download all data as JSON backup
  const handleDownloadBackup = async () => {
    try {
      showToast("Verileriniz derleniyor...", "info");
      
      // Fetch public discounts, settings, and campaigns from backend API to include in the backup package
      let publicDiscountsList = [];
      let storeSettings = {};
      let campaignsList = [];
      
      try {
        const pdRes = await fetch("/api/public-discounts");
        if (pdRes.ok) publicDiscountsList = await pdRes.json();
        
        const setRes = await fetch("/api/settings");
        if (setRes.ok) storeSettings = await setRes.json();
        
        const campRes = await fetch("/api/campaigns");
        if (campRes.ok) campaignsList = await campRes.json();
      } catch (err) {
        console.warn("Could not fetch marketing data for backup, skipping:", err);
      }

      const backupData = {
        timestamp: new Date().toISOString(),
        version: APP_CURRENT_VERSION,
        products,
        sales,
        expenses,
        docSettings: localStorage.getItem('automation_doc_settings') ? JSON.parse(localStorage.getItem('automation_doc_settings')!) : {},
        publicDiscounts: publicDiscountsList,
        settings: storeSettings,
        campaigns: campaignsList,
        localConfigs: {
          akn_brand_name: localStorage.getItem('akn_brand_name') || '',
          akn_language: localStorage.getItem('akn_language') || '',
          akn_role: localStorage.getItem('akn_role') || '',
          akn_first_access_time: localStorage.getItem('akn_first_access_time') || '',
          akn_scanner_sound: localStorage.getItem('akn_scanner_sound') || '',
          akn_guide_muted: localStorage.getItem('akn_guide_muted') || '',
          wizardStep: localStorage.getItem('wizardStep') || '',
          googleAnalyticsId: localStorage.getItem('googleAnalyticsId') || '',
          adsConversionId: localStorage.getItem('adsConversionId') || '',
          adsLabel: localStorage.getItem('adsLabel') || '',
          ad_settings: localStorage.getItem('ad_settings') || ''
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      const fileName = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`✅ Tüm verileriniz (SQLite + Pazarlama & Ayarlar) başarıyla indirildi: ${fileName}`, "success");
    } catch (e) {
      console.error("Backup download failed:", e);
      showToast("Yedek dosya indirilemedi.", "warning");
    }
  };

  // Upload and restore data from JSON backup
  const handleRestoreBackup = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const fileContent = await file.text();
        const backupData = JSON.parse(fileContent);

        if (!backupData.products || !Array.isArray(backupData.products)) {
          showToast("Geçersiz yedek dosyası.", "warning");
          return;
        }

        // Clear and restore data
        showToast("Veriler yükleniyor...", "info");

        // Use direct robust import instead of length-dependent default initialization
        sqliteDb.importBackup(backupData.products, backupData.sales || [], backupData.expenses || []);

        // Restore doc settings
        if (backupData.docSettings) {
          localStorage.setItem('automation_doc_settings', JSON.stringify(backupData.docSettings));
        }

        // Restore local configuration parameters for other devices
        if (backupData.localConfigs) {
          const cfg = backupData.localConfigs;
          if (cfg.akn_brand_name) {
            localStorage.setItem('akn_brand_name', cfg.akn_brand_name);
            setBrandName(cfg.akn_brand_name);
          }
          if (cfg.akn_language) {
            localStorage.setItem('akn_language', cfg.akn_language);
            setLanguage(cfg.akn_language as 'tr' | 'en' | 'de');
          }
          if (cfg.akn_role) {
            localStorage.setItem('akn_role', cfg.akn_role);
            setUserRole(cfg.akn_role as UserRole);
          }
          if (cfg.akn_first_access_time) {
            localStorage.setItem('akn_first_access_time', cfg.akn_first_access_time);
          }
          if (cfg.akn_scanner_sound) {
            localStorage.setItem('akn_scanner_sound', cfg.akn_scanner_sound);
          }
          if (cfg.akn_guide_muted) {
            localStorage.setItem('akn_guide_muted', cfg.akn_guide_muted);
          }
          if (cfg.wizardStep) {
            localStorage.setItem('wizardStep', cfg.wizardStep);
          }
          if (cfg.googleAnalyticsId) {
            localStorage.setItem('googleAnalyticsId', cfg.googleAnalyticsId);
          }
          if (cfg.adsConversionId) {
            localStorage.setItem('adsConversionId', cfg.adsConversionId);
          }
          if (cfg.adsLabel) {
            localStorage.setItem('adsLabel', cfg.adsLabel);
          }
          if (cfg.ad_settings) {
            localStorage.setItem('ad_settings', cfg.ad_settings);
          }
        }

        // Bulk restore server marketing data, settings, and campaigns
        if (backupData.publicDiscounts || backupData.settings || backupData.campaigns) {
          try {
            await fetch("/api/restore-marketing", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                publicDiscounts: backupData.publicDiscounts || [],
                settings: backupData.settings || {},
                campaigns: backupData.campaigns || []
              })
            });
            showToast("Pazarlama & ayarlar verileri başarıyla entegre edildi! 📣", "success");
          } catch (mErr) {
            console.error("Marketing bulk restore failed", mErr);
          }
        }

        // Reload state elements directly from the restored SQLite database
        await reloadDataFromSQLite();
        showToast("✅ Tüm verileriniz başarıyla yüklendi ve eşitlendi!", "success");
      } catch (e) {
        console.error("Restore failed:", e);
        showToast("Yedek dosya yüklenirken hata oluştu.", "warning");
      }
    };

    input.click();
  };

  // Trigger manual authorization check override
  const handleManualAuthSync = async () => {
    showToast("Bulut sunucu lisans doğrulama sistemine erişiliyor...", "info");
    try {
      const status = await forceResyncAuthStatus();
      setSecurityStatus(status);
      if (status.isLocked) {
        showToast("Sunucu doğrulama kilidi aktifleştirildi.", "warning");
      } else {
        showToast("Cihaz lisans doğrulaması ve sürüm kontrolleri başarıyla güncellendi!", "success");
      }
    } catch (e) {
      showToast("Bulut bağlantısı başarısız. Çevrimdışı mod etkinleştiriliyor...", "warning");
      const fallbackStatus = await runSovereigntyAuthCheck();
      setSecurityStatus(fallbackStatus);
    }
  };

  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isShowcaseUrl = urlParams.get('view') === 'showcase' || urlParams.has('slug') || urlParams.has('discountId');

  // Showcase/Reklam linklerine lisans kontrolü yapma - Herkes görebilir
  if (isShowcaseUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-text antialiased">
        <Marketer brandName={brandName} />
      </div>
    );
  }

  // Lisans kontrolü - Sadece admin paneline girerken
  if (!isLicenseValid) {
    return (
      <LicenseGate
        onLicenseValid={() => {
          setIsLicenseValid(true);
          localStorage.setItem('isLicenseValid', 'true');
        }}
        language={language}
      />
    );
  }

  // Session Login Kontrolü - Lisans doğrulandıktan sonra şifre giriş
  if (!isSessionLoggedIn) {
    return (
      <LicenseGate
        onLicenseValid={() => {
          setIsSessionLoggedIn(true);
          // ⭐ localStorage'a kaydet, sayfa yenilenmişse de kalıcı olur
          localStorage.setItem('isSessionLoggedIn', 'true');
          // sessionStorage'a da kaydet (ek güvenlik için)
          sessionStorage.setItem('session_logged_in', 'true');
        }}
        language={language}
        showPasswordOnly={showPasswordOnly}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      
      {/* 1. Loading/Authorization Check view state */}
      {isCheckingAuth && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-5" />
          <h2 className="text-xs font-bold tracking-widest font-mono uppercase text-indigo-400">AKN GLOBAL SOVEREIGNTY SYSTEM</h2>
          <p className="text-[11px] text-slate-400 font-mono mt-1.5 max-w-sm leading-relaxed">Güvenlik lisans dosyaları, cihaz ID yetkilendirmesi ve güncelleme durumları denetleniyor...</p>
        </div>
      )}

      {/* 2. Mandatory Upgrade Screen overlay */}
      {!isCheckingAuth && securityStatus.isLocked && securityStatus.lockType === 'update_required' && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-6 text-slate-200">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-8 text-center space-y-6 shadow-2xl animate-scale-up text-slate-800">
            <div className="h-16 w-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
              <AlertTriangle className="h-8 w-8 animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-sm font-bold uppercase tracking-wider text-slate-105 font-mono">SÜRÜM GÜNCELLEMESİ ZORUNLUDUR</h1>
              <p className="text-[9.5px] text-indigo-400 font-mono tracking-widest uppercase font-semibold">MANDATORY SYSTEM UPDATE</p>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Mevcut portal sürümünüz (<b className="text-amber-500 font-mono">v{APP_CURRENT_VERSION}</b>), yönetim merkezinde belirlenen asgari zorunlu sürümden (<b className="text-indigo-400 font-mono">v{securityStatus.requiredVersion}</b>) daha düşüktür. Güvenlik, veri bütünlüğü ve yeni SQLite özellikleri için lütfen güncelleyin.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-left space-y-2 text-[10.5px] text-slate-350">
              <div className="flex justify-between">
                <span className="text-slate-500">Şirket/Kuruluş:</span>
                <span className="font-bold text-slate-300">{brandName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cihaz Kimliği:</span>
                <span className="font-bold text-amber-500 font-mono">{getOrCreateDeviceId()}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="https://ai.studio/build"
                className="block w-full py-3 bg-gradient-to-r from-indigo-650 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 text-white font-bold rounded-2xl text-[11px] transition-all shadow-lg shadow-indigo-600/20 text-center cursor-pointer"
              >
                Uygulama Mağazasından En Son Sürümü İndir
              </a>
              <button 
                onClick={handleManualAuthSync}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 font-semibold rounded-2xl text-[11px] transition cursor-pointer"
              >
                Güncellemeyi Kurdum (Yeniden Sorgula)
              </button>
            </div>
            
            <p className="text-[9px] text-slate-500 font-mono">
              Safe Recovery: Yerel SQLite veritabanındaki hiçbir veri bu kilitten etkilenmez.
            </p>
          </div>
        </div>
      )}

      {/* 3. User Access Denied Screen - Erişim Durdurulması */}
      {!isCheckingAuth && securityStatus.isLocked && (securityStatus.lockType === 'unauthorized' || securityStatus.lockType === 'trial_expired') && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-6 text-slate-200">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-850 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden text-slate-800">

            <div className={`absolute top-0 left-0 right-0 h-[3px] ${securityStatus.lockType === 'trial_expired' ? 'bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600' : 'bg-gradient-to-r from-red-600 via-amber-500 to-red-650'}`} />

            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto border animate-pulse ${
              securityStatus.lockType === 'trial_expired'
                ? 'bg-orange-650/10 text-orange-500 border-orange-650/20'
                : 'bg-red-650/10 text-red-500 border-red-650/20'
            }`}>
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-sm font-bold uppercase tracking-widest text-slate-205 font-sans">
                {securityStatus.lockType === 'trial_expired'
                  ? '15 Günlük Deneme Süresi Doldu'
                  : 'Erişiminiz Durdurulmuştur'}
              </h1>
              <p className={`text-[9px] font-mono tracking-wider font-semibold ${
                securityStatus.lockType === 'trial_expired' ? 'text-orange-400' : 'text-amber-400'
              }`}>
                {securityStatus.lockType === 'trial_expired'
                  ? 'TRIAL EXPIRED / DENEME SÜRESİ DOLDU'
                  : 'TEMPORARY ACCESS SUSPENSION'}
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850/60 text-left space-y-4">
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {securityStatus.lockType === 'trial_expired'
                  ? 'Sisteminizin 15 günlük deneme süresi sona ermiştir. Lütfen yöneticinizle iletişime geçiniz.'
                  : 'Bu hesabın sisteme erişim izni yöneticiniz tarafından geçici olarak durdurulmuştur. Detaylı bilgi ve erişim talebiniz için lütfen yöneticinizle iletişime geçiniz.'}
              </p>

              <div className="space-y-2 font-mono text-[10px] pt-3 border-t border-slate-850/40 text-slate-400">
                <div className="flex justify-between items-center bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-850">
                  <span className="text-slate-500 text-[9px] uppercase font-bold">Cihaz Kimliği:</span>
                  <span className="text-amber-400 font-bold tracking-wide select-all">{getOrCreateDeviceId()}</span>
                </div>

                {securityStatus.daysRemainingInTrial !== undefined && (
                  <div className="flex justify-between items-center bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-850">
                    <span className="text-slate-500 text-[9px] uppercase font-bold">Kalan Gün:</span>
                    <span className={`font-bold tracking-wide ${securityStatus.daysRemainingInTrial <= 0 ? 'text-red-400' : securityStatus.daysRemainingInTrial <= 3 ? 'text-orange-400' : 'text-emerald-400'}`}>
                      {securityStatus.daysRemainingInTrial} gün
                    </span>
                  </div>
                )}

                {securityStatus.errorMessage && (
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 text-[10.5px] leading-normal font-sans text-slate-300 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{securityStatus.errorMessage}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleManualAuthSync}
                className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-2xl text-[11px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/40"
              >
                <RefreshCw className="h-4 w-4" />
                DURUMU KONTROL ET
              </button>

              <p className="text-[9.5px] text-slate-500 leading-relaxed font-sans pt-1">
                🔒 <b>Veri Güvenliği:</b> Yerel veritabanınız (Ürünler, Satışlar, Giderler) tarayıcıda güvenli şekilde saklanmıştır. Erişim kısıtlanması hiçbir yerel veriyi etkilemez.
              </p>
            </div>

          </div>
        </div>
      )}
      
      {/* Dynamic Toast Feedback Overlay */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/60 p-4 flex items-center gap-3 animate-slide-up transition-all">
          <div className={`p-2 rounded-xl text-xs font-bold ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-600' 
              : toast.type === 'warning'
              ? 'bg-red-50 text-red-650'
              : 'bg-indigo-50 text-indigo-600'
          }`}>
            {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠️' : 'ℹ'}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Main Structural Navbar Branded for 'AKN Global Group Ltd' */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo / Corporate Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/25">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide block text-slate-100 uppercase">{brandName}</span>
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest block uppercase font-semibold">{t.corpPortal}</span>
            </div>
          </div>

          {/* Right Header Navigation Controllers */}
          <div className="flex items-center gap-3">

            {/* Manual Language Selector dropdown */}
            <div className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 transition-colors">
              <span className="text-xs text-indigo-300 font-extrabold hidden md:inline">🌐 DİL / LANG:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'tr' | 'en' | 'de')}
                className="bg-transparent text-white text-xs font-black font-sans border-none outline-none focus:ring-0 cursor-pointer uppercase py-0"
              >
                <option value="tr" className="bg-slate-900 text-white font-bold">🇹🇷 Türkçe (TR)</option>
                <option value="en" className="bg-slate-900 text-white font-bold">🇺🇸 English (EN)</option>
                <option value="de" className="bg-slate-900 text-white font-bold">🇩🇪 Deutsch (DE)</option>
              </select>
            </div>
            
            {/* Brand Modifier Button */}
            <button
              onClick={() => {
                setTempBrandName(brandName);
                setIsBrandModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/25 to-amber-600/25 hover:from-amber-500/40 hover:to-amber-600/40 text-amber-300 border border-amber-500/30 py-1.5 px-3 rounded-xl transition-all cursor-pointer text-xs font-bold"
              title="Sistem Marka ve Şirket İsmini Düzenle"
            >
              {t.addChangeBrand}
            </button>
            
            {/* Quick Switch Switcher for user role permissions */}
            <button
              onClick={toggleRole}
              className="flex items-center gap-2 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 py-1.5 px-3 rounded-xl transition-all cursor-pointer text-xs"
              title="Güvenlik Yetkilerini Değiştir"
            >
              {userRole === 'Yonetici' ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-200 hidden sm:inline text-[11px] font-semibold font-sans">{t.currentRoleManager}</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 text-amber-400" />
                  <span className="text-slate-400 hidden sm:inline text-[11px] font-sans">{t.currentRoleOperator}</span>
                </>
              )}
              <span className="text-[9px] bg-slate-800 py-0.5 px-1.5 rounded text-indigo-300 font-mono uppercase font-bold text-center">
                {t.roleChangeBtn}
              </span>
            </button>

            {/* Reset Defaults button */}
            <button
              onClick={handleResetDataToDefaults}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-800 text-left"
              title="Fabrika Ayarlarına Şablon Gönder"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Safe Storage Status Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/15 text-slate-800 py-2.5 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <p className="font-semibold text-[11px] text-amber-900 leading-normal">
              {language === 'tr' 
                ? "Güvenlik Uyarısı: Bu sistem tarayıcınızın kendi güvenli belleğinde çalışıyor. Tarayıcınızı sıfırlamadan veya çerezleri temizlemeden önce mutlaka 'Günlük Yedek Al' butonuna tıklayarak verilerinizi indirin."
                : "Security Warning: This system runs in your browser's own secure database storage. Please download a backup before resetting the browser."
              }
            </p>
          </div>
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] px-3.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <Download className="h-3.5 w-3.5" />
            {language === 'tr' ? 'Günlük Yedek Al' : 'Take Daily Backup'}
          </button>
        </div>
      </div>

      {/* Main Container Workspace */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        
        {/* Navigation Sidebar Drawer */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto whitespace-nowrap">
            
            {/* Tab: Dashboard */}
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                currentTab === 'dashboard' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>{t.tabDashboard}</span>
            </button>

            {/* Tab: Sales Entries */}
            <button
              onClick={() => setCurrentTab('sales')}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                currentTab === 'sales' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              <span>{t.tabSales}</span>
            </button>

            {/* Tab: Manage Catalog Inventory */}
            <button
              onClick={() => setCurrentTab('inventory')}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                currentTab === 'inventory' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="h-4.5 w-4.5" />
                <span>{t.tabInventory}</span>
              </div>
              {products.filter(p => p.currentStock < p.lowStockThreshold).length > 0 && (
                <span className="h-4.5 px-1.5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                  {products.filter(p => p.currentStock < p.lowStockThreshold).length}
                </span>
              )}
            </button>

            {/* Tab: Expenses */}
            <button
              onClick={() => setCurrentTab('expenses')}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                currentTab === 'expenses' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <FileText className="h-4.5 w-4.5" />
              <span>{t.tabExpenses}</span>
            </button>

            {/* Tab: Quick Lookup */}
            <button
              onClick={() => setCurrentTab('lookup')}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                currentTab === 'lookup' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Eye className="h-4.5 w-4.5" />
              <span>{t.tabLookup}</span>
            </button>

            {/* Tab: Automation */}
            <button
              onClick={() => setCurrentTab('automation')}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                currentTab === 'automation'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Cpu className="h-4.5 w-4.5" />
              <span>{t.tabAutomation}</span>
            </button>

            {/* Tab: İletişim */}
            <button
              onClick={() => setCurrentTab('contact')}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                currentTab === 'contact'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Phone className="h-4.5 w-4.5" />
              <span>{t.tabContact}</span>
            </button>

            {/* Tab: Pazarlamacı */}
            <button
              onClick={() => setCurrentTab('marketer')}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                currentTab === 'marketer'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Megaphone className="h-4.5 w-4.5" />
              <span>{t.tabMarketer}</span>
            </button>

            {/* Tab: Kullanım Kılavuzu & Sesli Asistan */}
            <button
              onClick={() => setCurrentTab('guide')}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                currentTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-600 hover:bg-indigo-50/40 bg-indigo-50/15 border border-indigo-200/50'
              }`}
            >
              <HelpCircle className="h-4.5 w-4.5" />
              <span>{t.tabGuide}</span>
            </button>

            <button
              onClick={() => setCurrentTab('help')}
              className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                currentTab === 'help'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-600 hover:bg-blue-50/40 bg-blue-50/15 border border-blue-200/50'
              }`}
            >
              <HelpCircle className="h-4.5 w-4.5" />
              <span>📖 Yardım Merkezi</span>
            </button>

          </nav>

          {/* Quick Stats sidebar footer info widget */}
          <div className="mt-6 bg-slate-900/5 p-4 rounded-2xl border border-slate-200/55 text-xs text-slate-500 space-y-3">
            <p className="font-bold text-slate-700 flex items-center gap-1.5 font-sans">
              <Database className="h-4 w-4 text-indigo-500 animate-pulse" />
              {t.systemItems}
            </p>
            <div className="space-y-1.5 font-mono text-[10px]">
              <div className="flex justify-between">
                <span>{t.catalogTable}</span>
                <span className="font-bold text-slate-800">{products.length} {language === 'tr' ? 'ürün' : language === 'de' ? 'Artikel' : 'items'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.criticalAlerts}</span>
                <span className="font-bold text-red-650">{products.filter(p => p.currentStock < p.lowStockThreshold).length} {language === 'tr' ? 'ürün' : language === 'de' ? 'Artikel' : 'items'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.salesLogTable}</span>
                <span className="font-bold text-slate-800">{sales.length} {language === 'tr' ? 'kayıt' : language === 'de' ? 'Einträge' : 'records'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.expensesTable}</span>
                <span className="font-bold text-slate-800">{expenses.length} {language === 'tr' ? 'kayıt' : language === 'de' ? 'Einträge' : 'records'}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-400">
              {t.realtimeMapped}
            </div>
          </div>

          {/* License Information Panel */}
          <div className="mt-4 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg shadow-slate-900/20">
            <p className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
              <Server className="h-4 w-4 text-emerald-400" />
              {language === 'tr' ? 'Lisans Bilgisi' : language === 'de' ? 'Lizenzinformation' : 'License Information'}
            </p>

            <div className="space-y-1 font-mono text-[9px] text-slate-350">
              {(() => {
                try {
                  const licenseDataStr = localStorage.getItem('license_data');
                  if (!licenseDataStr) {
                    return (
                      <div className="text-amber-400 text-center py-2">
                        {language === 'tr' ? 'Lisans Bilgisi Yüklenmedi' : language === 'de' ? 'Lizenzinformation nicht geladen' : 'License Info Not Loaded'}
                      </div>
                    );
                  }

                  const licenseData = JSON.parse(licenseDataStr);
                  const expiryDate = new Date(licenseData.exp);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  expiryDate.setHours(0, 0, 0, 0);

                  const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                  const isExpired = daysLeft <= 0;
                  const isWarning = daysLeft > 0 && daysLeft <= 7;

                  return (
                    <>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span>{language === 'tr' ? 'Lisans Türü' : language === 'de' ? 'Lizenztyp' : 'License Type'}</span>
                        <span className="font-bold text-indigo-400 capitalize">{licenseData.type}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span>{language === 'tr' ? 'Süresi Biten Tarih' : language === 'de' ? 'Ablaufdatum' : 'Expiry Date'}</span>
                        <span className={`font-bold ${isExpired ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {expiryDate.toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'de' ? 'de-DE' : 'en-US')}
                        </span>
                      </div>
                      <div className={`flex justify-between ${!isExpired && 'border-b border-slate-800/60 pb-1'}`}>
                        <span>{language === 'tr' ? 'Kalan Gün' : language === 'de' ? 'Verbleibende Tage' : 'Days Remaining'}</span>
                        <span className={`font-bold ${isExpired ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {isExpired ? (
                            <span className="text-red-400">⚠️ {language === 'tr' ? 'Süresi Doldu' : language === 'de' ? 'Abgelaufen' : 'Expired'}</span>
                          ) : (
                            <>{daysLeft} {language === 'tr' ? 'gün' : language === 'de' ? 'Tage' : 'days'}</>
                          )}
                        </span>
                      </div>
                      {isWarning && !isExpired && (
                        <div className="bg-amber-950/40 text-amber-300 p-1.5 rounded border border-amber-900/30 font-semibold leading-normal mt-1 text-center text-[9px]">
                          ⏰ {language === 'tr' ? 'Lisansınızın süresi yakında bitecek!' : language === 'de' ? 'Ihre Lizenz läuft bald ab!' : 'Your license will expire soon!'}
                        </div>
                      )}
                      {isExpired && (
                        <div className="bg-red-950/40 text-red-300 p-1.5 rounded border border-red-900/30 font-semibold leading-normal mt-1 text-center text-[9px]">
                          ❌ {language === 'tr' ? 'Lisansınızın süresi dolmuştur!' : language === 'de' ? 'Ihre Lizenz ist abgelaufen!' : 'Your license has expired!'}
                        </div>
                      )}
                    </>
                  );
                } catch (e) {
                  console.error('Lisans bilgisi okunamadı:', e);
                  return (
                    <div className="text-red-400 text-center py-2 text-[9px]">
                      {language === 'tr' ? 'Lisans Bilgisi Hatası' : language === 'de' ? 'Lizenzfehler' : 'License Error'}
                    </div>
                  );
                }
              })()}
            </div>

            {/* Dışa Aktar Actions */}
            <div className="space-y-2 pt-1 border-t border-slate-700 mt-3 pt-3">
              <p className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">{language === 'tr' ? 'YEDEKLEME & VERİ YÖNETİMİ' : language === 'de' ? 'BACKUP & VERWALTUNG' : 'BACKUP & DATA MANAGEMENT'}</p>

              <button
                onClick={handleDownloadBackup}
                className="w-full py-2 px-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-[9px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-emerald-600/30"
                title={language === 'tr' ? "Tüm verilerinizi JSON olarak indir" : language === 'de' ? "Daten als JSON herunterladen" : "Download all data as JSON"}
              >
                <Download className="h-3 w-3" /> {t.downloadData}
              </button>

              <button
                onClick={handleRestoreBackup}
                className="w-full py-2 px-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg text-[9px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-blue-600/30"
                title={language === 'tr' ? "JSON yedek dosyasını yükle" : language === 'de' ? "JSON Backup-Datei hochladen" : "Upload JSON backup file"}
              >
                <Download className="h-3 w-3 rotate-180" /> {t.uploadData}
              </button>

              <div className="text-[8px] text-slate-500 p-2 bg-slate-900/50 rounded border border-slate-800 italic">
                {t.backupInfo}
              </div>

              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-2">{language === 'tr' ? 'YEDEK DIŞA AKTAR' : language === 'de' ? 'REINES BACKUP ENTLADEN' : 'LEGACY BACKUP DUMPS'}</p>

              <button
                onClick={handleExportSQL}
                className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-amber-500 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-amber-500/10"
                title={language === 'tr' ? "Tüm SQLite veritabanınızı .SQL olarak yedekleyin" : language === 'de' ? "Gesamtes SQLite Backup als .SQL sichern" : "Backup entire SQLite DB as .SQL file"}
              >
                <Download className="h-3 w-3" /> {t.sqliteDump}
              </button>

              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => handleExportCSV('Products')}
                  className="py-1 bg-slate-800/50 hover:bg-slate-800 text-[8.5px] rounded border border-slate-800 hover:border-slate-700 font-medium text-slate-300"
                >
                  {t.catalog}
                </button>
                <button
                  onClick={() => handleExportCSV('Sales')}
                  className="py-1 bg-slate-800/50 hover:bg-slate-800 text-[8.5px] rounded border border-slate-800 hover:border-slate-700 font-medium text-slate-300"
                >
                  {t.sales}
                </button>
                <button
                  onClick={() => handleExportCSV('Expenses')}
                  className="py-1 bg-slate-800/50 hover:bg-slate-800 text-[8.5px] rounded border border-slate-800 hover:border-slate-700 font-medium text-slate-300"
                >
                  {t.expenses}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Route View Stage */}
        <main className="flex-1 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/75 shadow-sm min-w-0">
          
          {currentTab === 'dashboard' && (
            <Dashboard
              products={products}
              sales={sales}
              expenses={expenses}
              onNavigate={(view) => setCurrentTab(view)}
              brandName={brandName}
              language={language}
              onDownloadBackup={handleDownloadBackup}
              onLogout={() => {
                // ⭐ Session logout: localStorage'dan sil, böylece şifre tekrar istenir
                localStorage.removeItem('isSessionLoggedIn');
                sessionStorage.removeItem('session_logged_in');
                (window as any).__AKN_LICENSE__ = undefined;
                setIsSessionLoggedIn(false);
                setShowPasswordOnly(true);
              }}
            />
          )}

          {currentTab === 'sales' && (
            <SalesEntry 
              products={products}
              sales={sales}
              onAddSale={handleAddSale}
              onNavigateToInventory={() => setCurrentTab('inventory')}
              brandName={brandName}
              language={language}
            />
          )}

          {currentTab === 'inventory' && (
            <Suspense fallback={<div className="p-4 text-center text-slate-500">Yükleniyor...</div>}>
              <Inventory
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                userRole={userRole}
                brandName={brandName}
                language={language}
              />
            </Suspense>
          )}

          {currentTab === 'expenses' && (
            <Suspense fallback={<div className="p-4 text-center text-slate-500">Yükleniyor...</div>}>
              <Expenses
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                brandName={brandName}
                language={language}
              />
            </Suspense>
          )}

          {currentTab === 'lookup' && (
            <Suspense fallback={<div className="p-4 text-center text-slate-500">Yükleniyor...</div>}>
              <QuickLookup
                products={products}
                brandName={brandName}
                language={language}
              />
            </Suspense>
          )}

          {currentTab === 'automation' && (
            <Suspense fallback={<div className="p-4 text-center text-slate-500">Yükleniyor...</div>}>
              <Automation
                products={products}
                sales={sales}
                expenses={expenses}
                userEmail="abdulkadirkqn@gmail.com"
                brandName={brandName}
                language={language}
              />
            </Suspense>
          )}

          {currentTab === 'contact' && (
            <Suspense fallback={<div className="p-4 text-center text-slate-500">Yükleniyor...</div>}>
              <Contact
                brandName={brandName}
                language={language}
              />
            </Suspense>
          )}

          {currentTab === 'marketer' && (
            <Suspense fallback={<div className="p-4 text-center text-slate-500">Yükleniyor...</div>}>
              <Marketer
                brandName={brandName}
                language={language}
              />
            </Suspense>
          )}

          {currentTab === 'guide' && (
            <Suspense fallback={<div className="p-4 text-center text-slate-500">Yükleniyor...</div>}>
              <GuideAndVoice
                language={language}
              />
            </Suspense>
          )}

          {currentTab === 'help' && (
            <Suspense fallback={<div className="p-4 text-center text-slate-500">Yükleniyor...</div>}>
              <HelpCenter />
            </Suspense>
          )}

        </main>

      </div>

      {/* Elegant Standard corporateFooter */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-sans">
          <div>
            <p className="font-mono">{brandName} © 2026. Tüm kurumsal hakları saklıdır.</p>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Otomatik Envanter Düşüm Sistemi Aktif
            </span>
            <span className="text-slate-500">Güvenlik: Standart AES-256</span>
          </div>
        </div>
      </footer>

      {/* Brand Customization Modal overlay */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in text-slate-800">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm tracking-wide">Şirket & Marka Adını Özelleştir</h3>
                <p className="text-[10px] text-indigo-200 font-mono mt-0.5">Sistemdeki tüm faturalandırma, fiş ve başlıkları güncelleyin</p>
              </div>
              <button
                onClick={() => setIsBrandModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateBrandName(tempBrandName);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Yeni Marka / Kuruluş İsmi
                </label>
                <input
                  type="text"
                  required
                  value={tempBrandName}
                  onChange={(e) => setTempBrandName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none transition-all"
                  placeholder="Örn: AKN Global Group Ltd"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <span className="block text-slate-400 text-[9px] font-mono uppercase tracking-widest">Hızlı Şablon Önerileri:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTempBrandName('AKN Global Group Ltd')}
                    className="text-[10.5px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-700 transition"
                  >
                    AKN Global Group Ltd
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempBrandName('AKN Kurumsal Lojistik')}
                    className="text-[10.5px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-700 transition"
                  >
                    AKN Kurumsal Lojistik
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempBrandName('AKN Global Holding Inc.')}
                    className="text-[10.5px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-700 transition"
                  >
                    AKN Global Holding Inc.
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                >
                  Markayı Kaydet ve Uygula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ingress HMR and Port validation metrics */}
    </div>
  );
}
