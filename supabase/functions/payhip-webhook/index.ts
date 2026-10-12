// Receives Payhip "paid" and "refunded" webhooks (https://help.payhip.com/article/115-webhooks)
// and records them in book_sales for the /admin dashboard. Payhip proves a webhook is
// genuine by sending `signature` = SHA-256 hex of the store's API key, which is kept in
// the PAYHIP_API_KEY Supabase Edge Function secret. Payhip retries non-200 responses hourly for
// 3 hours, so duplicates are ignored via the (source, kind, external_id) unique key.
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sameSecret(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Payhip sends dates as Unix seconds; accept ISO strings too.
function toIso(v: unknown) {
  const d = typeof v === "number" ? new Date(v * 1000) : typeof v === "string" ? new Date(/^\d+$/.test(v) ? Number(v) * 1000 : v) : null;
  return d && !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
}

const cents = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : typeof v === "string" && /^\d+$/.test(v) ? Number(v) : null);
const text = (v: unknown, max: number) => (typeof v === "string" || typeof v === "number" ? String(v).slice(0, max) : null);

type Item = { product_id?: unknown; product_key?: unknown; product_name?: unknown; quantity?: unknown };

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const apiKey = Deno.env.get("PAYHIP_API_KEY");
  if (!apiKey) {
    console.error("payhip-webhook: PAYHIP_API_KEY is not set");
    return json({ error: "not_configured" }, 500);
  }

  let p: Record<string, unknown>;
  try {
    p = await req.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  if (typeof p.signature !== "string" || !sameSecret(p.signature.toLowerCase(), await sha256Hex(apiKey))) {
    return json({ error: "unauthorized" }, 401);
  }
  if (p.type !== "paid" && p.type !== "refunded") return json({ ok: true, ignored: p.type ?? null });

  const items = (Array.isArray(p.items) ? p.items : []) as Item[];
  if (!items.length || p.id == null) return json({ error: "invalid" }, 400);
  const refund = p.type === "refunded";
  // Payhip gives one total per order, not per item, so the amount is only kept for single-item orders.
  const total = cents(refund ? p.amount_refunded : p.price);
  const rows = items.map((it) => ({
    source: "payhip",
    kind: refund ? "refund" : "sale",
    external_id: `${text(p.id, 100)}:${text(it.product_id ?? it.product_key, 100)}`,
    product_key: text(it.product_key, 200),
    product_name: text(it.product_name, 500),
    format: "Digital PDF",
    quantity: Number.isInteger(it.quantity) && (it.quantity as number) > 0 ? (it.quantity as number) : 1,
    amount_cents: items.length === 1 ? total : null,
    currency: text(p.currency, 10),
    sold_at: toIso(refund ? (p.date_refunded ?? p.date) : p.date),
  }));

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await db.from("book_sales").upsert(rows, { onConflict: "source,kind,external_id", ignoreDuplicates: true });
  if (error) {
    console.error("payhip-webhook: insert failed", error.message);
    return json({ error: "insert_failed" }, 500); // non-200 makes Payhip retry later
  }
  return json({ ok: true });
});
