import { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useTranslation, Language } from "../lib/translations";

interface EnhancedProductFormProps {
  initialData: any;
  onSave: () => void;
  onEnhanceWithAI: (data: any) => Promise<any>;
  language: Language;
}

export function EnhancedProductForm({ initialData, onSave, onEnhanceWithAI, language }: EnhancedProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    tags: [] as string[],
    stockLevel: 10,
    lowStockThreshold: 5,
    aiGenerated: false,
  });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const createProduct = useMutation(api.products.create);
  const suggestPrice = useAction(api.ai.suggestOptimalPrice);
  const t = useTranslation(language);

  const categories = [
    { key: "electronics", label: t("electronics") },
    { key: "clothing", label: t("clothing") },
    { key: "foodBeverages", label: t("foodBeverages") },
    { key: "homeKitchen", label: t("homeKitchen") },
    { key: "beautyPersonalCare", label: t("beautyPersonalCare") },
    { key: "booksStationery", label: t("booksStationery") },
    { key: "sportsFitness", label: t("sportsFitness") },
    { key: "automotive", label: t("automotive") },
    { key: "healthMedicine", label: t("healthMedicine") },
    { key: "groceries", label: t("groceries") },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        category: initialData.category || "",
        tags: initialData.tags || [],
        stockLevel: 10,
        lowStockThreshold: 5,
        aiGenerated: false,
      });
      
      // Auto-validate and suggest improvements
      validateAndSuggest(initialData);
    }
  }, [initialData]);

  const validateAndSuggest = (data: any) => {
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (!data.name) {
      errors.push(language === "ta" ? "தயாரிப்பு பெயர் தேவை" : "Product name is required");
    }
    
    if (!data.price || data.price <= 0) {
      errors.push(language === "ta" ? "சரியான விலை தேவை" : "Valid price is required");
    }
    
    if (!data.category) {
      suggestions.push(language === "ta" ? "வகையைத் தேர்ந்தெடுக்கவும்" : "Please select a category");
    }
    
    if (!data.description) {
      suggestions.push(language === "ta" ? "AI விளக்கம் உருவாக்க முடியும்" : "AI can generate description");
    }

    setValidationErrors(errors);
    
    if (suggestions.length > 0) {
      toast.info(suggestions.join(", "));
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!formData.name) {
      toast.error(t("enterNameFirst"));
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await onEnhanceWithAI(formData);
      setFormData(enhanced);
      toast.success(t("aiEnhancementComplete"));
    } catch (error) {
      toast.error(language === "ta" ? "AI மேம்பாடு தோல்வியடைந்தது" : "AI enhancement failed");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handlePriceSuggestion = async () => {
    if (!formData.name || !formData.category) {
      toast.error(t("enterNameCategory"));
      return;
    }

    try {
      const suggestion = await suggestPrice({
        productName: formData.name,
        category: formData.category,
        currentPrice: formData.price || undefined,
      });
      
      setFormData(prev => ({ ...prev, price: suggestion.suggestedPrice }));
      toast.success(`${t("suggestedPrice")} ₹${suggestion.suggestedPrice}`);
    } catch (error) {
      toast.error(language === "ta" ? "விலை பரிந்துரை தோல்வியடைந்தது" : "Failed to get price suggestion");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error(t("fillNamePrice"));
      return;
    }

    try {
      await createProduct({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category || "General",
        tags: formData.tags,
        stockLevel: formData.stockLevel,
        lowStockThreshold: formData.lowStockThreshold,
        aiGenerated: formData.aiGenerated,
      });
      
      onSave();
      toast.success(t("productSaved"));
    } catch (error) {
      toast.error(language === "ta" ? "தயாரிப்பைச் சேமிக்க முடியவில்லை" : "Failed to save product");
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">{t("productDetails")}</h3>
        <button
          onClick={handleEnhanceWithAI}
          disabled={isEnhancing || !formData.name}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isEnhancing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t("enhancing")}
            </>
          ) : (
            t("enhanceWithAI")
          )}
        </button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("productName")}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t("enterProductName")}
            required
          />
        </div>

        {/* Price with AI suggestion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("price")}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
            <button
              type="button"
              onClick={handlePriceSuggestion}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
            >
              {t("suggest")}
            </button>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("category")}
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t("selectCategory")}</option>
            {categories.map(({ key, label }) => (
              <option key={key} value={label}>{label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("description")}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder={t("descriptionPlaceholder")}
          />
        </div>

        {/* Stock Management */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("stockLevel")}
            </label>
            <input
              type="number"
              value={formData.stockLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, stockLevel: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("lowStockAlert")}
            </label>
            <input
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        {/* Tags */}
        {formData.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("tags")}
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      tags: prev.tags.filter((_, i) => i !== index)
                    }))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            {t("saveProduct")}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
