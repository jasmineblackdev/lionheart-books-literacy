import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { INQUIRY_STATUSES, gmailReplyUrl, importSales, updateInquiry, type InquiryRow, type SuggestionRow } from "@/lib/admin-api";
import { bookNames } from "@/lib/class-sets";
import { followUpLabel, isFollowUpDue, todayIso } from "@/lib/follow-ups";
import { parseKdpReport } from "@/lib/kdp";
import { bookForSale, formatCents, summarize, type ClickData, type SaleRow } from "@/lib/sales";
import { readXlsx } from "@/lib/xlsx";
import { AUDIENCES, CATEGORIES, STATUSES, labelOf } from "@/lib/suggestions";

// Panels shown inside the /admin Publisher Studio layout.

export const sel = "rounded-xl border border-input bg-card px-3 py-2";

export function SignIn() {
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
      <a href="/" className="text-sm font-semibold underline-offset-4 hover:underline">← Back to website</a>
      <h1 className="mt-4 text-4xl font-extrabold">Admin sign in</h1>
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

export function Inquiries({ rows, saving, onStatus }: { rows: InquiryRow[]; saving: string | null; onStatus: (id: string, s: string) => void }) {
  const [filter, setFilter] = useState("");
  const today = todayIso();
  const due = rows.filter((r) => isFollowUpDue(r, today));
  const shown =
    filter === "follow_up"
      ? [...due].sort((a, b) => (a.follow_up_on ?? "").localeCompare(b.follow_up_on ?? ""))
      : rows.filter((r) => !filter || r.status === filter);
  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select aria-label="Filter inquiries" className={sel} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {INQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          <option value="follow_up">Follow-ups due ({due.length})</option>
        </select>
        <p className="text-muted-foreground">{rows.length} total · {shown.length} shown</p>
      </div>
      <ul className="mt-6 space-y-3">
        {shown.map((r) => <InquiryCard key={r.id} r={r} today={today} saving={saving === r.id} onStatus={onStatus} />)}
        {!shown.length && <li className="text-center text-muted-foreground">{filter === "follow_up" ? "No follow-ups due." : "No inquiries yet."}</li>}
      </ul>
    </>
  );
}

function InquiryCard({ r, today, saving, onStatus }: { r: InquiryRow; today: string; saving: boolean; onStatus: (id: string, s: string) => void }) {
  const due = isFollowUpDue(r, today);
  return (
    <li className={`card-soft grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] ${due ? "ring-2 ring-accent" : ""}`}>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
        <p className="mt-1 font-display text-xl font-semibold">{r.org} · {r.quantity} books</p>
        <p className="mt-1">{r.name} · <a href={`mailto:${r.email}`} className="underline">{r.email}</a></p>
        {r.books && r.books.length > 0 && <p className="mt-1.5 text-sm"><span className="font-semibold">Books:</span> {bookNames(r.books)}</p>}
        {r.message && <p className="mt-2 whitespace-pre-wrap break-words">{r.message}</p>}
        {r.follow_up_on && (
          <p className={`mt-3 inline-block rounded-full px-3 py-0.5 text-sm font-semibold ${due ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
            {r.status === "done" ? `Follow-up was ${r.follow_up_on}` : followUpLabel(r.follow_up_on, today)}
          </p>
        )}
        <FollowUpEditor r={r} />
      </div>
      <div className="flex flex-col gap-2">
        <a href={gmailReplyUrl(r)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Reply in Gmail</a>
        <select aria-label="Status" className={sel} value={r.status} disabled={saving} onChange={(e) => onStatus(r.id, e.target.value)}>
          {INQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
    </li>
  );
}

/** Private notes and a follow-up date for one school order; only visible on the admin dashboard. */
export function FollowUpEditor({ r }: { r: Pick<InquiryRow, "id" | "notes" | "follow_up_on"> }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(r.notes ?? "");
  const [date, setDate] = useState(r.follow_up_on ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const dirty = notes !== (r.notes ?? "") || date !== (r.follow_up_on ?? "");

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    try {
      await updateInquiry(r.id, notes.trim(), date);
      await qc.invalidateQueries({ queryKey: ["admin"] });
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={save} className="mt-4 grid gap-3 rounded-xl bg-secondary/60 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <label className="text-sm font-semibold sm:col-span-2">
        Notes <span className="font-normal text-muted-foreground">(private: e.g. "Sent quote 10/14, waiting on PO")</span>
        <textarea
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setState("idle"); }}
          rows={2}
          maxLength={5000}
          className="mt-1 w-full rounded-xl border border-input bg-card px-3 py-2 text-base font-normal"
        />
      </label>
      <label className="text-sm font-semibold">
        Follow up on
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setState("idle"); }}
          className="mt-1 block rounded-xl border border-input bg-card px-3 py-2 text-base font-normal"
        />
      </label>
      <div className="flex items-end gap-3">
        <button type="submit" disabled={!dirty || state === "saving"} className="btn btn-primary px-5 py-2 text-base disabled:opacity-50">
          {state === "saving" ? "Saving…" : "Save"}
        </button>
        {state === "saved" && !dirty && <span role="status" className="pb-2 text-sm font-semibold text-success">Saved</span>}
        {state === "error" && <span role="alert" className="pb-2 text-sm font-semibold text-destructive">Couldn't save. Try again.</span>}
      </div>
    </form>
  );
}

export function Sales({ sales, clicks }: { sales: SaleRow[]; clicks: ClickData }) {
  const summary = summarize(sales, clicks);
  const recent = sales.slice(0, 50);
  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {summary.map((s) => (
          <div key={s.book.slug} className="card-soft p-5">
            <h2 className="text-xl font-extrabold">{s.book.short}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2"><dt>Digital PDFs sold (Payhip)</dt><dd className="font-semibold">{s.digitalUnits}</dd></div>
              <div className="flex justify-between gap-2"><dt>Digital revenue</dt><dd className="font-semibold">{formatCents(s.digitalCents)}</dd></div>
              <div className="flex justify-between gap-2"><dt>Paperbacks sold (Amazon)</dt><dd className="font-semibold">{s.paperbackUnits}</dd></div>
              <div className="flex justify-between gap-2"><dt>Amazon royalties (USD)</dt><dd className="font-semibold">{formatCents(s.amazonRoyaltyUsdCents)}</dd></div>
              <div className="flex justify-between gap-2"><dt>"Buy on Amazon" clicks</dt><dd className="font-semibold">{s.clicksTotal} <span className="font-normal text-muted-foreground">({s.clicks30d} in 30 days)</span></dd></div>
            </dl>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Digital sales arrive automatically from Payhip. Amazon paperback sales come from KDP reports you upload. Clicks show interest, not sales.
      </p>

      <KdpUpload />

      <h2 className="mt-8 text-2xl font-extrabold">Recent sales</h2>
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

export function KdpUpload() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const { rows, skipped, foundSheets } = parseKdpReport(await readXlsx(await file.arrayBuffer()));
      if (!foundSheets.length) {
        setMsg({ ok: false, text: "This doesn't look like a KDP Orders report. Download it from KDP Reports → Orders → Download report." });
      } else if (!rows.length) {
        setMsg({ ok: true, text: `No sales in this report${skipped ? ` (${skipped} rows couldn't be read)` : ""}. Nothing to add yet.` });
      } else {
        for (let i = 0; i < rows.length; i += 5000) await importSales(rows.slice(i, i + 5000));
        await qc.invalidateQueries({ queryKey: ["admin"] });
        setMsg({ ok: true, text: `Added ${rows.length} sales rows from the report${skipped ? `; ${skipped} rows couldn't be read` : ""}. Re-uploading the same dates updates them instead of double-counting.` });
      }
    } catch {
      setMsg({ ok: false, text: "Couldn't read that file. Make sure it's the .xlsx report downloaded from KDP." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-soft mt-6 p-5">
      <h2 className="text-xl font-extrabold">Upload a KDP report</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        In KDP, go to Reports → Orders → Download report, then choose the .xlsx file here. Upload a new one whenever you want the paperback numbers updated.
      </p>
      <input
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        aria-label="KDP report file"
        disabled={busy}
        className="mt-3 block text-sm"
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {busy && <p className="mt-2 text-sm">Reading the report…</p>}
      {msg && <p role="status" className={`mt-2 text-sm font-semibold ${msg.ok ? "text-success" : "text-destructive"}`}>{msg.text}</p>}
    </div>
  );
}

const STOP = new Set("a an and the of for to in on with about that this is are be book books kids kid i we my our it more like would love".split(" "));

export function Suggestions({ rows, saving, onStatus }: { rows: SuggestionRow[]; saving: string | null; onStatus: (id: string, s: string) => void }) {
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
          <h2 className="text-xl font-extrabold">By category</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {CATEGORIES.map((c) => <li key={c.value}>{c.label}: <strong>{filtered.filter((r) => r.category === c.value).length}</strong></li>)}
          </ul>
        </div>
        <div className="card-soft p-5">
          <h2 className="text-xl font-extrabold">Recurring themes</h2>
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

export function Msg({ title, children, onSignOut }: { title: string; children: ReactNode; onSignOut: () => void }) {
  return (
    <section className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="mt-3 text-muted-foreground">{children}</p>
      <button className="btn btn-outline mt-6" onClick={onSignOut}>Sign out</button>
    </section>
  );
}
