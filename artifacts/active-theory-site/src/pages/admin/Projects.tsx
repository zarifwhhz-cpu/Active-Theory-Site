import { AdminLayout } from "./AdminLayout";
import { ListEditor, type FieldDef } from "./ListEditor";

type ProjectItem = {
  id: number;
  title: string;
  category: string;
  year: string;
  accentColor: string;
  imageUrl: string;
  sortOrder: number;
};

const FIELDS: FieldDef<ProjectItem>[] = [
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "year", label: "Year" },
  {
    key: "accentColor",
    label: "Accent color (Tailwind class)",
    placeholder: "bg-blue-600",
    hint: "e.g. bg-rose-600, bg-emerald-600, bg-amber-500",
  },
  { key: "imageUrl", label: "Image URL", type: "url", placeholder: "https://..." },
  { key: "sortOrder", label: "Sort order", type: "number" },
];

export default function AdminProjects() {
  return (
    <AdminLayout title="Projects">
      <ListEditor
        resource="projects"
        fields={FIELDS}
        defaults={{
          title: "",
          category: "",
          year: new Date().getFullYear().toString(),
          accentColor: "bg-blue-600",
          imageUrl: "",
          sortOrder: 0,
        }}
        rowSummary={(p) => (
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-12 h-12 shrink-0 ${p.accentColor} relative overflow-hidden`}>
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-70"
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-white font-bold truncate">{p.title}</div>
              <div className="text-xs text-white/50 uppercase tracking-widest">
                {p.category} · {p.year}
              </div>
            </div>
          </div>
        )}
      />
    </AdminLayout>
  );
}
