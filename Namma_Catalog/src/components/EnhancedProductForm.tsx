import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";
import { ImageCapture } from "./ImageCapture";
import { EnhancedVoiceRecorder } from "./EnhancedVoiceRecorder";

interface EnhancedProductFormProps {
  onSuccess: () => void;
}

export function EnhancedProductForm({ onSuccess }: EnhancedProductFormProps) {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stockLevel: "",
    minStockLevel: "5",
    language: language,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageId, setImageId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [showImageCapture, setShowImageCapture] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [inputMethod, setInputMethod] = useState<"manual" | "voice" | "image">("manual");
  const [completionStatus, setCompletionStatus] = useState({
    name: false,
    description: false,
    price: false,
    category: false,
  });

  const createProduct = useMutation(api.products.create);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const generateDescription = useAction(api.ai.generateDescription);
  const suggestCategory = useAction(api.ai.suggestCategory);
  const generateTags = useAction(api.ai.generateTags);

  // Update completion status when form data changes
  const updateCompletionStatus = (data: typeof formData) => {
    setCompletionStatus({
      name: data.name.trim().length > 0,
      description: data.description.trim().length > 0,
      price: data.price.trim().length > 0 && !isNaN(parseFloat(data.price)),
      category: data.category.trim().length > 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    updateCompletionStatus(newData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleImageCaptured = (capturedImageId: string, extractedData?: any) => {
    setImageId(capturedImageId);
    setShowImageCapture(false);
    setInputMethod("image");
    
    if (extractedData) {
      const newData = {
        ...formData,
        name: extractedData.productName || formData.name,
        price: extractedData.price || formData.price,
        category: extractedData.category || formData.category,
        description: extractedData.description || formData.description,
      };
      setFormData(newData);
      updateCompletionStatus(newData);
      toast.success(t("msg.image_data_extracted"));
    }
  };

  const handleVoiceDataExtracted = (voiceData: any) => {
    setShowVoiceRecorder(false);
    setInputMethod("voice");
    
    const newData = {
      ...formData,
      name: voiceData.name || formData.name,
      price: voiceData.price || formData.price,
      category: voiceData.category || formData.category,
      description: voiceData.description || formData.description,
    };
    setFormData(newData);
    updateCompletionStatus(newData);
    toast.success(t("msg.voice_data_extracted"));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) {
      toast.error(t("msg.enter_product_name"));
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const description = await generateDescription({
        productName: formData.name,
        category: formData.category || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        language: formData.language,
      });

      const newData = { ...formData, description };
      setFormData(newData);
      updateCompletionStatus(newData);
      toast.success(t("msg.description_generated"));
    } catch (error) {
      toast.error(t("msg.failed_generate_description"));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSuggestCategory = async () => {
    if (!formData.name.trim()) {
      toast.error(t("msg.enter_product_name"));
      return;
    }

    try {
      const category = await suggestCategory({
        productName: formData.name,
        description: formData.description || undefined,
      });

      const newData = { ...formData, category };
      setFormData(newData);
      updateCompletionStatus(newData);
      toast.success(t("msg.category_suggested"));
    } catch (error) {
      toast.error(t("msg.failed_suggest_category"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.category) {
      toast.error(t("msg.fill_required_fields"));
      return;
    }

    setIsLoading(true);
    try {
      let finalImageId = imageId;
      
      // Upload image if provided
      if (imageFile && !imageId) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        
        if (!result.ok) {
          throw new Error("Failed to upload image");
        }
        
        const { storageId } = await result.json();
        finalImageId = storageId;
      }

      // Generate tags
      const tags = await generateTags({
        productName: formData.name,
        description: formData.description,
        category: formData.category,
      });

      // Create product
      await createProduct({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stockLevel: parseInt(formData.stockLevel) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 5,
        imageId: finalImageId as any || undefined,
        tags,
        language: formData.language,
        aiGenerated: inputMethod !== "manual",
      });

      toast.success(t("msg.product_created"));
      onSuccess();
    } catch (error) {
      toast.error(t("msg.failed_create_product"));
    } finally {
      setIsLoading(false);
    }
  };

  const completionPercentage = Object.values(completionStatus).filter(Boolean).length / Object.keys(completionStatus).length * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t("form.add_product")}</h2>
          
          {/* Completion Progress */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">{Math.round(completionPercentage)}% {t("form.complete")}</div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Input Method Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">{t("form.input_method")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setInputMethod("manual")}
              className={`p-4 rounded-lg border-2 transition-all ${
                inputMethod === "manual"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-2">✍️</div>
              <div className="font-medium">{t("form.manual_entry")}</div>
              <div className="text-sm text-gray-600">{t("form.manual_desc")}</div>
            </button>

            <button
              onClick={() => setShowVoiceRecorder(true)}
              className={`p-4 rounded-lg border-2 transition-all ${
                inputMethod === "voice"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-2">🎤</div>
              <div className="font-medium">{t("form.voice_entry")}</div>
              <div className="text-sm text-gray-600">{t("form.voice_desc")}</div>
            </button>

            <button
              onClick={() => setShowImageCapture(true)}
              className={`p-4 rounded-lg border-2 transition-all ${
                inputMethod === "image"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-2">📷</div>
              <div className="font-medium">{t("form.image_entry")}</div>
              <div className="text-sm text-gray-600">{t("form.image_desc")}</div>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.product_name")} *
              {completionStatus.name && <span className="text-green-500 ml-2">✓</span>}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("form.product_name_placeholder")}
              required
            />
          </div>

          {/* Language Selection */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.language")}
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ta">தமிழ்</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.category")} *
              {completionStatus.category && <span className="text-green-500 ml-2">✓</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("form.category_placeholder")}
                required
              />
              <button
                type="button"
                onClick={handleSuggestCategory}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span>✨</span>
                {t("form.ai_suggest")}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.description")} *
              {completionStatus.description && <span className="text-green-500 ml-2">✓</span>}
            </label>
            <div className="space-y-2">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("form.description_placeholder")}
                required
              />
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingDescription ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t("form.generating")}
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    {t("form.generate_description")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                {t("form.price")} *
                {completionStatus.price && <span className="text-green-500 ml-2">✓</span>}
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label htmlFor="stockLevel" className="block text-sm font-medium text-gray-700 mb-2">
                {t("form.stock_level")}
              </label>
              <input
                type="number"
                id="stockLevel"
                name="stockLevel"
                value={formData.stockLevel}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700 mb-2">
                {t("form.min_stock")}
              </label>
              <input
                type="number"
                id="minStockLevel"
                name="minStockLevel"
                value={formData.minStockLevel}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="5"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.product_image")}
            </label>
            <div className="space-y-4">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="text-center text-gray-500">
                {t("form.or")}
              </div>
              
              <button
                type="button"
                onClick={() => setShowImageCapture(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>📷</span>
                {t("form.capture_image")}
              </button>
            </div>
            
            {(imageFile || imageId) && (
              <div className="mt-2">
                {imageFile && (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                {imageId && !imageFile && (
                  <div className="w-32 h-32 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">✓ {t("form.image_captured")}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || completionPercentage < 100}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {t("form.creating")}
              </>
            ) : (
              <>
                <span>✨</span>
                {t("form.create_product")}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Image Capture Modal */}
      {showImageCapture && (
        <ImageCapture
          onImageCaptured={handleImageCaptured}
          onClose={() => setShowImageCapture(false)}
        />
      )}

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t("voice.title")}</h3>
              <button
                onClick={() => setShowVoiceRecorder(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <EnhancedVoiceRecorder
              onSuccess={() => setShowVoiceRecorder(false)}
              onDataExtracted={handleVoiceDataExtracted}
              mode="integrated"
            />
          </div>
        </div>
      )}
    </div>
  );
}
