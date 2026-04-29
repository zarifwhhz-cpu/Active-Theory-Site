import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { z } from "zod";

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertServiceSchema = z.object({
  name: z.string().min(1).max(200),
  sortOrder: z.number().int().default(0),
});

export const updateServiceSchema = insertServiceSchema.partial();

export type Service = typeof servicesTable.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type UpdateService = z.infer<typeof updateServiceSchema>;
