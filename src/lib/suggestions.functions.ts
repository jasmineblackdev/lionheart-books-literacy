import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { RATE_LIMIT_PER_HOUR, statusSchema, suggestionEmail, suggestionSchema } from "./suggestions";

async function hashIp(ip: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("lionheart:" + ip));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const submitSuggestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => suggestionSchema.parse(d))
  .handler(async ({ data }) => {
    // Honeypot filled → pretend success, store nothing.
    if (data.website) return { ok: true as const };
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const ip = req?.headers.get("cf-connecting-ip") ?? req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ip_hash = await hashIp(ip);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await supabaseAdmin
      .from("book_suggestions")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ip_hash)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
      return { ok: false as const, error: "You've sent several ideas already. Please try again in an hour." };
    }
    const { error } = await supabaseAdmin.from("book_suggestions").insert({
      category: data.category,
      intended_audience: data.intended_audience,
      idea: data.idea || null,
      email: data.email || null,
      marketing_consent: data.email ? data.marketing_consent : false,
      ip_hash,
    });
    if (error) {
      console.error("suggestion insert failed", error.message);
      return { ok: false as const, error: "Something went wrong saving your idea. Please try again." };
    }
    // The suggestion is already saved, so a failed notification email doesn't fail the submission.
    const { emailOwner } = await import("./email.server");
    await emailOwner({ ...suggestionEmail(data), replyTo: data.email || undefined });
    return { ok: true as const };
  });

async function requireAdmin() {
  const { getSessionUser } = await import("@/lib/auth.server");
  const user = await getSessionUser();
  if (!user) return { user: null, admin: false };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("site_admins").select("user_id").eq("user_id", user.userId).maybeSingle();
  return { user, admin: !!data };
}

export const listSuggestions = createServerFn({ method: "GET" }).handler(async () => {
  const { user, admin } = await requireAdmin();
  if (!user) return { state: "signed_out" as const };
  if (!admin) return { state: "not_admin" as const, userId: user.userId };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("book_suggestions")
    .select("id, category, intended_audience, idea, email, marketing_consent, status, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error("Could not load suggestions.");
  return { state: "ok" as const, rows: data };
});

export const updateSuggestionStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: statusSchema }).parse(d))
  .handler(async ({ data }) => {
    const { admin } = await requireAdmin();
    if (!admin) throw new Error("Not authorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("book_suggestions").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("Could not update status.");
    return { ok: true };
  });
