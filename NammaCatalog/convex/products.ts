import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all products for the authenticated user
export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let query = ctx.db.query("products").withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.search) {
      const searchResults = await ctx.db
        .query("products")
        .withSearchIndex("search_products", (q) =>
          q.search("name", args.search!).eq("userId", userId).eq("isActive", args.activeOnly ?? true)
        )
        .collect();
      return searchResults;
    }

    const products = await query.collect();
    
    const filteredProducts = products.filter(p => {
      if (args.category && p.category !== args.category) return false;
      if (args.activeOnly !== undefined && p.isActive !== args.activeOnly) return false;
      return true;
    });

    return await Promise.all(
      filteredProducts.map(async (product) => ({
        ...product,
        imageUrl: product.imageId ? await ctx.storage.getUrl(product.imageId) : null,
      }))
    );
  },
});

// Get dashboard statistics
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const activeProducts = products.filter(p => p.isActive);
    const lowStockProducts = products.filter(p => p.stockLevel <= p.minStockLevel);
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockLevel), 0);
    
    const categories = [...new Set(products.map(p => p.category))];
    const topProducts = products
      .sort((a, b) => (b.price * b.stockLevel) - (a.price * a.stockLevel))
      .slice(0, 5);

    return {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      lowStockCount: lowStockProducts.length,
      totalValue,
      categories: categories.length,
      topProducts,
      lowStockProducts,
    };
  },
});

// Create a new product
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    stockLevel: v.number(),
    minStockLevel: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    language: v.optional(v.string()),
    aiGenerated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate SKU
    const existingProducts = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const sku = `SKU-${Date.now()}-${existingProducts.length + 1}`;

    const productId = await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      price: args.price,
      category: args.category,
      sku,
      stockLevel: args.stockLevel,
      minStockLevel: args.minStockLevel ?? 5,
      imageId: args.imageId,
      tags: args.tags ?? [],
      isActive: true,
      userId,
      language: args.language ?? "en",
      aiGenerated: args.aiGenerated ?? false,
      lastUpdated: Date.now(),
    });

    // Track analytics
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

// Update product
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    stockLevel: v.optional(v.number()),
    minStockLevel: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== userId) {
      throw new Error("Product not found or unauthorized");
    }

    const updates: any = { lastUpdated: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.price !== undefined) updates.price = args.price;
    if (args.category !== undefined) updates.category = args.category;
    if (args.stockLevel !== undefined) updates.stockLevel = args.stockLevel;
    if (args.minStockLevel !== undefined) updates.minStockLevel = args.minStockLevel;
    if (args.imageId !== undefined) updates.imageId = args.imageId;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);

    // Check for low stock notification
    if (args.stockLevel !== undefined && args.stockLevel <= (args.minStockLevel ?? product.minStockLevel)) {
      await ctx.db.insert("notifications", {
        userId,
        type: "low_stock",
        title: "Low Stock Alert",
        message: `${product.name} is running low on stock (${args.stockLevel} remaining)`,
        productId: args.id,
        read: false,
        priority: "high",
      });
    }

    return args.id;
  },
});

// Delete product
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== userId) {
      throw new Error("Product not found or unauthorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Generate upload URL for product images
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});
