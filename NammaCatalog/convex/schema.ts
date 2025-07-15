import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    tags: v.array(v.string()),
    imageId: v.optional(v.id("_storage")),
    stockLevel: v.number(),
    lowStockThreshold: v.number(),
    userId: v.id("users"),
    isActive: v.boolean(),
    lastUpdated: v.number(),
    aiGenerated: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_stock_level", ["stockLevel"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["userId", "category", "isActive"],
    }),

  categories: defineTable({
    name: v.string(),
    description: v.string(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  voiceRecordings: defineTable({
    audioId: v.id("_storage"),
    transcription: v.optional(v.string()),
    userId: v.id("users"),
    processed: v.boolean(),
  }).index("by_user", ["userId"]),

  analytics: defineTable({
    userId: v.id("users"),
    event: v.string(),
    data: v.object({
      productId: v.optional(v.id("products")),
      category: v.optional(v.string()),
      method: v.optional(v.string()), // voice, text, image
    }),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
