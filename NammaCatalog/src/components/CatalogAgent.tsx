import { useState, useRef } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { VoiceRecorder } from "./VoiceRecorder";
import { ImageCapture } from "./ImageCapture";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";

export function CatalogAgent() {
  const [mode, setMode] = useState<"voice" | "text" | "image">("voice");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  const products = useQuery(api.products.list, {}) || [];
  const extractProductInfo = useAction(api.ai.extractProductInfo);
  const generateDescription = useAction(api.ai.generateProductDescription);
  const categorizeProduct = useAction(api.ai.categorizeProduct);
  const generateTags = useAction(api.ai.generateTags);

  const handleVoiceTranscription = async (transcription: string) => {
    setIsProcessing(true);
    try {
      const extracted = await extractProductInfo({ text: transcription });
      setExtractedData(extracted);
      toast.success("Voice input processed! Review and save your product.");
    } catch (error) {
      toast.error("Failed to process voice input");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageExtraction = async (extractedText: string) => {
    setIsProcessing(true);
    try {
      const extracted = await extractProductInfo({ text: extractedText });
      setExtractedData(extracted);
      toast.success("Image processed! Review the extracted information.");
    } catch (error) {
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextInput = async (text: string) => {
    setIsProcessing(true);
    try {
      const extracted = await extractProductInfo({ text });
      setExtractedData(extracted);
      toast.success("Text processed! AI has extracted product information.");
    } catch (error) {
      toast.error("Failed to process text");
    } finally {
      setIsProcessing(false);
    }
  };

  const enhanceWithAI = async (data: any) => {
    if (!data.name) return data;

    try {
      const [description, category, tags] = await Promise.all([
        data.description ? Promise.resolve(data.description) : 
          generateDescription({
            productName: data.name,
            category: data.category,
            price: data.price,
          }),
        data.category ? Promise.resolve(data.category) :
          categorizeProduct({
            productName: data.name,
            description: data.description,
          }),
        generateTags({
          productName: data.name,
          description: data.description || data.name,
          category: data.category || "General",
        }),
      ]);

      return {
        ...data,
        description,
        category,
        tags,
        aiGenerated: true,
      };
    } catch (error) {
      toast.error("AI enhancement failed, but you can still save manually");
      return data;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Catalog Agent
        </h1>
        <p className="text-gray-600">
          Add products using voice, text, or images • AI-powered descriptions • Tamil + English support
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl p-2 shadow-sm border">
          <div className="flex gap-2">
            {[
              { key: "voice", label: "🎤 Voice", desc: "Speak your product details" },
              { key: "text", label: "✏️ Text", desc: "Type product information" },
              { key: "image", label: "📷 Image", desc: "Capture or upload photos" },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setMode(key as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  mode === key
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                title={desc}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Interface */}
      <div className="max-w-2xl mx-auto">
        {mode === "voice" && (
          <VoiceRecorder
            onTranscription={handleVoiceTranscription}
            isProcessing={isProcessing}
          />
        )}

        {mode === "image" && (
          <ImageCapture
            onExtraction={handleImageExtraction}
            isProcessing={isProcessing}
          />
        )}

        {mode === "text" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Enter Product Details</h3>
            <textarea
              placeholder="Describe your product... (e.g., 'Samsung Galaxy phone, 15000 rupees, good condition, blue color')"
              className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleTextInput(e.target.value);
                }
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              💡 You can type in English, Tamil, or mix both languages
            </p>
          </div>
        )}
      </div>

      {/* Product Form */}
      {extractedData && (
        <div className="max-w-2xl mx-auto">
          <ProductForm
            initialData={extractedData}
            onSave={() => {
              setExtractedData(null);
              toast.success("Product saved successfully!");
            }}
            onEnhanceWithAI={enhanceWithAI}
          />
        </div>
      )}

      {/* Product List */}
      <div className="max-w-6xl mx-auto">
        <ProductList products={products} language="en" />
      </div>
    </div>
  );
}
