import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import {
  db,
  siteSettingsTable,
  projectsTable,
  servicesTable,
  awardsTable,
  socialLinksTable,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/content", async (_req, res) => {
  try {
    const [settings, projects, services, awards, socialLinks] =
      await Promise.all([
        db.select().from(siteSettingsTable),
        db.select().from(projectsTable).orderBy(asc(projectsTable.sortOrder), asc(projectsTable.id)),
        db.select().from(servicesTable).orderBy(asc(servicesTable.sortOrder), asc(servicesTable.id)),
        db.select().from(awardsTable).orderBy(asc(awardsTable.sortOrder), asc(awardsTable.id)),
        db.select().from(socialLinksTable).orderBy(asc(socialLinksTable.sortOrder), asc(socialLinksTable.id)),
      ]);

    const settingsMap: Record<string, string> = {};
    for (const s of settings) settingsMap[s.key] = s.value;

    res.json({
      settings: settingsMap,
      projects,
      services,
      awards,
      socialLinks,
    });
  } catch (err) {
    console.error("GET /content failed", err);
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
