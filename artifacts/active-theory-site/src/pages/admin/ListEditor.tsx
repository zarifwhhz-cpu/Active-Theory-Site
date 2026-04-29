import { type ReactNode, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CONTENT_QUERY_KEY } from "@/hooks/use-content";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

export type ListItem = { id: number; sortOrder: number } & Record<string, unknown>;

export type FieldDef<T extends ListItem> = {
  key: keyof T & string;
  label: string;
  type?: "text" | "url" | "number";
  placeholder?: string;
  hint?: string;
};

interface ListEditorProps<T extends ListItem> {
  resource: string; // path segment, e.g. "projects"
  fields: FieldDef<T>[];
  defaults: Omit<T, "id">;
  rowSummary?: (item: T) => ReactNode;
}

export function ListEditor<T extends ListItem>({
  resource,
  fields,
  defaults,
  rowSummary,
}: ListEditorProps<T>) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const queryKey = ["admin", resource] as const;

  const list = useQuery({
    queryKey,
    queryFn: () => api.get<T[]>(`/admin/${resource}`),
  });

  const create = useMutation({
    mutationFn: (data: Omit<T, "id">) => api.post<T>(`/admin/${resource}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      toast({ title: "Added" });
    },
    onError: (err) => toast({ title: "Failed to add", description: errMsg(err) }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<T> }) =>
      api.patch<T>(`/admin/${resource}/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      toast({ title: "Saved" });
    },
    onError: (err) => toast({ title: "Failed to save", description: errMsg(err) }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete<{ ok: true }>(`/admin/${resource}/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
      toast({ title: "Deleted" });
    },
    onError: (err) => toast({ title: "Failed to delete", description: errMsg(err) }),
  });

  if (list.isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;
  if (list.error) return <div className="text-red-400">Failed to load.</div>;

  const items = list.data ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      <NewItemForm
        fields={fields}
        defaults={defaults}
        nextSortOrder={
          items.length > 0
            ? Math.max(...items.map((i) => i.sortOrder ?? 0)) + 1
            : 0
        }
        onSubmit={(data) => create.mutate(data)}
        submitting={create.isPending}
      />

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-sm text-white/40 uppercase tracking-widest border border-dashed border-white/10 p-8 text-center">
            No items yet. Add one above.
          </div>
        )}
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            fields={fields}
            rowSummary={rowSummary}
            onSave={(data) => update.mutate({ id: item.id, data })}
            onDelete={() => {
              if (confirm("Delete this item?")) remove.mutate(item.id);
            }}
            saving={update.isPending}
            deleting={remove.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

function NewItemForm<T extends ListItem>({
  fields,
  defaults,
  nextSortOrder,
  onSubmit,
  submitting,
}: {
  fields: FieldDef<T>[];
  defaults: Omit<T, "id">;
  nextSortOrder: number;
  onSubmit: (data: Omit<T, "id">) => void;
  submitting: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>({
    ...(defaults as Record<string, unknown>),
    sortOrder: nextSortOrder,
  });

  function reset() {
    setDraft({ ...(defaults as Record<string, unknown>), sortOrder: nextSortOrder });
  }

  if (!open) {
    return (
      <Button
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="bg-white text-black hover:bg-white/80 uppercase tracking-widest"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New
      </Button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft as Omit<T, "id">);
        setOpen(false);
        reset();
      }}
      className="border border-white/20 bg-[#0a0a0a] p-6 space-y-4"
    >
      <div className="text-xs uppercase tracking-widest text-white/60">New Item</div>
      <FieldGrid fields={fields} values={draft} onChange={setDraft} />
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-white text-black hover:bg-white/80 uppercase tracking-widest"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
        </Button>
      </div>
    </form>
  );
}

function ItemRow<T extends ListItem>({
  item,
  fields,
  rowSummary,
  onSave,
  onDelete,
  saving,
  deleting,
}: {
  item: T;
  fields: FieldDef<T>[];
  rowSummary?: (item: T) => ReactNode;
  onSave: (data: Partial<T>) => void;
  onDelete: () => void;
  saving: boolean;
  deleting: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>(item);

  function startEdit() {
    setDraft(item);
    setEditing(true);
  }

  if (!editing) {
    return (
      <div className="border border-white/10 bg-[#0a0a0a] p-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {rowSummary ? rowSummary(item) : (
            <div className="text-white truncate">{String(item[fields[0]?.key as string] ?? "")}</div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={startEdit}
            className="border-white/20 text-white hover:bg-white hover:text-black"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={deleting}
            className="border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft as Partial<T>);
        setEditing(false);
      }}
      className="border border-white/30 bg-[#0a0a0a] p-6 space-y-4"
    >
      <FieldGrid fields={fields} values={draft} onChange={setDraft} />
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing(false)}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-white text-black hover:bg-white/80 uppercase tracking-widest"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function FieldGrid<T extends ListItem>({
  fields,
  values,
  onChange,
}: {
  fields: FieldDef<T>[];
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.key} className={fields.length % 2 === 1 && f === fields[fields.length - 1] ? "md:col-span-2" : undefined}>
          <label className="text-xs uppercase tracking-widest text-white/60 block mb-1">
            {f.label}
          </label>
          <input
            type={f.type ?? "text"}
            value={String(values[f.key] ?? "")}
            placeholder={f.placeholder}
            onChange={(e) =>
              onChange({
                ...values,
                [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
              })
            }
            className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
          />
          {f.hint && <p className="text-xs text-white/40 mt-1">{f.hint}</p>}
        </div>
      ))}
    </div>
  );
}
