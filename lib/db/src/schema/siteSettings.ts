import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertSiteSettingSchema = z.object({
  key: z.string().min(1).max(64),
  value: z.string().max(4000),
});

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

export const updateSettingsSchema = z.object({
  settings: z.array(insertSiteSettingSchema).min(1),
});
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
