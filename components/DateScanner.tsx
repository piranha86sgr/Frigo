import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Camera, X, Loader2, CameraOff, RefreshCw, Check } from "lucide-react";

interface DateScannerProps {
  onDateDetected: (date: string) => void;
  onClose: () => void;
}

export function DateScanner({ onDateDetected, onClose }: DateScannerProps) {
  const [status, setStatus] = useState<"idle" | "camera" | "capturing" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const [cameraSupported, setCameraSupported] = useState(true);
  
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

  const startCamera = useCallback(async () => {
    try {
      setErrorMessage(null);
      setStatus("camera");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraSupported(false);
      setErrorMessage("Impossibile accedere alla fotocamera. Verifica i permessi.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
      setStatus("error");
      setErrorMessage("La fotocamera non è supportata da questo browser.");
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setStatus("capturing");
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    stopCamera();
    setStatus("processing");
    
    try {
      const imageData = canvas.toDataURL("image/png");
      
      // Simuliamo il riconoscimento OCR (in produzione usare Tesseract.js)
      // Per ora usiamo un prompt per far inserire manualmente la data rilevata
      const text = await simulateOCR(imageData);
      
      if (text) {
        setDetectedText(text);
        setStatus("success");
      } else {
        setErrorMessage("Nessuna data rilevata. Riprova o inserisci manualmente.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMessage("Errore durante l'elaborazione dell'immagine.");
      setStatus("error");
    }
  }, [stopCamera]);

  const simulateOCR = async (imageData: string): Promise<string | null> => {
    // In un'implementazione reale, qui useremmo Tesseract.js
    // Per questa demo, mostriamo l'immagine catturata e permettiamo l'inserimento manuale
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simuliamo un ritardo di elaborazione
        resolve(null); // Restituisce null per mostrare l'interfaccia manuale
      }, 1500);
    });
  };

  const parseDate = (text: string): string | null => {
    // Prova vari formati di data comuni
    const patterns = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,  // DD/MM/YYYY o DD-MM-YYYY
      /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,    // YYYY/MM/DD
      /(\d{1,2})\s*(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)[a-z]*\s*(\d{2,4})/i, // DD Month YYYY
    ];

    const months: { [key: string]: number } = {
      gen: 1, feb: 2, mar: 3, apr: 4, mag: 5, giu: 6,
      lug: 7, ago: 8, set: 9, ott: 10, nov: 11, dic: 12
    };

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let day: number, month: number, year: number;
        
        if (pattern === patterns[0]) {
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]);
          if (year < 100) year += 2000;
        } else if (pattern === patterns[1]) {
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else {
          day = parseInt(match[1]);
          month = months[match[2].toLowerCase().substring(0, 3)];
          year = parseInt(match[3]);
          if (year < 100) year += 2000;
        }

        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    }
    return null;
  };

  const handleManualDate = (date: string) => {
    onDateDetected(date);
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setDetectedText(null);
    startCamera();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          Scansiona Data di Scadenza
        </h3>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-4">
        {/* Camera View */}
        {(status === "idle" || status === "camera") && cameraSupported && (
          <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
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
                <div className="absolute inset-8 border-2 border-white/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg"></div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white/80 text-sm">Inquadra la data di scadenza</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing */}
        {status === "capturing" && (
          <div className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-600">Acquisizione immagine...</p>
            </div>
          </div>
        )}

        {status === "processing" && (
          <div className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-600">Elaborazione in corso...</p>
              <p className="text-slate-400 text-sm mt-1">Riconoscimento testo OCR</p>
            </div>
          </div>
        )}

        {/* Success */}
        {status === "success" && detectedText && (
          <div className="bg-emerald-50 rounded-xl p-6 text-center">
            <Check className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <p className="text-emerald-700 font-medium mb-2">Data rilevata!</p>
            <p className="text-emerald-600">{detectedText}</p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-600 text-sm mb-3">
                Inserisci manualmente la data:
              </p>
              <input
                type="date"
                onChange={(e) => handleManualDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-3">
          {status === "idle" && cameraSupported && (
            <Button
              onClick={startCamera}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
            >
              <Camera className="w-5 h-5 mr-2" />
              Attiva Fotocamera
            </Button>
          )}
          
          {status === "camera" && (
            <>
              <Button
                onClick={captureImage}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl"
              >
                <Camera className="w-5 h-5 mr-2" />
                Scatta Foto
              </Button>
              <Button
                onClick={stopCamera}
                variant="outline"
                className="px-4"
              >
                <X className="w-5 h-5" />
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
                onClick={onClose}
                variant="outline"
                className="px-4"
              >
                Chiudi
              </Button>
            </>
          )}

          {status === "success" && (
            <Button
              onClick={onClose}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl"
            >
              Continua
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}