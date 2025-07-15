import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTranslation, Language } from "../lib/translations";

interface DashboardProps {
  language: Language;
}

export function Dashboard({ language }: DashboardProps) {
  const stats = useQuery(api.products.getInventoryStats);
  const lowStockItems = useQuery(api.products.getLowStockItems) || [];
  const products = useQuery(api.products.list, {}) || [];
  const t = useTranslation(language);

  if (stats === undefined || stats === null) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const recentProducts = products
    .sort((a, b) => b.lastUpdated - a.lastUpdated)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("inventoryDashboard")}
        </h1>
        <p className="text-gray-600">
          {t("realtimeOverview")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("totalProducts")}</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("lowStockItems")}</p>
              <p className="text-3xl font-bold text-red-600">{stats.lowStockCount}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("inventoryValue")}</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{stats.totalInventoryValue.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t("categories")}</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.topCategories.length}
              </p>
            </div>
            <div className="text-4xl">🏷️</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {t("lowStockAlerts")}
          </h2>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-500">{t("allWellStocked")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div>
                    <p className="font-medium text-red-900">{item.name}</p>
                    <p className="text-sm text-red-700">
                      {t("onlyLeft")} {item.stockLevel} {language === "ta" ? "மீதம்" : "left"} ({t("alertAt")} {item.lowStockThreshold})
                    </p>
                  </div>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                    {t("restock")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {t("categoryBreakdown")}
          </h2>
          <div className="space-y-3">
            {stats.topCategories.map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="font-medium">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(count / stats.totalProducts) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {t("recentlyAdded")}
        </h2>
        {recentProducts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-500">{t("noProductsAdded")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProducts.map((product) => (
              <div
                key={product._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  {product.aiGenerated && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      ✨ AI
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold text-green-600 mb-1">
                  ₹{product.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <p className="text-xs text-gray-400">
                  {new Date(product.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
