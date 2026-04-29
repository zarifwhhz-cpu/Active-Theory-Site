import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { useContent, CONTENT_QUERY_KEY } from "@/hooks/use-content";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type Field = {
  key: string;
  label: string;
  hint?: string;
  multiline?: boolean;
  html?: boolean;
};

type Group = { title: string; fields: Field[] };

const GROUPS: Group[] = [
  {
    title: "Brand & Navigation",
    fields: [
      { key: "brand_short", label: "Brand monogram (navbar)", hint: "Shown top-left, e.g. AT" },
      { key: "brand_full", label: "Full brand name (footer)" },
      { key: "nav_link_work", label: "Nav: Work label" },
      { key: "nav_link_about", label: "Nav: About label" },
      { key: "nav_link_contact", label: "Nav: Contact label" },
    ],
  },
  {
    title: "Hero",
    fields: [
      { key: "hero_line1", label: "Headline line 1" },
      { key: "hero_line2", label: "Headline line 2" },
      { key: "hero_subtitle", label: "Subtitle paragraph", multiline: true },
    ],
  },
  {
    title: "About",
    fields: [
      {
        key: "about_paragraph",
        label: "Paragraph (HTML allowed: <strong>...</strong>)",
        multiline: true,
        html: true,
      },
      { key: "about_button", label: "Button text" },
    ],
  },
  {
    title: "Section Titles",
    fields: [
      { key: "works_eyebrow", label: "Works eyebrow number" },
      { key: "works_title", label: "Works section title" },
      { key: "services_eyebrow", label: "Services eyebrow number" },
      { key: "services_title", label: "Services section title" },
    ],
  },
  {
    title: "Contact & Footer",
    fields: [
      { key: "contact_line1", label: "Contact: line 1" },
      { key: "contact_line2", label: "Contact: line 2" },
      { key: "contact_email", label: "Contact email" },
      { key: "footer_locations", label: "Footer locations" },
    ],
  },
];

export default function AdminSettings() {
  const { data, isLoading } = useContent();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.settings) setValues(data.settings);
  }, [data?.settings]);

  const save = useMutation({
    mutationFn: (rows: { key: string; value: string }[]) =>
      api.put<{ ok: true; count: number }>("/admin/settings", { settings: rows }),
    onSuccess: (res) => {
      toast({ title: "Saved", description: `${res.count} field(s) updated.` });
      qc.invalidateQueries({ queryKey: CONTENT_QUERY_KEY });
    },
    onError: (err) => {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    },
  });

  function onSave() {
    const allKeys = GROUPS.flatMap((g) => g.fields.map((f) => f.key));
    const rows = allKeys
      .map((key) => ({ key, value: values[key] ?? "" }))
      .filter((r) => r.value.length > 0);
    save.mutate(rows);
  }

  if (isLoading) {
    return (
      <AdminLayout title="Site Copy">
        <Loader2 className="w-6 h-6 animate-spin" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Site Copy">
      <div className="space-y-10 max-w-3xl">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h2 className="text-xs uppercase tracking-widest text-white/50 mb-4">{g.title}</h2>
            <div className="space-y-5 border border-white/10 bg-[#0a0a0a] p-6">
              {g.fields.map((f) => (
                <div key={f.key}>
                  <Label htmlFor={f.key} className="text-xs uppercase tracking-widest text-white/70">
                    {f.label}
                  </Label>
                  {f.multiline ? (
                    <Textarea
                      id={f.key}
                      rows={f.html ? 5 : 3}
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="mt-2 bg-black border-white/20 text-white font-mono text-sm"
                    />
                  ) : (
                    <Input
                      id={f.key}
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="mt-2 bg-black border-white/20 text-white"
                    />
                  )}
                  {f.hint && <p className="text-xs text-white/40 mt-1">{f.hint}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="sticky bottom-4 flex justify-end">
          <Button
            onClick={onSave}
            disabled={save.isPending}
            className="bg-white text-black hover:bg-white/80 uppercase tracking-widest"
          >
            {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save All Changes"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
