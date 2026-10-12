// Private admin API for the site's /admin dashboard. The caller must send the access
// token of a signed-in Lovable Cloud user whose id is in the site_admins table;
// everyone else gets 401/403 and no data. Actions (POST JSON body):
//   { action: "list" }                                   → suggestions + class-set inquiries
//   { action: "set_status", kind, id, status }           → update one row's status
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

  let body: { action?: string; kind?: string; id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }

  if (body.action === "list") {
    const [s, c] = await Promise.all([
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
    ]);
    if (s.error || c.error) {
      console.error("admin list failed", s.error?.message, c.error?.message);
      return json({ error: "load_failed" }, 500);
    }
    return json({ suggestions: s.data, inquiries: c.data });
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

  return json({ error: "invalid" }, 400);
});
