import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Barcode, X, Loader2, CameraOff, Check, Calendar, Package, RefreshCw, Flashlight, SwitchCamera } from "lucide-react";
import { ScanResult } from "../types";
import { lookupProduct, generateDemoBarcode } from "../utils/helpers";

interface ProductScannerProps {
  onScanComplete: (data: ScanResult) => void;
  onClose: () => void;
}

type ScanStep = "barcode" | "date" | "complete";

export function ProductScanner({ onScanComplete, onClose }: ProductScannerProps) {
  const [status, setStatus] = useState<"idle" | "camera" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [scanStep, setScanStep] = useState<ScanStep>("barcode");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<"environment" | "user">("environment");
  
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const checkCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    } catch (err) {
      console.error("Error checking cameras:", err);
    }
  }, []);

  const startCamera = useCallback(async (facingMode: "environment" | "user" = "environment") => {
    try {
      setErrorMessage(null);
      setStatus("camera");
      
      // Stop any existing stream first
      stopCamera();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      await checkCameras();
    } catch (err) {
      console.error("Camera error:", err);
      setCameraSupported(false);
      setErrorMessage("Impossibile accedere alla fotocamera. Verifica i permessi del browser.");
      setStatus("error");
    }
  }, [stopCamera, checkCameras]);

  const switchCamera = useCallback(async () => {
    const newFacing = currentCamera === "environment" ? "user" : "environment";
    setCurrentCamera(newFacing);
    await startCamera(newFacing);
  }, [currentCamera, startCamera]);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
      setStatus("error");
      setErrorMessage("La fotocamera non è supportata da questo browser.");
    } else {
      checkCameras();
    }
  }, [checkCameras]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const simulateBarcodeScan = useCallback(async (): Promise<string> => {
    // Simula la scansione di un barcode
    // In produzione, qui si userebbe una libreria come QuaggaJS o ZXing
    return new Promise((resolve) => {
      setTimeout(() => {
        const demoBarcode = generateDemoBarcode();
        resolve(demoBarcode);
      }, 2000);
    });
  }, []);

  const captureAndProcess = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setStatus("processing");
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    stopCamera();
    
    try {
      if (scanStep === "barcode") {
        // Simula scansione barcode
        const barcode = await simulateBarcodeScan();
        const product = lookupProduct(barcode);
        
        setScannedBarcode(barcode);
        
        if (product) {
          setProductName(product.name);
          setCategory(product.category);
          setStatus("success");
          
          setTimeout(() => {
            setScanStep("date");
            setStatus("idle");
          }, 1500);
        } else {
          setProductName("Prodotto sconosciuto");
          setCategory("altro");
          setStatus("success");
          
          setTimeout(() => {
            setScanStep("date");
            setStatus("idle");
          }, 1500);
        }
      }
    } catch (err) {
      setErrorMessage("Errore durante la scansione.");
      setStatus("error");
    }
  }, [stopCamera, scanStep, simulateBarcodeScan]);

  const handleManualBarcode = () => {
    const barcode = generateDemoBarcode();
    const product = lookupProduct(barcode);
    
    setScannedBarcode(barcode);
    
    if (product) {
      setProductName(product.name);
      setCategory(product.category);
    } else {
      setProductName("Prodotto sconosciuto");
      setCategory("altro");
    }
    
    setScanStep("date");
    setStatus("idle");
  };

  const handleDateSubmit = () => {
    if (expiryDate) {
      onScanComplete({
        barcode: scannedBarcode || undefined,
        productName: productName || undefined,
        category: category || undefined,
        expiryDate: expiryDate,
      });
    }
  };

  const handleSkipDate = () => {
    onScanComplete({
      barcode: scannedBarcode || undefined,
      productName: productName || undefined,
      category: category || undefined,
    });
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setScannedBarcode(null);
    setProductName(null);
    setCategory(null);
    setScanStep("barcode");
    setCurrentCamera("environment");
    startCamera("environment");
  };

  const getStepIndicator = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
          scanStep === "barcode" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
        }`}>
          <Barcode className="w-4 h-4" />
          <span>Barcode</span>
          {scanStep !== "barcode" && <Check className="w-4 h-4 text-emerald-500" />}
        </div>
        <div className="w-8 h-0.5 bg-slate-200"></div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
          scanStep === "date" ? "bg-amber-100 text-amber-700" : 
          scanStep === "complete" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
        }`}>
          <Calendar className="w-4 h-4" />
          <span>Data</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Barcode className="w-5 h-5 text-blue-600" />
          Scansiona Prodotto
        </h3>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="p-2 hover:bg-white/50 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-4">
        {getStepIndicator()}

        {/* Step 1: Barcode Scanner */}
        {scanStep === "barcode" && (
          <>
            {/* Camera View */}
            {(status === "idle" || status === "camera") && cameraSupported && (
              <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${currentCamera === "user" ? "scale-x-[-1]" : ""}`}
                />
                {status === "idle" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                    <div className="text-center text-white">
                      <CameraOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm opacity-70">Fotocamera disattivata</p>
                    </div>
                  </div>
                )}
                {status === "camera" && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Barcode scanning overlay - orizzontale per codici a barre */}
                    <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
                      <div className="relative w-full h-24">
                        {/* Cornice esterna */}
                        <div className="absolute inset-0 border-2 border-white/50 rounded-lg"></div>
                        
                        {/* Angoli decorativi */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-white rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-white rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-white rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-white rounded-br-lg"></div>
                        
                        {/* Linea di scansione animata */}
                        <div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden">
                          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Istruzioni */}
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <p className="text-white/90 text-sm font-medium bg-slate-900/60 inline-block px-4 py-1.5 rounded-full">
                        Inquadra il codice a barre
                      </p>
                    </div>
                    
                    {/* Indicatore fotocamera posteriore */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-slate-900/60 text-white/80 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {currentCamera === "environment" ? (
                          <>
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <span>Posteriore</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            <span>Frontale</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Processing */}
            {status === "processing" && (
              <div className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-slate-600">Riconoscimento prodotto...</p>
                  <p className="text-slate-400 text-sm mt-1">Analisi codice a barre</p>
                </div>
              </div>
            )}

            {/* Success */}
            {status === "success" && productName && (
              <div className="bg-emerald-50 rounded-xl p-6 text-center">
                <Package className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <p className="text-emerald-700 font-medium mb-1">Prodotto riconosciuto!</p>
                <p className="text-emerald-600 font-bold text-lg">{productName}</p>
                {scannedBarcode && (
                  <p className="text-emerald-500 text-sm mt-1">EAN: {scannedBarcode}</p>
                )}
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}
          </>
        )}

        {/* Step 2: Date Input */}
        {scanStep === "date" && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-blue-700 font-bold">{productName}</p>
                  {scannedBarcode && (
                    <p className="text-blue-500 text-sm">EAN: {scannedBarcode}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <label className="flex items-center gap-2 text-amber-700 font-medium mb-3">
                <Calendar className="w-5 h-5" />
                Inserisci la data di scadenza
              </label>
              <input
                type="date"
                value={expiryDate || ""}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-3">
          {scanStep === "barcode" && (
            <>
              {status === "idle" && cameraSupported && (
                <Button
                  onClick={() => startCamera("environment")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
                >
                  <Barcode className="w-5 h-5 mr-2" />
                  Attiva Fotocamera Posteriore
                </Button>
              )}
              
              {status === "camera" && (
                <>
                  <Button
                    onClick={captureAndProcess}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl"
                  >
                    <Barcode className="w-5 h-5 mr-2" />
                    Scansiona
                  </Button>
                  {hasMultipleCameras && (
                    <Button
                      onClick={switchCamera}
                      variant="outline"
                      className="px-3 border-slate-300 hover:bg-slate-100"
                      title="Cambia fotocamera"
                    >
                      <SwitchCamera className="w-5 h-5 text-slate-600" />
                    </Button>
                  )}
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="px-3 border-red-200 hover:bg-red-50 hover:border-red-300"
                    title="Chiudi fotocamera"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </Button>
                </>
              )}

              {status === "error" && (
                <>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="flex-1 py-3 rounded-xl"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Riprova
                  </Button>
                  <Button
                    onClick={handleManualBarcode}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                  >
                    Demo Mode
                  </Button>
                </>
              )}
            </>
          )}

          {scanStep === "date" && (
            <>
              <Button
                onClick={handleDateSubmit}
                disabled={!expiryDate}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5 mr-2" />
                Conferma
              </Button>
              <Button
                onClick={handleSkipDate}
                variant="outline"
                className="px-4 py-3 rounded-xl"
              >
                Salta
              </Button>
            </>
          )}
        </div>

        {scanStep === "barcode" && status !== "camera" && status !== "processing" && (
          <p className="text-center text-slate-400 text-sm mt-3">
            Non hai il codice a barre?{" "}
            <button
              type="button"
              onClick={handleManualBarcode}
              className="text-blue-600 hover:underline"
            >
              Prova la demo
            </button>
          </p>
        )}
      </div>

      {/* CSS for animation */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(96px); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        .border-t-3 { border-top-width: 3px; }
        .border-b-3 { border-bottom-width: 3px; }
        .border-l-3 { border-left-width: 3px; }
        .border-r-3 { border-right-width: 3px; }
      `}</style>
    </div>
  );
}