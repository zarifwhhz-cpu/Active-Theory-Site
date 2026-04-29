import { AdminLayout } from "./AdminLayout";
import { ListEditor, type FieldDef } from "./ListEditor";

type ServiceItem = { id: number; name: string; sortOrder: number };

const FIELDS: FieldDef<ServiceItem>[] = [
  { key: "name", label: "Service name" },
  { key: "sortOrder", label: "Sort order", type: "number" },
];

export default function AdminServices() {
  return (
    <AdminLayout title="Services">
      <ListEditor
        resource="services"
        fields={FIELDS}
        defaults={{ name: "", sortOrder: 0 }}
        rowSummary={(s) => <div className="text-white truncate font-medium">{s.name}</div>}
      />
    </AdminLayout>
  );
}
