// Private admin API for the site's /admin dashboard. The caller must send the access
// token of a signed-in Supabase Auth user whose id is in the site_admins table;
// everyone else gets 401/403 and no data. Actions (POST JSON body):
//   { action: "list" }                                   → suggestions, inquiries, sales, Amazon clicks
//   { action: "set_status", kind, id, status }           → update one row's status
//   { action: "import_sales", rows }                     → upsert Amazon (KDP report) sales rows
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const KINDS = {
  suggestion: { table: "book_suggestions", statuses: ["new", "under_consideration", "planned", "declined"] },
  class_set: { table: "class_set_inquiries", statuses: ["new", "replied", "done"] },
} as const;
const BOOK_SLUGS = ["abc-animal-adventure", "cursive-safari", "rorys-safari-field-guide"];
const MAX_IMPORT = 5000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const { data: auth } = token ? await db.auth.getUser(token) : { data: { user: null } };
  if (!auth.user) return json({ error: "signed_out" }, 401);
  const { data: admin } = await db.from("site_admins").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!admin) return json({ error: "not_admin", userId: auth.user.id }, 403);

  let body: { action?: string; kind?: string; id?: string; status?: string; rows?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }

  if (body.action === "list") {
    const since = new Date(Date.now() - 90 * 86400_000).toISOString();
    const [s, c, sales, clicks, ...clickTotals] = await Promise.all([
      db
        .from("book_suggestions")
        .select("id, category, intended_audience, idea, email, marketing_consent, status, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      db
        .from("class_set_inquiries")
        .select("id, name, org, email, quantity, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      db
        .from("book_sales")
        .select("id, source, kind, product_key, product_name, format, marketplace, quantity, amount_cents, currency, sold_at")
        .order("sold_at", { ascending: false })
        .limit(10000),
      db.from("amazon_clicks").select("book_slug, created_at").gte("created_at", since).limit(20000),
      ...BOOK_SLUGS.map((slug) => db.from("amazon_clicks").select("id", { count: "exact", head: true }).eq("book_slug", slug)),
    ]);
    const failed = [s, c, sales, clicks, ...clickTotals].find((r) => r.error);
    if (failed) {
      console.error("admin list failed", failed.error?.message);
      return json({ error: "load_failed" }, 500);
    }
    return json({
      suggestions: s.data,
      inquiries: c.data,
      sales: sales.data,
      clicks: {
        recent: clicks.data,
        totals: Object.fromEntries(BOOK_SLUGS.map((slug, i) => [slug, clickTotals[i]!.count ?? 0])),
      },
    });
  }

  if (body.action === "set_status") {
    const kind = KINDS[body.kind as keyof typeof KINDS];
    if (!kind || !UUID.test(body.id ?? "") || !(kind.statuses as readonly string[]).includes(body.status ?? "")) {
      return json({ error: "invalid" }, 400);
    }
    const { error } = await db.from(kind.table).update({ status: body.status }).eq("id", body.id!);
    if (error) {
      console.error("admin set_status failed", error.message);
      return json({ error: "update_failed" }, 500);
    }
    return json({ ok: true });
  }

  if (body.action === "import_sales") {
    const input = Array.isArray(body.rows) ? (body.rows as Record<string, unknown>[]) : null;
    if (!input || !input.length || input.length > MAX_IMPORT) return json({ error: "invalid" }, 400);
    const str = (v: unknown, max: number) => (typeof v === "string" && v.length <= max ? v : null);
    const rows = [];
    for (const r of input) {
      const sold = typeof r.sold_at === "string" ? new Date(r.sold_at) : null;
      const row = {
        source: "amazon",
        kind: r.kind === "refund" ? "refund" : "sale",
        external_id: str(r.external_id, 300),
        product_key: str(r.product_key, 200),
        product_name: str(r.product_name, 500),
        format: str(r.format, 100),
        marketplace: str(r.marketplace, 100),
        quantity: Number.isInteger(r.quantity) ? (r.quantity as number) : null,
        amount_cents: Number.isInteger(r.amount_cents) ? (r.amount_cents as number) : null,
        currency: str(r.currency, 10),
        sold_at: sold && !isNaN(sold.getTime()) ? sold.toISOString() : null,
      };
      if (!row.external_id || row.quantity === null || !row.sold_at) return json({ error: "invalid" }, 400);
      rows.push(row);
    }
    // Re-uploading an overlapping report replaces earlier numbers for the same rows.
    const { error } = await db.from("book_sales").upsert(rows, { onConflict: "source,kind,external_id" });
    if (error) {
      console.error("admin import_sales failed", error.message);
      return json({ error: "import_failed" }, 500);
    }
    return json({ ok: true, imported: rows.length });
  }

  return json({ error: "invalid" }, 400);
});
