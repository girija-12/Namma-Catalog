import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProductCard } from "./ProductCard";
import { StatsCard } from "./StatsCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";

export function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { t } = useLanguage();
  
  const stats = useQuery(api.products.getDashboardStats);
  const products = useQuery(api.products.list, {
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    activeOnly: true,
  });

  if (stats === undefined || products === undefined) {
    return <DashboardSkeleton />;
  }

  const categories = [...new Set((products as any[]).map(p => p.category))];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t("dashboard.title")}
        </h2>
        <p className="text-gray-600">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Stats Grid */}
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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(products as any[]).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {(products as any[]).length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("empty.no_products")}
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory
              ? t("empty.adjust_filters")
              : t("empty.no_products_desc")}
          </p>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="text-center">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
      </div>
      
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
