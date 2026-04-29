import { Router, type IRouter } from "express";
import sanitizeHtml from "sanitize-html";
import { db, siteSettingsTable, updateSettingsSchema } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAdmin } from "../../lib/auth";

const router: IRouter = Router();
router.use(requireAdmin);

// Setting keys that are rendered with `dangerouslySetInnerHTML` on the public
// site. Any value written to one of these keys is run through a strict
// allowlist sanitizer so a compromised admin (or a future bug) cannot store
// XSS payloads. All other keys are stored as plain text and HTML-escaped at
// render time by React.
const HTML_ALLOWED_KEYS = new Set(["about_paragraph"]);

function sanitizeValue(key: string, value: string): string {
  if (!HTML_ALLOWED_KEYS.has(key)) return value;
  return sanitizeHtml(value, {
    allowedTags: ["strong", "em", "br"],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}

router.put("/admin/settings", async (req, res) => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
    return;
  }
  try {
    const rows = parsed.data.settings.map((r) => ({
      key: r.key,
      value: sanitizeValue(r.key, r.value),
    }));
    await db
      .insert(siteSettingsTable)
      .values(rows)
      .onConflictDoUpdate({
        target: siteSettingsTable.key,
        set: {
          value: sql`excluded.value`,
          updatedAt: sql`now()`,
        },
      });
    res.json({ ok: true, count: rows.length });
  } catch (err) {
    console.error("PUT /admin/settings failed", err);
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
