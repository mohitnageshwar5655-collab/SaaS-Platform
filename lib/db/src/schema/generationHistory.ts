import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const generationHistory = pgTable("generation_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  toolType: text("tool_type").notNull(),
  prompt: text("prompt").notNull(),
  result: text("result").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGenerationHistorySchema = createInsertSchema(generationHistory).omit({ id: true, createdAt: true });
export type InsertGenerationHistory = z.infer<typeof insertGenerationHistorySchema>;
export type GenerationHistory = typeof generationHistory.$inferSelect;
