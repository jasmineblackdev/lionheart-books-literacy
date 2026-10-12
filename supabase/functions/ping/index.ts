// Health check and keep-alive. The daily GitHub workflow (.github/workflows/keepalive.yml)
// calls this so the free Supabase project never counts as inactive and gets paused.
// It makes one tiny database read (a row count) and returns no data; safe to call publicly.
import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await db.from("site_admins").select("user_id", { count: "exact", head: true });
  if (error) {
    console.error("ping: database check failed", error.message);
    return new Response(JSON.stringify({ ok: false, function: "ping", database: false }), { status: 500, headers });
  }
  return new Response(JSON.stringify({ ok: true, function: "ping", version: 2, database: true }), { headers });
});
