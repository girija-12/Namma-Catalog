import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    sku: v.string(),
    stockLevel: v.number(),
    minStockLevel: v.number(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    isActive: v.boolean(),
    userId: v.id("users"),
    language: v.optional(v.string()),
    aiGenerated: v.boolean(),
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_sku", ["sku"])
    .index("by_stock_level", ["stockLevel"])
    .index("by_active", ["isActive"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["category", "userId", "isActive"],
    }),

  categories: defineTable({
    name: v.string(),
    description: v.string(),
    userId: v.id("users"),
    productCount: v.number(),
  }).index("by_user", ["userId"]),

  voiceRecordings: defineTable({
    audioId: v.id("_storage"),
    transcription: v.optional(v.string()),
    language: v.string(),
    userId: v.id("users"),
    processed: v.boolean(),
    productId: v.optional(v.id("products")),
  }).index("by_user", ["userId"]),

  analytics: defineTable({
    userId: v.id("users"),
    event: v.string(),
    data: v.object({
      productId: v.optional(v.id("products")),
      category: v.optional(v.string()),
      method: v.optional(v.string()),
      duration: v.optional(v.number()),
    }),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "low_stock", "stale_listing", "system"
    title: v.string(),
    message: v.string(),
    productId: v.optional(v.id("products")),
    read: v.boolean(),
    priority: v.string(), // "high", "medium", "low"
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
