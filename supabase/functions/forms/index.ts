// Saves public form submissions (book suggestions, class-set inquiries) and "Buy on
// Amazon" click counts for the site,
// whose server code runs on Vercel and has no database service key of its own.
// Only the site's server may call this: it must send the shared FORMS_SECRET, which is
// set both here (Supabase Edge Function secret) and on the site host (Vercel env var). The site
// validates input first; this function re-checks shapes and lengths before inserting.
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const CATEGORIES = ["coloring", "handwriting", "puzzles", "animal-facts", "other"];
const AUDIENCES = ["3-6", "7-10", "11+", "adults", "teachers"];
const BOOK_SLUGS = ["abc-animal-adventure", "cursive-safari", "rorys-safari-field-guide"];
// Books a class-set inquiry may name: everything for sale or coming soon, or "unsure".
const INQUIRY_BOOKS = [
  ...BOOK_SLUGS,
  "safari-reading-detectives",
  "times-table-safari",
  "safari-math-detectives",
  "numbers-animal-adventure",
  "unsure",
];
const str = (v: unknown, min: number, max: number) =>
  typeof v === "string" && v.trim().length >= min && v.length <= max;

function sameSecret(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function suggestionRow(r: Record<string, unknown>) {
  if (!CATEGORIES.includes(r.category as string) || !AUDIENCES.includes(r.intended_audience as string)) return null;
  if (!str(r.idea, 1, 1000)) return null;
  if (r.email != null && r.email !== "" && !str(r.email, 3, 255)) return null;
  return {
    category: r.category as string,
    intended_audience: r.intended_audience as string,
    idea: (r.idea as string).trim(),
    email: (r.email as string) || null,
    marketing_consent: r.email ? r.marketing_consent === true : false,
  };
}

function classSetRow(r: Record<string, unknown>) {
  if (!str(r.name, 1, 200) || !str(r.org, 1, 200) || !str(r.email, 3, 255)) return null;
  if (!Number.isInteger(r.quantity) || (r.quantity as number) < 1 || (r.quantity as number) > 10000) return null;
  if (r.message != null && r.message !== "" && !str(r.message, 0, 2000)) return null;
  let books: string[] | null = null;
  if (r.books != null) {
    if (!Array.isArray(r.books) || r.books.length > 10 || !r.books.every((b) => INQUIRY_BOOKS.includes(b as string))) return null;
    books = [...new Set(r.books as string[])];
  }
  return {
    name: (r.name as string).trim(),
    org: (r.org as string).trim(),
    email: (r.email as string).trim(),
    quantity: r.quantity as number,
    message: (r.message as string) || null,
    books,
  };
}

function clickRow(r: Record<string, unknown>) {
  return BOOK_SLUGS.includes(r.book_slug as string) ? { book_slug: r.book_slug as string } : null;
}

// perHour: max rows per visitor (hashed IP) per hour for each kind.
const TABLES = {
  suggestion: { table: "book_suggestions", build: suggestionRow, perHour: 5 },
  class_set: { table: "class_set_inquiries", build: classSetRow, perHour: 5 },
  amazon_click: { table: "amazon_clicks", build: clickRow, perHour: 30 },
} as const;

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  const secret = Deno.env.get("FORMS_SECRET");
  if (!secret) {
    console.error("forms: FORMS_SECRET is not set");
    return json({ ok: false, error: "not_configured" }, 500);
  }
  if (!sameSecret(req.headers.get("x-forms-secret") ?? "", secret)) return json({ ok: false, error: "unauthorized" }, 401);

  let body: { type?: string; row?: Record<string, unknown>; ip_hash?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }
  const target = TABLES[body.type as keyof typeof TABLES];
  const row = target && body.row && typeof body.row === "object" ? target.build(body.row) : null;
  if (!target || !row) return json({ ok: false, error: "invalid" }, 400);
  const ip_hash = typeof body.ip_hash === "string" && body.ip_hash.length <= 128 ? body.ip_hash : null;

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  if (ip_hash) {
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db
      .from(target.table)
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ip_hash)
      .gte("created_at", since);
    if ((count ?? 0) >= target.perHour) return json({ ok: false, error: "rate_limited" }, 429);
  }
  const { error } = await db.from(target.table).insert({ ...row, ip_hash });
  if (error) {
    console.error(`forms: ${target.table} insert failed`, error.message);
    return json({ ok: false, error: "insert_failed" }, 500);
  }
  return json({ ok: true });
});
