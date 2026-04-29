import type { ReactNode } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/settings", label: "Site Copy" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/awards", label: "Awards" },
  { href: "/admin/social-links", label: "Social Links" },
];

function NavItem({ href, label, exact }: { href: string; label: string; exact?: boolean }) {
  const [matchExact] = useRoute(href);
  const [location] = useLocation();
  const active = exact ? matchExact : location.startsWith(href);
  return (
    <Link
      href={href}
      className={`block px-4 py-3 text-sm uppercase tracking-widest border-l-2 transition-colors ${
        active
          ? "border-white text-white bg-white/5"
          : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );
}

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const { data, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!data?.authenticated) {
    setLocation("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-black text-white flex" style={{ cursor: "auto" }}>
      <aside className="w-64 shrink-0 border-r border-white/10 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="text-2xl font-bold tracking-tighter uppercase">
            Admin
          </Link>
          <div className="text-xs text-white/40 uppercase tracking-widest mt-1">
            Active Theory CMS
          </div>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <Link
            href="/"
            className="text-xs text-white/50 hover:text-white uppercase tracking-widest text-center py-2"
          >
            View Site →
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout.mutate(undefined, { onSuccess: () => setLocation("/admin/login") })}
            disabled={logout.isPending}
            className="border-white/20 text-white hover:bg-white hover:text-black"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="px-8 py-6 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur z-10">
          <h1 className="text-3xl font-bold uppercase tracking-tight">{title}</h1>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
