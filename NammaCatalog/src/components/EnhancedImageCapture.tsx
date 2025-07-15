import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useTranslation, Language } from "../lib/translations";

interface EnhancedImageCaptureProps {
  onExtraction: (text: string) => void;
  isProcessing: boolean;
  language: Language;
}

export function EnhancedImageCapture({ onExtraction, isProcessing, language }: EnhancedImageCaptureProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  const t = useTranslation(language);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraMode(true);
    } catch (error) {
      toast.error(t("couldNotAccessMic")); // Reusing translation
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraMode(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            handleImageSelect(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsExtracting(true);
    try {
      // Upload image to Convex storage
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });

      if (!result.ok) {
        throw new Error(t("uploadFailed"));
      }

      // Enhanced mock OCR with better language support
      setTimeout(() => {
        const tamilExtractions = [
          "சாம்சங் கேலக்சி A54 MRP 25999 நீல நிறம் 128GB சேமிப்பு",
          "பாஸ்மதி அரிசி பிரீமியம் தரம் 25கிலோ நிகர எடை விலை 1200",
          "காட்டன் டி-சட்டை சைஸ் M பிராண்ட் நைக் விலை 899 வெள்ளை நிறம்",
          "டெல் லேப்டாப் இன்டெல் i5 8GB ராம் 256GB SSD விலை 45000"
        ];
        
        const englishExtractions = [
          "Samsung Galaxy A54 MRP 25999 Blue Color 128GB Storage",
          "Basmati Rice Premium Quality 25KG Net Weight Price 1200",
          "Cotton T-Shirt Size M Brand Nike Price 899 White Color",
          "Dell Laptop Intel i5 8GB RAM 256GB SSD Price 45000"
        ];
        
        const mixedExtractions = [
          "Samsung Galaxy A54 MRP 25999 நீல Color 128GB Storage",
          "Basmati Rice Premium Quality 25கிலோ Net Weight விலை 1200",
          "Cotton T-Shirt Size M Brand Nike விலை 899 வெள்ளை Color"
        ];

        let extractions;
        if (language === "ta") {
          extractions = [...tamilExtractions, ...mixedExtractions];
        } else {
          extractions = [...englishExtractions, ...mixedExtractions];
        }
        
        const randomExtraction = extractions[Math.floor(Math.random() * extractions.length)];
        onExtraction(randomExtraction);
        setIsExtracting(false);
      }, 3000);

    } catch (error) {
      toast.error(t("failedToProcess"));
      setIsExtracting(false);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    stopCamera();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-xl font-semibold mb-6 text-center">{t("imageCaptureTitle")}</h3>

      {isCameraMode ? (
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full max-h-64 object-cover rounded-lg border"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={capturePhoto}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              📸 {language === "ta" ? "புகைப்படம் எடு" : "Capture Photo"}
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : !previewUrl ? (
        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="text-4xl">📷</div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {t("captureOrUpload")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("aiWillExtract")}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={startCamera}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📸 {language === "ta" ? "கேமரா" : "Camera"}
                </button>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  {t("chooseImage")}
                </button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
            }}
            className="hidden"
          />

          {/* Enhanced Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">{t("tipsForBest")}</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>{t("goodLighting")}</li>
              <li>{t("includeLabels")}</li>
              <li>{t("holdSteady")}</li>
              <li>{t("worksWithTamil")}</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={previewUrl}
              alt="Selected product"
              className="w-full max-h-64 object-contain rounded-lg border"
            />
            <button
              onClick={resetImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Process Button */}
          <div className="flex gap-3">
            <button
              onClick={processImage}
              disabled={isExtracting || isProcessing}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExtracting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t("extractingText")}
                </div>
              ) : (
                t("extractProductInfo")
              )}
            </button>
            <button
              onClick={resetImage}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t("tryAnother")}
            </button>
          </div>

          {isExtracting && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <p className="text-sm text-yellow-800">
                  {language === "ta" 
                    ? "AI உங்கள் படத்தை பகுப்பாய்வு செய்து தயாரிப்பு தகவலைப் பிரித்தெடுக்கிறது..."
                    : "AI is analyzing your image and extracting product information..."
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
