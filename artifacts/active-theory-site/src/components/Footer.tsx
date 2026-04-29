import { useContent, useSetting } from "@/hooks/use-content";

export function Footer() {
  const { data } = useContent();
  const brand = useSetting("brand_full", "Active Theory");
  const locations = useSetting("footer_locations", "Los Angeles • Amsterdam");
  const links = data?.socialLinks ?? [];

  return (
    <footer className="w-full px-6 py-8 md:px-12 md:py-12 border-t border-white/10 bg-black flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0">
      <div className="flex flex-col gap-2">
        <span className="text-2xl font-bold uppercase tracking-tighter">{brand}</span>
        <span className="text-xs text-white/40 uppercase tracking-widest">
          © {new Date().getFullYear()} All Rights Reserved.
        </span>
      </div>

      <div className="flex gap-8 text-xs font-light tracking-widest uppercase">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hover="true"
            className="hover:text-white/50 transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="text-xs font-light tracking-widest uppercase text-white/40">
        {locations}
      </div>
    </footer>
  );
}
