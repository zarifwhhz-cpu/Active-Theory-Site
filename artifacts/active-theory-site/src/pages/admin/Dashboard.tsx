import { Link } from "wouter";
import { AdminLayout } from "./AdminLayout";
import { useContent } from "@/hooks/use-content";
import { Card } from "@/components/ui/card";
import { ArrowRight, FileText, Folder, Award, Share2, Sparkles } from "lucide-react";

const TILES = [
  { href: "/admin/settings", label: "Site Copy", description: "Hero, about, contact and footer text", icon: FileText },
  { href: "/admin/projects", label: "Projects", description: "Featured work in the grid", icon: Folder },
  { href: "/admin/services", label: "Services", description: "Capabilities list", icon: Sparkles },
  { href: "/admin/awards", label: "Awards", description: "Marquee items", icon: Award },
  { href: "/admin/social-links", label: "Social Links", description: "Footer link buttons", icon: Share2 },
];

export default function AdminDashboard() {
  const { data } = useContent();
  const counts = {
    settings: data ? Object.keys(data.settings).length : 0,
    projects: data?.projects.length ?? 0,
    services: data?.services.length ?? 0,
    awards: data?.awards.length ?? 0,
    social: data?.socialLinks.length ?? 0,
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        <Stat label="Copy keys" value={counts.settings} />
        <Stat label="Projects" value={counts.projects} />
        <Stat label="Services" value={counts.services} />
        <Stat label="Awards" value={counts.awards} />
        <Stat label="Social Links" value={counts.social} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TILES.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.href} href={t.href}>
              <Card className="bg-[#0a0a0a] border-white/10 text-white p-6 hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <Icon className="w-6 h-6 text-white/60 mb-3" />
                    <div className="text-lg font-bold uppercase tracking-tight">{t.label}</div>
                    <div className="text-sm text-white/50 mt-1">{t.description}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </AdminLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-white/10 bg-[#0a0a0a] p-4">
      <div className="text-3xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-white/50 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}
