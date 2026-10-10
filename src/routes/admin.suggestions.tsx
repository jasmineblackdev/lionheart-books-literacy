import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AUDIENCES, CATEGORIES, STATUSES, labelOf } from "@/lib/suggestions";
import { listSuggestions, updateSuggestionStatus } from "@/lib/suggestions.functions";

export const Route = createFileRoute("/admin/suggestions")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Suggestions review | J. B. Lionheart" },
      { name: "description", content: "Private publisher review page." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const STOP = new Set("a an and the of for to in on with about that this is are be book books kids kid i we my our it more like would love".split(" "));

function AdminPage() {
  const list = useServerFn(listSuggestions);
  const update = useServerFn(updateSuggestionStatus);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["suggestions"], queryFn: () => list() });
  const [f, setF] = useState({ search: "", category: "", audience: "", status: "", from: "" });
  const [saving, setSaving] = useState<string | null>(null);

  const rows = q.data?.state === "ok" ? q.data.rows : [];
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!f.category || r.category === f.category) &&
          (!f.audience || r.intended_audience === f.audience) &&
          (!f.status || r.status === f.status) &&
          (!f.from || r.created_at >= f.from) &&
          (!f.search || `${r.idea ?? ""} ${r.email ?? ""}`.toLowerCase().includes(f.search.toLowerCase())),
      ),
    [rows, f],
  );
  const themes = useMemo(() => {
    const c = new Map<string, number>();
    for (const r of filtered)
      for (const w of new Set((r.idea ?? "").toLowerCase().match(/[a-z]{3,}/g) ?? []))
        if (!STOP.has(w)) c.set(w, (c.get(w) ?? 0) + 1);
    return [...c].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 15);
  }, [filtered]);

  if (q.isLoading) return <p className="p-10 text-center">Loading…</p>;
  if (q.isError) return <p role="alert" className="p-10 text-center text-destructive">Couldn't load suggestions. Try refreshing.</p>;
  if (q.data?.state === "signed_out")
    return <Msg title="Sign in required">Open this page while signed in to your Lovable account.</Msg>;
  if (q.data?.state === "not_admin")
    return (
      <Msg title="Not authorized">
        This account isn't on the publisher list. Account ID: <code className="break-all">{q.data.userId}</code>
      </Msg>
    );

  async function setStatus(id: string, status: string) {
    setSaving(id);
    try {
      await update({ data: { id, status: status as never } });
      await qc.invalidateQueries({ queryKey: ["suggestions"] });
    } catch {
      alert("Couldn't update the status. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  const sel = "rounded-xl border border-input bg-card px-3 py-2";
  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-4xl font-bold">Book suggestions</h1>
      <p className="mt-1 text-muted-foreground">{rows.length} total · {filtered.length} shown · private</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input aria-label="Search ideas" placeholder="Search ideas…" className={sel} value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
        {([
          ["category", "All categories", CATEGORIES],
          ["audience", "All audiences", AUDIENCES],
          ["status", "All statuses", STATUSES],
        ] as const).map(([k, l, opts]) => (
          <select key={k} aria-label={l} className={sel} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })}>
            <option value="">{l}</option>
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        <input type="date" aria-label="Submitted since" className={sel} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card-soft p-5">
          <h2 className="text-xl font-semibold">By category</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {CATEGORIES.map((c) => <li key={c.value}>{c.label}: <strong>{filtered.filter((r) => r.category === c.value).length}</strong></li>)}
          </ul>
        </div>
        <div className="card-soft p-5">
          <h2 className="text-xl font-semibold">Recurring themes</h2>
          {themes.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {themes.map(([w, n]) => (
                <li key={w}><button className="rounded-full bg-secondary px-3 py-1 text-sm" onClick={() => setF({ ...f, search: w })}>{w} · {n}</button></li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-muted-foreground">Words that show up in 2+ ideas will appear here.</p>}
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {filtered.map((r) => (
          <li key={r.id} className="card-soft grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString()} · {labelOf(CATEGORIES, r.category)} · {labelOf(AUDIENCES, r.intended_audience)}
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words">{r.idea || <em className="text-muted-foreground">No idea text</em>}</p>
              {r.email && <p className="mt-1 text-sm">{r.email} {r.marketing_consent ? "· wants release updates" : "· no marketing consent"}</p>}
            </div>
            <select aria-label="Status" className={sel} value={r.status} disabled={saving === r.id} onChange={(e) => setStatus(r.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </li>
        ))}
        {!filtered.length && <li className="text-center text-muted-foreground">No suggestions match.</li>}
      </ul>
    </section>
  );
}

function Msg({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{children}</p>
    </section>
  );
}
