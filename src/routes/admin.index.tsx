import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  AdminError,
  INQUIRY_STATUSES,
  gmailReplyUrl,
  loadAdminData,
  setAdminStatus,
  type InquiryRow,
  type SuggestionRow,
} from "@/lib/admin-api";
import { bookForSale, formatCents, summarize, type ClickData, type SaleRow } from "@/lib/sales";
import { AUDIENCES, CATEGORIES, STATUSES, labelOf } from "@/lib/suggestions";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin | J. B. Lionheart" },
      { name: "description", content: "Private publisher dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const sel = "rounded-xl border border-input bg-card px-3 py-2";

function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <p className="p-10 text-center">Loading…</p>;
  if (!session) return <SignIn />;
  return <Dashboard email={session.user.email ?? ""} />;
}

function SignIn() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
    });
    setBusy(false);
    if (error) setError("That email and password didn't match. Please try again.");
  }

  const field = "mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-base";
  return (
    <section className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-4xl font-bold">Admin sign in</h1>
      <p className="mt-2 text-muted-foreground">Private dashboard for J. B. Lionheart Books.</p>
      <form onSubmit={onSubmit} className="card-soft mt-6 grid gap-4 p-6">
        {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
        <label className="font-semibold">
          Email
          <input name="email" type="email" autoComplete="username" required className={field} />
        </label>
        <label className="font-semibold">
          Password
          <input name="password" type="password" autoComplete="current-password" required className={field} />
        </label>
        <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}

function Dashboard({ email }: { email: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin"], queryFn: loadAdminData, retry: false });
  const [tab, setTab] = useState<"inquiries" | "suggestions" | "sales">("inquiries");
  const [saving, setSaving] = useState<string | null>(null);
  const signOut = () => supabase.auth.signOut();

  async function setStatus(kind: "suggestion" | "class_set", id: string, status: string) {
    setSaving(id);
    try {
      await setAdminStatus(kind, id, status);
      await qc.invalidateQueries({ queryKey: ["admin"] });
    } catch {
      alert("Couldn't update the status. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  if (q.isLoading) return <p className="p-10 text-center">Loading…</p>;
  if (q.error instanceof AdminError && q.error.code === "not_admin")
    return (
      <Msg title="Not authorized" onSignOut={signOut}>
        {email} isn't on the admin list. Account ID: <code className="break-all">{q.error.userId}</code>
      </Msg>
    );
  if (q.error instanceof AdminError && q.error.code === "signed_out")
    return <Msg title="Signed out" onSignOut={signOut}>Your session ended. Please sign in again.</Msg>;
  if (q.isError || !q.data)
    return <Msg title="Couldn't load the dashboard" onSignOut={signOut}>Try refreshing the page.</Msg>;

  // sales/clicks default to empty in case the admin function predates them.
  const { inquiries, suggestions, sales = [], clicks = { recent: [], totals: {} } } = q.data;
  const newCount = (rows: { status: string }[]) => rows.filter((r) => r.status === "new").length;
  const tabBtn = (t: typeof tab, label: string, n: number) => (
    <button
      role="tab"
      aria-selected={tab === t}
      onClick={() => setTab(t)}
      className={`rounded-full px-5 py-2 font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
    >
      {label} {n > 0 && <span className="ml-1 rounded-full bg-accent px-2 text-sm text-accent-foreground">{n} new</span>}
    </button>
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {email} · <button className="underline" onClick={signOut}>Sign out</button>
        </p>
      </div>
      <div role="tablist" className="mt-6 flex flex-wrap gap-2">
        {tabBtn("inquiries", "Class-set inquiries", newCount(inquiries))}
        {tabBtn("suggestions", "Book suggestions", newCount(suggestions))}
        {tabBtn("sales", "Sales", 0)}
      </div>
      {tab === "inquiries" && <Inquiries rows={inquiries} saving={saving} onStatus={(id, s) => setStatus("class_set", id, s)} />}
      {tab === "suggestions" && <Suggestions rows={suggestions} saving={saving} onStatus={(id, s) => setStatus("suggestion", id, s)} />}
      {tab === "sales" && <Sales sales={sales} clicks={clicks} />}
    </section>
  );
}

function Inquiries({ rows, saving, onStatus }: { rows: InquiryRow[]; saving: string | null; onStatus: (id: string, s: string) => void }) {
  const [status, setStatusFilter] = useState("");
  const shown = rows.filter((r) => !status || r.status === status);
  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select aria-label="Filter by status" className={sel} value={status} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {INQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <p className="text-muted-foreground">{rows.length} total · {shown.length} shown</p>
      </div>
      <ul className="mt-6 space-y-3">
        {shown.map((r) => (
          <li key={r.id} className="card-soft grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
              <p className="mt-1 font-display text-xl font-semibold">{r.org} · {r.quantity} books</p>
              <p className="mt-1">{r.name} · <a href={`mailto:${r.email}`} className="underline">{r.email}</a></p>
              {r.message && <p className="mt-2 whitespace-pre-wrap break-words">{r.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <a href={gmailReplyUrl(r)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Reply in Gmail</a>
              <select aria-label="Status" className={sel} value={r.status} disabled={saving === r.id} onChange={(e) => onStatus(r.id, e.target.value)}>
                {INQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </li>
        ))}
        {!shown.length && <li className="text-center text-muted-foreground">No inquiries yet.</li>}
      </ul>
    </>
  );
}

function Sales({ sales, clicks }: { sales: SaleRow[]; clicks: ClickData }) {
  const summary = summarize(sales, clicks);
  const recent = sales.slice(0, 50);
  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {summary.map((s) => (
          <div key={s.book.slug} className="card-soft p-5">
            <h2 className="text-xl font-semibold">{s.book.short}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2"><dt>Digital PDFs sold (Payhip)</dt><dd className="font-semibold">{s.digitalUnits}</dd></div>
              <div className="flex justify-between gap-2"><dt>Digital revenue</dt><dd className="font-semibold">{formatCents(s.digitalCents)}</dd></div>
              <div className="flex justify-between gap-2"><dt>Paperbacks sold (Amazon)</dt><dd className="font-semibold">{s.paperbackUnits}</dd></div>
              <div className="flex justify-between gap-2"><dt>"Buy on Amazon" clicks</dt><dd className="font-semibold">{s.clicksTotal} <span className="font-normal text-muted-foreground">({s.clicks30d} in 30 days)</span></dd></div>
            </dl>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Digital sales arrive automatically from Payhip. Amazon paperback sales come from KDP reports you upload. Clicks show interest, not sales.
      </p>

      <h2 className="mt-8 text-2xl font-semibold">Recent sales</h2>
      <ul className="mt-3 space-y-2">
        {recent.map((r) => (
          <li key={r.id} className="card-soft flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
            <span>
              {new Date(r.sold_at).toLocaleDateString()} · {bookForSale(r)?.short ?? r.product_name ?? "Unknown product"} · {r.format ?? (r.source === "payhip" ? "Digital PDF" : "Paperback")}
              {r.marketplace ? ` · ${r.marketplace}` : ""}
            </span>
            <span className="font-semibold">
              {r.kind === "refund" ? "Refund · " : ""}{r.quantity} × {r.source === "payhip" ? "Payhip" : "Amazon"}
              {r.amount_cents != null ? ` · ${formatCents(r.amount_cents, r.currency ?? "USD")}` : ""}
            </span>
          </li>
        ))}
        {!recent.length && <li className="text-center text-muted-foreground">No sales recorded yet.</li>}
      </ul>
    </>
  );
}

const STOP = new Set("a an and the of for to in on with about that this is are be book books kids kid i we my our it more like would love".split(" "));

function Suggestions({ rows, saving, onStatus }: { rows: SuggestionRow[]; saving: string | null; onStatus: (id: string, s: string) => void }) {
  const [f, setF] = useState({ search: "", category: "", audience: "", status: "", from: "" });
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

  return (
    <>
      <p className="mt-6 text-muted-foreground">{rows.length} total · {filtered.length} shown</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
            <select aria-label="Status" className={sel} value={r.status} disabled={saving === r.id} onChange={(e) => onStatus(r.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </li>
        ))}
        {!filtered.length && <li className="text-center text-muted-foreground">No suggestions match.</li>}
      </ul>
    </>
  );
}

function Msg({ title, children, onSignOut }: { title: string; children: ReactNode; onSignOut: () => void }) {
  return (
    <section className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{children}</p>
      <button className="btn btn-outline mt-6" onClick={onSignOut}>Sign out</button>
    </section>
  );
}
