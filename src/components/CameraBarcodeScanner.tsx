import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  CameraOff, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  HelpCircle,
  Barcode,
  Sparkle
} from 'lucide-react';

interface CameraBarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  brandName?: string;
  placeholderText?: string;
}

export default function CameraBarcodeScanner({ 
  onScan, 
  onClose, 
  brandName = 'AKN Global Group',
  placeholderText = 'Barkodu tarayıcı çerçevesinin içine yerleştirin' 
}: CameraBarcodeScannerProps) {
  
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('akn_scanner_sound') !== 'disabled';
    } catch {
      return true;
    }
  });

  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanStreak, setScanStreak] = useState<number>(0);
  const [manualInput, setManualInput] = useState<string>('');

  const qrCodeInstanceRef = useRef<Html5Qrcode | null>(null);
  const scanTimeRef = useRef<number>(0);

  // Sound generator (Web Audio API beep)
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = 1200; // Sharp positive scanning beep
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log("Audio feedback error or permission gesture missing", e);
    }
  };

  // Toggle sound option
  const handleToggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    try {
      localStorage.setItem('akn_scanner_sound', newValue ? 'enabled' : 'disabled');
    } catch (e) {
      console.error(e);
    }
  };

  // Safe camera initializer and starter
  const initializeScanner = async (cameraId?: string) => {
    setErrorMessage('');
    
    // Ensure accurate element ID structure exists
    const container = document.getElementById('camera-preview-container');
    if (!container) return;

    try {
      // 1. Initialize instance if not already exists
      if (!qrCodeInstanceRef.current) {
        qrCodeInstanceRef.current = new Html5Qrcode('camera-preview-container');
      }

      const html5QrCode = qrCodeInstanceRef.current;

      // 2. Stop running scanner if any
      if (html5QrCode.isScanning) {
        await html5QrCode.stop();
      }

      setIsScanning(false);

      // 3. Configuration metrics
      const config = {
        fps: 15,
        qrbox: (width: number, height: number) => {
          // Responsive target frame
          const size = Math.min(width, height) * 0.7;
          return { width: size, height: size };
        }
      };

      const scanSuccessCallback = (decodedText: string) => {
        // Prevent duplicate fast multi-scans in 1.2 seconds of the same code
        const now = Date.now();
        if (decodedText === lastScannedCode && now - scanTimeRef.current < 1200) {
          return;
        }

        scanTimeRef.current = now;
        setLastScannedCode(decodedText);
        setScanStreak(prev => prev + 1);
        playBeep();
        
        // Notify parent callback
        onScan(decodedText);
      };

      const scanErrorCallback = (err: any) => {
        // Quiet mode - avoid spamming log for failed frame attempts
      };

      // 4. Determine camera target
      const targetCamera = cameraId || selectedCameraId || { facingMode: 'environment' };

      await html5QrCode.start(
        targetCamera,
        config,
        scanSuccessCallback,
        scanErrorCallback
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera start failed:", err);
      let turkishError = "Kamera başlatılamadı. Lütfen kamera izinlerinizi kontrol edin.";
      if (err?.toString().includes("NotAllowedError") || err?.name === "NotAllowedError") {
        turkishError = "Kamera erişim izni reddedildi. Lütfen tarayıcı adres barından kamera izinlerine onay verip sayfayı yenileyiniz.";
      } else if (err?.toString().includes("NotFoundError") || err?.name === "NotFoundError") {
        turkishError = "Cihazınızda kullanılabilir kamera donanımı bulunamadı.";
      }
      setErrorMessage(turkishError);
      setIsScanning(false);
    }
  };

  // Mount, fetch cameras list & start environment camera automatically
  useEffect(() => {
    let active = true;

    const loadCameras = async () => {
      try {
        // Trigger generic permission request by listing devices
        const deviceList = await Html5Qrcode.getCameras();
        if (!active) return;

        if (deviceList && deviceList.length > 0) {
          setCameras(deviceList);
          
          // Prefer back camera (environment) if available
          const backCam = deviceList.find(cam => 
            cam.label.toLowerCase().includes('back') || 
            cam.label.toLowerCase().includes('ark') ||
            cam.label.toLowerCase().includes('rears') ||
            cam.label.toLowerCase().includes('çevre')
          );
          
          const defaultCamId = backCam ? backCam.id : deviceList[0].id;
          setSelectedCameraId(defaultCamId);
          
          // Start scanning with the default camera
          setTimeout(() => {
            if (active) {
              initializeScanner(defaultCamId);
            }
          }, 300);
        } else {
          setErrorMessage("Cihazda bağlı herhangi bir kamera bulunamadı.");
        }
      } catch (err: any) {
        if (!active) return;
        console.warn("Could not list cameras initially, trying facingMode:", err);
        // Fallback directly to start with facingMode environment
        initializeScanner();
      }
    };

    loadCameras();

    return () => {
      active = false;
      // Clean up camera stream and instance on unmount
      if (qrCodeInstanceRef.current) {
        const instance = qrCodeInstanceRef.current;
        if (instance.isScanning) {
          instance.stop().catch(e => console.warn("Failed stopping scanner", e));
        }
      }
    };
  }, []);

  // Handle manual selection changes
  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCameraId(id);
    initializeScanner(id);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      playBeep();
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up text-white flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm tracking-wide text-slate-100 font-sans">
                {brandName.toUpperCase()} KAMERA OKUMA SİSTEMİ
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Live Camera Barcode & QR Code Reader</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl transition ${
                soundEnabled 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              } cursor-pointer`}
              title={soundEnabled ? "Ses açık" : "Ses kapalı"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              KAPAT ✕
            </button>
          </div>
        </div>

        {/* Scanner Stage Content */}
        <div className="p-6 flex-1 flex flex-col space-y-4">
          
          {/* Main camera view box */}
          <div className="relative rounded-2xl bg-black border-2 border-slate-850 overflow-hidden h-72 flex flex-col items-center justify-center">
            
            {/* The html5-qrcode preview container */}
            <div 
              id="camera-preview-container" 
              className="absolute inset-0 w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
            />

            {/* Glowing Scan Target Frame Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="w-48 h-48 border-2 border-dashed border-indigo-400/50 rounded-2xl relative flex items-center justify-center bg-indigo-500/5 animate-[pulse_1.5s_infinite]">
                  
                  {/* Neon active corners */}
                  <div className="absolute top-0 left-0 h-5 w-5 border-l-4 border-t-4 border-amber-400 -mt-1 -ml-1 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 h-5 w-5 border-r-4 border-t-4 border-amber-400 -mt-1 -mr-1 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 h-5 w-5 border-l-4 border-b-4 border-amber-400 -mb-1 -ml-1 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 h-5 w-5 border-r-4 border-b-4 border-amber-400 -mb-1 -mr-1 rounded-br-lg" />
                  
                  {/* High speed neon laser line */}
                  <div className="absolute left-2 right-2 h-0.5 bg-amber-500 shadow-[0_0_10px_3px_rgba(245,158,11,0.8)] animate-[bounce_2.5s_infinite]" />
                </div>
              </div>
            )}

            {/* Error state overlay */}
            {errorMessage && (
              <div className="absolute inset-0 bg-slate-950/95 z-20 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="max-w-xs">
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{errorMessage}</p>
                </div>
                <button
                  onClick={() => initializeScanner()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-400 rounded-xl flex items-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Tekrar Dene
                </button>
              </div>
            )}

            {/* Loading screen while camera boots up */}
            {!isScanning && !errorMessage && (
              <div className="absolute inset-0 bg-slate-950/80 z-10 flex flex-col items-center justify-center space-y-3">
                <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-[11px] font-mono text-indigo-400 uppercase tracking-widest animate-pulse">
                  Kamera Donanımı Başlatılıyor...
                </p>
              </div>
            )}

            {/* Top scanning HUD */}
            {isScanning && (
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 bg-slate-900/60 p-2 rounded-lg backdrop-blur-xs">
                <span className="text-[9px] font-mono text-emerald-400 block tracking-widest bg-emerald-950/80 border border-emerald-900 px-2 py-0.5 rounded uppercase">
                  CANLI AKIŞ AKTİF
                </span>
                
                {scanStreak > 0 && (
                  <span className="text-[9px] font-mono text-amber-300 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-900/70 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {scanStreak} Tarama Başarılı
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-400 font-sans">{placeholderText}</p>
          </div>

          {/* Camera Selection dropdown if multiple cameras exist */}
          {cameras.length > 1 && (
            <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex items-center justify-between gap-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider block uppercase whitespace-nowrap">
                ⚙️ Lens Değiştir:
              </span>
              <select
                value={selectedCameraId}
                onChange={handleCameraChange}
                className="flex-1 bg-slate-900 text-xs text-slate-300 border border-slate-750 rounded-xl py-1.5 px-3 focus:outline-none cursor-pointer"
              >
                {cameras.map((camera, idx) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `${idx + 1}. Kamera Donanımı`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Feedback message for last successful read */}
          {lastScannedCode && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl flex items-center justify-between animate-slide-up">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Barcode className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[8px] font-mono text-emerald-500 font-bold uppercase tracking-wider">OKUNAN BARKOD</span>
                  <span className="block text-xs font-mono font-semibold text-emerald-400 truncate">{lastScannedCode}</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-900 px-2 py-0.5 rounded-full animate-bounce">
                Başarılı!
              </span>
            </div>
          )}

          {/* Manual Entry Fallback Form */}
          <div className="pt-4 border-t border-slate-800">
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Barkod ya da QR kod numarasını manuel yazın..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-650 text-slate-300 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition cursor-pointer"
              >
                Giriş Yap
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
