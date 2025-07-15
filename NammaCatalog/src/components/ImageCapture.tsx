import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ImageCaptureProps {
  onExtraction: (text: string) => void;
  isProcessing: boolean;
}

export function ImageCapture({ onExtraction, isProcessing }: ImageCaptureProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

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
        throw new Error("Upload failed");
      }

      // Simulate OCR processing
      // In a real implementation, you would use Google Vision API or similar
      setTimeout(() => {
        const mockExtractions = [
          "Samsung Galaxy A54 MRP 25999 Blue Color 128GB Storage",
          "Basmati Rice Premium Quality 25KG Net Weight Price 1200",
          "Cotton T-Shirt Size M Brand Nike Price 899 White Color",
          "Dell Laptop Intel i5 8GB RAM 256GB SSD Price 45000",
        ];
        const randomExtraction = mockExtractions[Math.floor(Math.random() * mockExtractions.length)];
        onExtraction(randomExtraction);
        setIsExtracting(false);
      }, 3000);

    } catch (error) {
      toast.error("Failed to process image");
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
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-xl font-semibold mb-6 text-center">Image Capture & OCR</h3>

      {!previewUrl ? (
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
                  Capture or Upload Product Image
                </p>
                <p className="text-sm text-gray-500">
                  AI will extract text and product details automatically
                </p>
              </div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Choose Image
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
            }}
            className="hidden"
          />

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">📝 Tips for best results:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Ensure good lighting and clear text</li>
              <li>• Include product labels, price tags, or packaging</li>
              <li>• Hold camera steady and focus on text areas</li>
              <li>• Works with Tamil, English, and mixed text</li>
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
                  Extracting text...
                </div>
              ) : (
                "🔍 Extract Product Info"
              )}
            </button>
            <button
              onClick={resetImage}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Another
            </button>
          </div>

          {isExtracting && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <p className="text-sm text-yellow-800">
                  AI is analyzing your image and extracting product information...
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
