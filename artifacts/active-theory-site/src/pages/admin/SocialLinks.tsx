import { AdminLayout } from "./AdminLayout";
import { ListEditor, type FieldDef } from "./ListEditor";

type LinkItem = { id: number; label: string; url: string; sortOrder: number };

const FIELDS: FieldDef<LinkItem>[] = [
  { key: "label", label: "Label", placeholder: "Twitter" },
  { key: "url", label: "URL", type: "url", placeholder: "https://twitter.com/..." },
  { key: "sortOrder", label: "Sort order", type: "number" },
];

export default function AdminSocialLinks() {
  return (
    <AdminLayout title="Social Links">
      <ListEditor
        resource="social-links"
        fields={FIELDS}
        defaults={{ label: "", url: "https://", sortOrder: 0 }}
        rowSummary={(l) => (
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-white font-medium">{l.label}</div>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/40 truncate hover:text-white/70"
            >
              {l.url}
            </a>
          </div>
        )}
      />
    </AdminLayout>
  );
}
