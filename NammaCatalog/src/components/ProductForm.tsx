import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";

interface ProductFormProps {
  onSuccess: () => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
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
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const createProduct = useMutation(api.products.create);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const generateDescription = useAction(api.ai.generateDescription);
  const suggestCategory = useAction(api.ai.suggestCategory);
  const generateTags = useAction(api.ai.generateTags);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
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

      setFormData(prev => ({ ...prev, description }));
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
      const suggestedCategory = await suggestCategory({
        productName: formData.name,
        description: formData.description || undefined,
      });

      setFormData(prev => ({ ...prev, category: suggestedCategory || "General" }));
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
      let imageId;
      
      // Upload image if provided
      if (imageFile) {
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
        imageId = storageId;
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
        imageId,
        tags,
        language: formData.language,
        aiGenerated: true,
      });

      toast.success(t("msg.product_created"));
      onSuccess();
    } catch (error) {
      toast.error(t("msg.failed_create_product"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("form.add_product")}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.product_name")} *
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {t("form.ai_suggest")}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.description")} *
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
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingDescription ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t("form.generating")}
                  </span>
                ) : (
                  t("form.generate_description")
                )}
              </button>
            </div>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                {t("form.price")} *
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
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {imageFile && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {t("form.creating")}
              </span>
            ) : (
              t("form.create_product")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
