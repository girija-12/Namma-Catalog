import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProductCard } from "./ProductCard";
import { StatsCard } from "./StatsCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useState, useEffect } from "react";

export function EnhancedDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "created">("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { t } = useLanguage();
  
  const stats = useQuery(api.products.getDashboardStats);
  const products = useQuery(api.products.list, {
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    activeOnly: true,
  });

  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    if (products) {
      let filtered = [...products];
      
      // Sort products
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "price":
            aValue = a.price;
            bValue = b.price;
            break;
          case "stock":
            aValue = a.stockLevel;
            bValue = b.stockLevel;
            break;
          case "created":
            aValue = a._creationTime;
            bValue = b._creationTime;
            break;
          default:
            return 0;
        }
        
        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      setFilteredProducts(filtered);
    }
  }, [products, sortBy, sortOrder]);

  if (stats === undefined || products === undefined) {
    return <DashboardSkeleton />;
  }

  const categories = [...new Set((products as any[]).map(p => p.category))];
  const lowStockProducts = (products as any[]).filter(p => p.stockLevel <= p.minStockLevel);
  const recentProducts = (products as any[]).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section with Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {t("dashboard.welcome")}
            </h2>
            <p className="text-blue-100 mb-4">
              {t("dashboard.subtitle")}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                ✨ {t("dashboard.ai_powered")}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                🎤 {t("dashboard.voice_enabled")}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                📱 {t("dashboard.mobile_ready")}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <div className="text-blue-100 text-sm">{t("stats.total_products")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t("stats.total_products")}
          value={stats.totalProducts}
          icon="📦"
          color="blue"
        />
        <StatsCard
          title={t("stats.active_products")}
          value={stats.activeProducts}
          icon="✅"
          color="green"
        />
        <StatsCard
          title={t("stats.low_stock")}
          value={stats.lowStockCount}
          icon="⚠️"
          color="red"
        />
        <StatsCard
          title={t("stats.total_value")}
          value={`₹${stats.totalValue.toLocaleString()}`}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Alerts Section */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-400 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                {t("alerts.low_stock_title")}
              </h3>
              <p className="text-red-700">
                {lowStockProducts.length} {t("alerts.products_need_attention")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lowStockProducts.slice(0, 3).map((product) => (
                  <span
                    key={product._id}
                    className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm"
                  >
                    {product.name} ({product.stockLevel} left)
                  </span>
                ))}
                {lowStockProducts.length > 3 && (
                  <span className="text-red-600 text-sm">
                    +{lowStockProducts.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t("filter.all_categories")}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created-desc">{t("sort.newest_first")}</option>
            <option value="created-asc">{t("sort.oldest_first")}</option>
            <option value="name-asc">{t("sort.name_az")}</option>
            <option value="name-desc">{t("sort.name_za")}</option>
            <option value="price-desc">{t("sort.price_high_low")}</option>
            <option value="price-asc">{t("sort.price_low_high")}</option>
            <option value="stock-asc">{t("sort.stock_low_high")}</option>
            <option value="stock-desc">{t("sort.stock_high_low")}</option>
          </select>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }>
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product._id} 
            product={product} 
            viewMode={viewMode}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("empty.no_products")}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory
              ? t("empty.adjust_filters")
              : t("empty.no_products_desc")}
          </p>
          {!searchTerm && !selectedCategory && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                ✍️ {t("empty.add_manually")}
              </button>
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                🎤 {t("empty.add_voice")}
              </button>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                📷 {t("empty.add_photo")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Insights */}
      {stats.totalProducts > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📈</span>
              {t("insights.top_products")}
            </h3>
            <div className="space-y-3">
              {stats.topProducts.slice(0, 3).map((product: any) => (
                <div key={product._id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      ₹{(product.price * product.stockLevel).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {product.stockLevel} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🏷️</span>
              {t("insights.categories")}
            </h3>
            <div className="space-y-2">
              {categories.slice(0, 5).map((category) => {
                const categoryProducts = (products as any[]).filter(p => p.category === category);
                const percentage = (categoryProducts.length / (products as any[]).length) * 100;
                
                return (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {categoryProducts.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="bg-gray-200 rounded-lg h-32"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-gray-200 rounded"></div>
          <div className="w-32 h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
