import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useTranslation, Language } from "../lib/translations";

interface Product {
  _id: any;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  stockLevel: number;
  lowStockThreshold: number;
  imageUrl?: string | null;
  isLowStock: boolean;
  aiGenerated: boolean;
  lastUpdated: number;
}

interface ProductListProps {
  products: Product[];
  language: Language;
}

export function ProductList({ products, language }: ProductListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const removeProduct = useMutation(api.products.remove);
  const updateProduct = useMutation(api.products.update);
  const t = useTranslation(language);

  const categories = [...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRemove = async (id: any) => {
    if (confirm(t("confirmRemove"))) {
      try {
        await removeProduct({ id });
        toast.success(t("productRemoved"));
      } catch (error) {
        toast.error(t("failedToRemove"));
      }
    }
  };

  const handleStockUpdate = async (id: any, newStock: number) => {
    try {
      await updateProduct({ id, stockLevel: newStock });
      toast.success(t("stockUpdated"));
    } catch (error) {
      toast.error(t("failedToUpdate"));
    }
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{t("noProductsYet")}</h3>
        <p className="text-gray-500">
          {t("startAdding")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("yourCatalog")} ({filteredProducts.length} {t("items")})
        </h2>
        
        {/* Filters */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder={t("searchProducts")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            {/* Product Image */}
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-xl"
              />
            )}
            
            <div className="p-4">
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex gap-1">
                  {product.aiGenerated && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      ✨ AI
                    </span>
                  )}
                  {product.isLowStock && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      ⚠️ {language === "ta" ? "குறைவு" : "Low"}
                    </span>
                  )}
                </div>
              </div>

              {/* Price and Category */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-green-600">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {product.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{product.tags.length - 3} {language === "ta" ? "மேலும்" : "more"}
                    </span>
                  )}
                </div>
              )}

              {/* Stock Management */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">{t("stock")}</span>
                <input
                  type="number"
                  value={product.stockLevel}
                  onChange={(e) => handleStockUpdate(product._id, Number(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <span className="text-sm text-gray-500">
                  ({t("alertAt")} {product.lowStockThreshold})
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleRemove(product._id)}
                  className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  {t("remove")}
                </button>
                <button className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                  {t("edit")}
                </button>
              </div>

              {/* Last Updated */}
              <p className="text-xs text-gray-400 mt-2 text-center">
                {t("updated")} {new Date(product.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
