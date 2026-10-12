// Deployment check: confirms edge functions in this repo reach Lovable Cloud.
// Returns no data and touches nothing; safe to call publicly.
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  return new Response(JSON.stringify({ ok: true, function: "ping", version: 1 }), { headers });
});
