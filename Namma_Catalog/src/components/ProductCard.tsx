import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  stockLevel: number;
  minStockLevel: number;
  imageUrl?: string;
  tags: string[];
  isActive: boolean;
  aiGenerated: boolean;
}

export function ProductCard({ product, viewMode = "grid" }: { product: Product; viewMode?: "grid" | "list" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [stockLevel, setStockLevel] = useState(product.stockLevel);
  const { t } = useLanguage();
  
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);

  const handleStockUpdate = async () => {
    try {
      await updateProduct({
        id: product._id as any,
        stockLevel,
      });
      toast.success(t("msg.stock_updated"));
      setIsEditing(false);
    } catch (error) {
      toast.error(t("msg.failed_update_stock"));
    }
  };

  const handleDelete = async () => {
    if (confirm(t("msg.confirm_delete"))) {
      try {
        await removeProduct({ id: product._id as any });
        toast.success(t("msg.product_deleted"));
      } catch (error) {
        toast.error(t("msg.failed_delete_product"));
      }
    }
  };

  const isLowStock = product.stockLevel <= product.minStockLevel;

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-2xl">📦</div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm truncate">
                  {product.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.aiGenerated && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {t("card.ai_generated")}
                    </span>
                  )}
                  {isLowStock && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      {t("card.low_stock")}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-green-600">
                  ₹{product.price.toLocaleString()}
                </div>
                <div className={`text-sm ${isLowStock ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                  {t("card.stock")} {product.stockLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
            >
              {t("card.edit")}
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 transition-colors"
            >
              {t("card.delete")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-sm">No image</p>
            </div>
          </div>
        )}
        
        {/* AI Generated Badge */}
        {product.aiGenerated && (
          <div className="absolute top-2 left-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            {t("card.ai_generated")}
          </div>
        )}
        
        {/* Low Stock Badge */}
        {isLowStock && (
          <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            {t("card.low_stock")}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 truncate flex-1">
            {product.name}
          </h3>
          <span className="text-lg font-bold text-green-600 ml-2">
            ₹{product.price.toLocaleString()}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {product.category}
          </span>
          <span className="text-xs text-gray-500">
            SKU: {product.sku}
          </span>
        </div>

        {/* Stock Level */}
        <div className="mb-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={stockLevel}
                onChange={(e) => setStockLevel(parseInt(e.target.value) || 0)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                min="0"
              />
              <button
                onClick={handleStockUpdate}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                {t("card.save")}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setStockLevel(product.stockLevel);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                {t("card.cancel")}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isLowStock ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                {t("card.stock")} {product.stockLevel}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {t("card.edit")}
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{product.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => updateProduct({
              id: product._id as any,
              isActive: !product.isActive,
            })}
            className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
              product.isActive
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            {product.isActive ? t("card.deactivate") : t("card.activate")}
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 transition-colors"
          >
            {t("card.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
