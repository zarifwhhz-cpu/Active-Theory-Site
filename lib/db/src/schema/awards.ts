import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { z } from "zod";

export const awardsTable = pgTable("awards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertAwardSchema = z.object({
  name: z.string().min(1).max(200),
  sortOrder: z.number().int().default(0),
});

export const updateAwardSchema = insertAwardSchema.partial();

export type Award = typeof awardsTable.$inferSelect;
export type InsertAward = z.infer<typeof insertAwardSchema>;
export type UpdateAward = z.infer<typeof updateAwardSchema>;
