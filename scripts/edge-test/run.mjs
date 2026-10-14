// Runs the Supabase edge functions in supabase/functions under Node with a fake
// database, so changes can be checked before deploying them (npm run deploy:functions).
// Usage: npm run test:edge
import { build } from "esbuild";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
const H = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(H, "../..");
let failures = 0;
const check = (name, cond, extra = "") => { console.log(`${cond ? "PASS" : "FAIL"} ${name}${cond ? "" : " " + extra}`); if (!cond) failures++; };

async function load(fn) {
  const out = path.join(os.tmpdir(), `edge-test-${fn}.bundle.mjs`);
  await build({
    entryPoints: [path.join(REPO, "supabase/functions", fn, "index.ts")],
    bundle: true, format: "esm", platform: "neutral", outfile: out, logLevel: "error",
    plugins: [{ name: "npm", setup(b) { b.onResolve({ filter: /^npm:@supabase\/supabase-js/ }, () => ({ path: path.join(H, "fake-supabase.mjs") })); } }],
  });
  let handler;
  globalThis.Deno = { serve: (h) => { handler = h; }, env: { get: (k) => globalThis.__env[k] } };
  await import(out + "?" + Date.now());
  return handler;
}
const reset = (env, respond = () => ({ data: null, error: null, count: 0 }), getUser = async () => ({ data: { user: null } })) => {
  globalThis.__env = { SUPABASE_URL: "http://db", SUPABASE_SERVICE_ROLE_KEY: "svc", ...env };
  globalThis.__db = { ops: [], respond, getUser };
};
const post = (body, headers = {}) => new Request("http://x", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
const call = async (h, req) => { const r = await h(req); return { status: r.status, body: await r.json().catch(() => null) }; };

// ---------- ping ----------
{
  const h = await load("ping");
  reset({});
  let r = await call(h, new Request("http://x"));
  check("ping reads the database (keeps the free project awake)", r.status === 200 && r.body.database === true && __db.ops.some((o) => o.table === "site_admins"));
  reset({}, () => ({ data: null, error: { message: "down" }, count: null }));
  r = await call(h, new Request("http://x"));
  check("ping reports a database failure", r.status === 500 && r.body.database === false);
}

// ---------- forms ----------
{
  const h = await load("forms");
  reset({ FORMS_SECRET: "s3cret" });
  check("forms rejects wrong secret", (await call(h, post({}, { "x-forms-secret": "nope" }))).status === 401);
  reset({ FORMS_SECRET: "s3cret" });
  let r = await call(h, post({ type: "amazon_click", row: { book_slug: "cursive-safari" }, ip_hash: "ip1" }, { "x-forms-secret": "s3cret" }));
  const ins = __db.ops.find((o) => o.calls.some((c) => c[0] === "insert"));
  check("forms saves an Amazon click", r.status === 200 && ins?.table === "amazon_clicks" && ins.calls.find((c) => c[0] === "insert")[1].book_slug === "cursive-safari", JSON.stringify(r));
  reset({ FORMS_SECRET: "s3cret" });
  r = await call(h, post({ type: "amazon_click", row: { book_slug: "not-a-book" } }, { "x-forms-secret": "s3cret" }));
  check("forms rejects unknown book slug", r.status === 400);
  reset({ FORMS_SECRET: "s3cret" }, (op) => ({ data: null, error: null, count: op.calls.some((c) => c[0] === "select") ? 30 : 0 }));
  r = await call(h, post({ type: "amazon_click", row: { book_slug: "cursive-safari" }, ip_hash: "ip1" }, { "x-forms-secret": "s3cret" }));
  check("forms limits clicks at 30/hour", r.status === 429);
  reset({ FORMS_SECRET: "s3cret" }, (op) => ({ data: null, error: null, count: op.calls.some((c) => c[0] === "select") ? 5 : 0 }));
  r = await call(h, post({ type: "suggestion", row: { category: "puzzles", intended_audience: "7-10", idea: "x" }, ip_hash: "ip1" }, { "x-forms-secret": "s3cret" }));
  check("forms still limits suggestions at 5/hour", r.status === 429);
  reset({ FORMS_SECRET: "s3cret" });
  r = await call(h, post({ type: "class_set", row: { name: "A", org: "B", email: "a@b.co", quantity: 3, message: "" }, ip_hash: "ip1" }, { "x-forms-secret": "s3cret" }));
  check("forms still saves class-set inquiries", r.status === 200 && __db.ops.some((o) => o.table === "class_set_inquiries"));
}

// ---------- payhip-webhook ----------
{
  const h = await load("payhip-webhook");
  const KEY = "payhip-test-key";
  const sig = createHash("sha256").update(KEY).digest("hex");
  const paid = { id: "ORD1", email: "b@x.com", currency: "USD", price: 599, items: [{ product_id: "P1", product_key: "heOAD", product_name: "ABC Animal Adventure", quantity: 1 }], date: 1791000000, type: "paid", signature: sig };
  reset({ PAYHIP_API_KEY: KEY });
  check("payhip rejects bad signature", (await call(h, post({ ...paid, signature: "bad" }))).status === 401);
  reset({});
  check("payhip reports missing key", (await call(h, post(paid))).status === 500);
  reset({ PAYHIP_API_KEY: KEY });
  let r = await call(h, post(paid));
  const up = __db.ops.find((o) => o.table === "book_sales")?.calls.find((c) => c[0] === "upsert");
  const row = up?.[1]?.[0];
  check("payhip records a paid sale", r.status === 200 && row?.external_id === "ORD1:P1" && row.kind === "sale" && row.amount_cents === 599 && row.product_key === "heOAD" && row.sold_at === new Date(1791000000 * 1000).toISOString(), JSON.stringify(row));
  check("payhip ignores duplicate retries", up?.[2]?.ignoreDuplicates === true && up?.[2]?.onConflict === "source,kind,external_id");
  reset({ PAYHIP_API_KEY: KEY });
  r = await call(h, post({ ...paid, type: "refunded", amount_refunded: 599, date_created: 1791000000, date_refunded: 1791100000, date: undefined }));
  const ref = __db.ops.find((o) => o.table === "book_sales")?.calls.find((c) => c[0] === "upsert")?.[1]?.[0];
  check("payhip records a refund", r.status === 200 && ref?.kind === "refund" && ref.amount_cents === 599 && ref.sold_at === new Date(1791100000 * 1000).toISOString(), JSON.stringify(ref));
  reset({ PAYHIP_API_KEY: KEY });
  r = await call(h, post({ ...paid, items: [paid.items[0], { product_id: "P2", product_key: "qaUHk", product_name: "Cursive Safari", quantity: 2 }] }));
  const multi = __db.ops.find((o) => o.table === "book_sales")?.calls.find((c) => c[0] === "upsert")?.[1];
  check("payhip splits multi-item orders without guessing amounts", multi?.length === 2 && multi[1].quantity === 2 && multi.every((x) => x.amount_cents === null));
  reset({ PAYHIP_API_KEY: KEY });
  r = await call(h, post({ ...paid, type: "subscription.created" }));
  check("payhip ignores other events with 200", r.status === 200 && !__db.ops.length);
  reset({ PAYHIP_API_KEY: KEY }, () => ({ data: null, error: { message: "boom" } }));
  check("payhip returns 500 on db error so Payhip retries", (await call(h, post(paid))).status === 500);
}

// ---------- admin ----------
{
  const h = await load("admin");
  const asAdmin = (respond) => reset({}, respond, async (t) => ({ data: { user: t === "good" ? { id: "u1" } : null } }));
  const auth = { authorization: "Bearer good" };
  asAdmin();
  check("admin signed out without token", (await call(h, post({ action: "list" }))).status === 401);
  asAdmin((op) => ({ data: null, error: null }));
  let r = await call(h, post({ action: "list" }, auth));
  check("admin rejects non-admins", r.status === 403 && r.body.userId === "u1");
  const adminRespond = (op) => {
    if (op.table === "site_admins") return { data: { user_id: "u1" }, error: null };
    if (op.table === "amazon_clicks" && op.calls.some((c) => c[0] === "select" && c[2]?.head)) {
      const slug = op.calls.find((c) => c[0] === "eq")[2];
      return { data: null, count: slug === "cursive-safari" ? 4 : 0, error: null };
    }
    return { data: [{ table: op.table }], error: null };
  };
  asAdmin(adminRespond);
  r = await call(h, post({ action: "list" }, auth));
  check("admin list returns sales and click totals", r.status === 200 && r.body.sales?.[0]?.table === "book_sales" && r.body.clicks.totals["cursive-safari"] === 4 && r.body.clicks.recent?.[0]?.table === "amazon_clicks" && r.body.inquiries && r.body.suggestions, JSON.stringify(r.body));
  asAdmin(adminRespond);
  r = await call(h, post({ action: "import_sales", rows: [{ external_id: "kdp:1", product_name: "Cursive Safari", format: "Paperback", marketplace: "Amazon.com", quantity: 2, amount_cents: null, currency: "USD", sold_at: "2026-10-01", kind: "sale" }] }, auth));
  const imp = __db.ops.find((o) => o.table === "book_sales")?.calls.find((c) => c[0] === "upsert");
  check("admin imports Amazon rows and overwrites re-uploads", r.status === 200 && r.body.imported === 1 && imp[1][0].source === "amazon" && imp[1][0].quantity === 2 && imp[2].onConflict === "source,kind,external_id" && !imp[2].ignoreDuplicates, JSON.stringify(r));
  asAdmin(adminRespond);
  r = await call(h, post({ action: "import_sales", rows: [{ external_id: "kdp:1", quantity: "two", sold_at: "2026-10-01" }] }, auth));
  check("admin rejects malformed import rows", r.status === 400);
  asAdmin(adminRespond);
  r = await call(h, post({ action: "set_status", kind: "class_set", id: "00000000-0000-4000-8000-000000000000", status: "replied" }, auth));
  check("admin still updates statuses", r.status === 200);
  const ID = "00000000-0000-4000-8000-000000000000";
  asAdmin(adminRespond);
  r = await call(h, post({ action: "update_inquiry", id: ID, notes: "Sent quote 10/14", follow_up_on: "2026-10-20" }, auth));
  const upd = __db.ops.find((o) => o.table === "class_set_inquiries")?.calls;
  check("admin saves inquiry notes and follow-up date", r.status === 200 && upd?.find((c) => c[0] === "update")?.[1]?.notes === "Sent quote 10/14" && upd.find((c) => c[0] === "update")[1].follow_up_on === "2026-10-20" && upd.find((c) => c[0] === "eq")?.[2] === ID, JSON.stringify(upd));
  asAdmin(adminRespond);
  r = await call(h, post({ action: "update_inquiry", id: ID, notes: "", follow_up_on: "" }, auth));
  const cleared = __db.ops.find((o) => o.table === "class_set_inquiries")?.calls.find((c) => c[0] === "update")?.[1];
  check("admin clears notes and follow-up date", r.status === 200 && cleared?.notes === null && cleared?.follow_up_on === null);
  for (const [name, bad] of [["bad date", { follow_up_on: "next week", notes: null }], ["notes too long", { notes: "x".repeat(5001), follow_up_on: null }], ["bad id", { id: "nope", notes: null, follow_up_on: null }]]) {
    asAdmin(adminRespond);
    r = await call(h, post({ action: "update_inquiry", id: ID, ...bad }, auth));
    check(`admin rejects ${name}`, r.status === 400 && !__db.ops.some((o) => o.table === "class_set_inquiries"));
  }
  asAdmin(adminRespond);
  r = await call(h, post({ action: "list" }, auth));
  check("admin list includes notes and follow-up dates", __db.ops.find((o) => o.table === "class_set_inquiries")?.calls.find((c) => c[0] === "select")?.[1].includes("notes, follow_up_on"));
  const pre = await h(new Request("http://x", { method: "OPTIONS" }));
  check("admin answers CORS preflight", pre.status === 200 && pre.headers.get("access-control-allow-origin") === "*");
}

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
