import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { z } from "zod";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  year: text("year").notNull(),
  accentColor: text("accent_color").notNull(),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertProjectSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  year: z.string().min(1).max(20),
  accentColor: z.string().min(1).max(64),
  imageUrl: z.string().url().max(1000),
  sortOrder: z.number().int().default(0),
});

export const updateProjectSchema = insertProjectSchema.partial();

export type Project = typeof projectsTable.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
