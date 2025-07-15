import { useState, useRef } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { EnhancedVoiceRecorder } from "./EnhancedVoiceRecorder";
import { EnhancedImageCapture } from "./EnhancedImageCapture";
import { EnhancedProductForm } from "./EnhancedProductForm";
import { ProductList } from "./ProductList";
import { useTranslation, Language } from "../lib/translations";

interface EnhancedCatalogAgentProps {
  language: Language;
}

export function EnhancedCatalogAgent({ language }: EnhancedCatalogAgentProps) {
  const [mode, setMode] = useState<"voice" | "text" | "image">("voice");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  const products = useQuery(api.products.list, {}) || [];
  const extractProductInfo = useAction(api.ai.extractProductInfo);
  const generateDescription = useAction(api.ai.generateProductDescription);
  const categorizeProduct = useAction(api.ai.categorizeProduct);
  const generateTags = useAction(api.ai.generateTags);
  
  const t = useTranslation(language);

  const handleVoiceTranscription = async (transcription: string) => {
    setIsProcessing(true);
    try {
      const extracted = await extractProductInfo({ text: transcription, language });
      setExtractedData(extracted);
      toast.success(t("voiceProcessed"));
    } catch (error) {
      toast.error(t("failedToProcess"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageExtraction = async (extractedText: string) => {
    setIsProcessing(true);
    try {
      const extracted = await extractProductInfo({ text: extractedText, language });
      setExtractedData(extracted);
      toast.success(t("imageProcessed"));
    } catch (error) {
      toast.error(t("failedToProcess"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextInput = async (text: string) => {
    setIsProcessing(true);
    try {
      const extracted = await extractProductInfo({ text, language });
      setExtractedData(extracted);
      toast.success(t("textProcessed"));
    } catch (error) {
      toast.error(t("failedToProcess"));
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
            language,
          }),
        data.category ? Promise.resolve(data.category) :
          categorizeProduct({
            productName: data.name,
            description: data.description,
            language,
          }),
        generateTags({
          productName: data.name,
          description: data.description || data.name,
          category: data.category || "General",
          language,
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
      toast.error(language === "ta" ? "AI மேம்பாடு தோல்வியடைந்தது, ஆனால் நீங்கள் கைமுறையாக சேமிக்கலாம்" : "AI enhancement failed, but you can still save manually");
      return data;
    }
  };

  const modes = [
    { key: "voice", label: t("voiceMode"), desc: t("voiceModeDesc") },
    { key: "text", label: t("textMode"), desc: t("textModeDesc") },
    { key: "image", label: t("imageMode"), desc: t("imageModeDesc") },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("mainTitle")}
        </h1>
        <p className="text-gray-600">
          {t("mainSubtitle")}
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl p-2 shadow-sm border">
          <div className="flex gap-2">
            {modes.map(({ key, label, desc }) => (
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
          <EnhancedVoiceRecorder
            onTranscription={handleVoiceTranscription}
            isProcessing={isProcessing}
            language={language}
          />
        )}

        {mode === "image" && (
          <EnhancedImageCapture
            onExtraction={handleImageExtraction}
            isProcessing={isProcessing}
            language={language}
          />
        )}

        {mode === "text" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">{t("enterProductDetails")}</h3>
            <textarea
              placeholder={t("textPlaceholder")}
              className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleTextInput(e.target.value);
                }
              }}
            />
            <p className="text-sm text-gray-500 mt-2">
              {t("mixLanguages")}
            </p>
          </div>
        )}
      </div>

      {/* Product Form */}
      {extractedData && (
        <div className="max-w-2xl mx-auto">
          <EnhancedProductForm
            initialData={extractedData}
            onSave={() => {
              setExtractedData(null);
              toast.success(t("productSaved"));
            }}
            onEnhanceWithAI={enhanceWithAI}
            language={language}
          />
        </div>
      )}

      {/* Product List */}
      <div className="max-w-6xl mx-auto">
        <ProductList products={products} language={language} />
      </div>
    </div>
  );
}
