import { pgTable, serial, text, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usageTracking = pgTable("usage_tracking", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  ipAddress: text("ip_address"),
  date: date("date").notNull(),
  count: integer("count").notNull().default(0),
});

export const insertUsageTrackingSchema = createInsertSchema(usageTracking).omit({ id: true });
export type InsertUsageTracking = z.infer<typeof insertUsageTrackingSchema>;
export type UsageTracking = typeof usageTracking.$inferSelect;
