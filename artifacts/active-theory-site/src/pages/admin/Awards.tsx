import { AdminLayout } from "./AdminLayout";
import { ListEditor, type FieldDef } from "./ListEditor";

type AwardItem = { id: number; name: string; sortOrder: number };

const FIELDS: FieldDef<AwardItem>[] = [
  { key: "name", label: "Award name" },
  { key: "sortOrder", label: "Sort order", type: "number" },
];

export default function AdminAwards() {
  return (
    <AdminLayout title="Awards">
      <ListEditor
        resource="awards"
        fields={FIELDS}
        defaults={{ name: "", sortOrder: 0 }}
        rowSummary={(a) => <div className="text-white truncate font-medium">{a.name}</div>}
      />
    </AdminLayout>
  );
}
