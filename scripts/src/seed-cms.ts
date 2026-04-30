import { db, siteSettingsTable, projectsTable, servicesTable, awardsTable, socialLinksTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const SETTINGS: Record<string, string> = {
  brand_short: "TSA",
  brand_full: "The Solver Agency",
  hero_line1: "WE BLEND STORY,",
  hero_line2: "ART & TECHNOLOGY",
  hero_subtitle:
    "An independent creative studio focused on high-end interactive experiences, immersive brand identities, and digital product design.",
  about_paragraph:
    "Founded in 2012, we are an independent digital production studio. We partner with brands and agencies to craft <strong>unforgettable interactive experiences</strong> that live at the intersection of design and emerging technology.",
  about_button: "Learn More About Us",
  works_eyebrow: "01",
  works_title: "Selected Works",
  services_eyebrow: "02",
  services_title: "Capabilities",
  contact_line1: "Let's",
  contact_line2: "Talk",
  contact_email: "hello@activetheory.net",
  footer_locations: "Los Angeles • Amsterdam",
  nav_link_work: "Work",
  nav_link_about: "About",
  nav_link_contact: "Contact",
};

const PROJECTS = [
  { title: "Quantum Dimensions", category: "Interactive Web", year: "2024", accentColor: "bg-blue-600", imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80", sortOrder: 0 },
  { title: "Neural Synthesis", category: "Motion & 3D", year: "2023", accentColor: "bg-rose-600", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", sortOrder: 1 },
  { title: "Void Architecture", category: "Brand Identity", year: "2023", accentColor: "bg-emerald-600", imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80", sortOrder: 2 },
  { title: "Echo Systems", category: "Immersive Campaign", year: "2024", accentColor: "bg-amber-500", imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&q=80", sortOrder: 3 },
];

const SERVICES = [
  "Web Experiences",
  "Brand Identity",
  "Interactive Campaigns",
  "Motion & 3D Design",
  "Spatial Computing",
];

const AWARDS = [
  "Awwwards Site of the Month",
  "FWA of the Day",
  "Webby Awards",
  "Cannes Lions",
  "D&AD",
  "One Show",
];

const SOCIAL_LINKS = [
  { label: "Twitter", url: "https://twitter.com" },
  { label: "Instagram", url: "https://instagram.com" },
  { label: "LinkedIn", url: "https://linkedin.com" },
];

async function main() {
  console.log("Seeding CMS data...");

  const existingSettings = await db.select().from(siteSettingsTable);
  if (existingSettings.length === 0) {
    await db.insert(siteSettingsTable).values(
      Object.entries(SETTINGS).map(([key, value]) => ({ key, value })),
    );
    console.log(`  inserted ${Object.keys(SETTINGS).length} settings`);
  } else {
    console.log(`  settings already populated (${existingSettings.length}), skipping`);
  }

  const existingProjects = await db.select().from(projectsTable);
  if (existingProjects.length === 0) {
    await db.insert(projectsTable).values(PROJECTS);
    console.log(`  inserted ${PROJECTS.length} projects`);
  } else {
    console.log(`  projects already populated (${existingProjects.length}), skipping`);
  }

  const existingServices = await db.select().from(servicesTable);
  if (existingServices.length === 0) {
    await db.insert(servicesTable).values(
      SERVICES.map((name, i) => ({ name, sortOrder: i })),
    );
    console.log(`  inserted ${SERVICES.length} services`);
  } else {
    console.log(`  services already populated (${existingServices.length}), skipping`);
  }

  const existingAwards = await db.select().from(awardsTable);
  if (existingAwards.length === 0) {
    await db.insert(awardsTable).values(
      AWARDS.map((name, i) => ({ name, sortOrder: i })),
    );
    console.log(`  inserted ${AWARDS.length} awards`);
  } else {
    console.log(`  awards already populated (${existingAwards.length}), skipping`);
  }

  const existingLinks = await db.select().from(socialLinksTable);
  if (existingLinks.length === 0) {
    await db.insert(socialLinksTable).values(
      SOCIAL_LINKS.map((s, i) => ({ ...s, sortOrder: i })),
    );
    console.log(`  inserted ${SOCIAL_LINKS.length} social links`);
  } else {
    console.log(`  social links already populated (${existingLinks.length}), skipping`);
  }

  // verify
  const totals = await Promise.all([
    db.execute(sql`SELECT COUNT(*)::int AS n FROM site_settings`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM projects`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM services`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM awards`),
    db.execute(sql`SELECT COUNT(*)::int AS n FROM social_links`),
  ]);
  console.log("\nFinal row counts:");
  console.log("  site_settings:", totals[0].rows[0]?.n);
  console.log("  projects:     ", totals[1].rows[0]?.n);
  console.log("  services:     ", totals[2].rows[0]?.n);
  console.log("  awards:       ", totals[3].rows[0]?.n);
  console.log("  social_links: ", totals[4].rows[0]?.n);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
