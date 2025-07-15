import { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ProductFormProps {
  initialData: any;
  onSave: () => void;
  onEnhanceWithAI: (data: any) => Promise<any>;
}

export function ProductForm({ initialData, onSave, onEnhanceWithAI }: ProductFormProps) {
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
  const [showPriceSuggestion, setShowPriceSuggestion] = useState(false);
  
  const createProduct = useMutation(api.products.create);
  const suggestPrice = useAction(api.ai.suggestOptimalPrice);

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
    }
  }, [initialData]);

  const handleEnhanceWithAI = async () => {
    if (!formData.name) {
      toast.error("Please enter a product name first");
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await onEnhanceWithAI(formData);
      setFormData(enhanced);
      toast.success("AI enhancement complete! Review and save.");
    } catch (error) {
      toast.error("AI enhancement failed");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handlePriceSuggestion = async () => {
    if (!formData.name || !formData.category) {
      toast.error("Please enter product name and category first");
      return;
    }

    try {
      const suggestion = await suggestPrice({
        productName: formData.name,
        category: formData.category,
        currentPrice: formData.price || undefined,
      });
      
      setFormData(prev => ({ ...prev, price: suggestion.suggestedPrice }));
      toast.success(`Suggested price: ₹${suggestion.suggestedPrice}`);
    } catch (error) {
      toast.error("Failed to get price suggestion");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error("Please fill in product name and price");
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
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Product Details</h3>
        <button
          onClick={handleEnhanceWithAI}
          disabled={isEnhancing || !formData.name}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isEnhancing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Enhancing...
            </>
          ) : (
            <>
              ✨ Enhance with AI
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Price with AI suggestion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹) *
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
              💡 Suggest
            </button>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Food & Beverages">Food & Beverages</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Beauty & Personal Care">Beauty & Personal Care</option>
            <option value="Books & Stationery">Books & Stationery</option>
            <option value="Sports & Fitness">Sports & Fitness</option>
            <option value="Automotive">Automotive</option>
            <option value="Health & Medicine">Health & Medicine</option>
            <option value="Groceries">Groceries</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Product description (AI can generate this for you)"
          />
        </div>

        {/* Stock Management */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Level
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
              Low Stock Alert
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
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >
                  {tag}
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
            💾 Save Product
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
