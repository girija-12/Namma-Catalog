import { useState, useRef, useCallback } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";
import Webcam from "react-webcam";

interface ImageCaptureProps {
  onImageCaptured: (imageId: string, extractedData?: any) => void;
  onClose: () => void;
}

export function ImageCapture({ onImageCaptured, onClose }: ImageCaptureProps) {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useLanguage();
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const extractTextFromImage = useAction(api.ai.extractTextFromImage);
  const generateDescription = useAction(api.ai.generateDescription);
  const suggestCategory = useAction(api.ai.suggestCategory);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Upload to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await uploadResult.json();
      
      // Get the image URL for processing
      // Note: In production, you would use the actual image processing APIs
      // For demo purposes, we'll simulate OCR extraction
      const mockExtractedData = {
        productName: "Cotton T-Shirt",
        price: "599",
        category: "Clothing & Fashion",
        description: "Comfortable cotton t-shirt with modern fit",
        detectedText: "100% Cotton, Size M, Made in India"
      };

      toast.success(t("msg.image_processed"));
      onImageCaptured(storageId, mockExtractedData);
      
    } catch (error) {
      console.error("Image processing failed:", error);
      toast.error(t("msg.failed_process_image"));
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{t("image.capture_title")}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              mode === "camera"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📷 {t("image.camera")}
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              mode === "upload"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📁 {t("image.upload")}
          </button>
        </div>

        {/* Camera Mode */}
        {mode === "camera" && !capturedImage && (
          <div className="space-y-4">
            <div className="relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "environment"
                }}
              />
              <div className="absolute inset-0 border-2 border-dashed border-white opacity-50 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-sm">{t("image.center_product")}</p>
                </div>
              </div>
            </div>
            <button
              onClick={capture}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📸 {t("image.capture")}
            </button>
          </div>
        )}

        {/* Upload Mode */}
        {mode === "upload" && !capturedImage && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="text-6xl mb-4">📁</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {t("image.click_upload")}
              </p>
              <p className="text-sm text-gray-500">
                {t("image.supported_formats")}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured product"
                className="w-full rounded-lg"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                ✓ {t("image.captured")}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={retakePhoto}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                🔄 {t("image.retake")}
              </button>
              <button
                onClick={processImage}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t("image.processing")}
                  </span>
                ) : (
                  <>✨ {t("image.process")}</>
                )}
              </button>
            </div>

            {isProcessing && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="font-medium text-blue-900">{t("image.ai_processing")}</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• {t("image.extracting_text")}</li>
                  <li>• {t("image.identifying_product")}</li>
                  <li>• {t("image.generating_description")}</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
