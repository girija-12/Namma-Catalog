import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get notifications for user
export const list = query({
  args: {
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    if (args.unreadOnly) {
      return notifications.filter(n => !n.read);
    }

    return notifications;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or unauthorized");
    }

    await ctx.db.patch(args.id, { read: true });
    return args.id;
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, { read: true });
    }

    return notifications.length;
  },
});
