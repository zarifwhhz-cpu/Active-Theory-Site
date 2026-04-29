import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { z } from "zod";

export const socialLinksTable = pgTable("social_links", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertSocialLinkSchema = z.object({
  label: z.string().min(1).max(100),
  url: z.string().min(1).max(1000),
  sortOrder: z.number().int().default(0),
});

export const updateSocialLinkSchema = insertSocialLinkSchema.partial();

export type SocialLink = typeof socialLinksTable.$inferSelect;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type UpdateSocialLink = z.infer<typeof updateSocialLinkSchema>;
