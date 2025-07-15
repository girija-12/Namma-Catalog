import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let products;
    
    if (args.searchQuery) {
      products = await ctx.db
        .query("products")
        .withSearchIndex("search_products", (q) =>
          q.search("name", args.searchQuery!).eq("userId", userId).eq("isActive", true)
        )
        .collect();
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    }
    
    return Promise.all(
      products
        .filter(p => p.isActive && (!args.category || p.category === args.category))
        .map(async (product) => ({
          ...product,
          imageUrl: product.imageId ? await ctx.storage.getUrl(product.imageId) : null,
          isLowStock: product.stockLevel <= product.lowStockThreshold,
        }))
    );
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== userId) return null;

    return {
      ...product,
      imageUrl: product.imageId ? await ctx.storage.getUrl(product.imageId) : null,
      isLowStock: product.stockLevel <= product.lowStockThreshold,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    tags: v.array(v.string()),
    imageId: v.optional(v.id("_storage")),
    stockLevel: v.number(),
    lowStockThreshold: v.number(),
    aiGenerated: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const productId = await ctx.db.insert("products", {
      ...args,
      userId,
      isActive: true,
      lastUpdated: Date.now(),
    });

    // Log analytics
    await ctx.db.insert("analytics", {
      userId,
      event: "product_created",
      data: {
        productId,
        category: args.category,
        method: args.aiGenerated ? "ai" : "manual",
      },
      timestamp: Date.now(),
    });

    return productId;
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    stockLevel: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const product = await ctx.db.get(id);
    
    if (!product || product.userId !== userId) {
      throw new Error("Product not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      lastUpdated: Date.now(),
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== userId) {
      throw new Error("Product not found");
    }

    await ctx.db.patch(args.id, { isActive: false });
    return args.id;
  },
});

export const getLowStockItems = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return products
      .filter(p => p.isActive && p.stockLevel <= p.lowStockThreshold)
      .map(p => ({
        id: p._id,
        name: p.name,
        stockLevel: p.stockLevel,
        lowStockThreshold: p.lowStockThreshold,
      }));
  },
});

export const getInventoryStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const activeProducts = products.filter(p => p.isActive);
    const lowStockItems = activeProducts.filter(p => p.stockLevel <= p.lowStockThreshold);
    const totalValue = activeProducts.reduce((sum, p) => sum + (p.price * p.stockLevel), 0);
    
    const categoryStats = activeProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProducts: activeProducts.length,
      lowStockCount: lowStockItems.length,
      totalInventoryValue: totalValue,
      categoryBreakdown: categoryStats,
      topCategories: Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
    };
  },
});
