import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { statusSchema, suggestionEmail, suggestionSchema } from "./suggestions";

export const submitSuggestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => suggestionSchema.parse(d))
  .handler(async ({ data }) => {
    // Honeypot filled → pretend success, store nothing.
    if (data.website) return { ok: true as const };
    const { requestIpHash, saveSubmission } = await import("@/lib/forms.server");
    const { emailOwner } = await import("./email.server");
    const saved = await saveSubmission(
      "suggestion",
      {
        category: data.category,
        intended_audience: data.intended_audience,
        idea: data.idea,
        email: data.email || null,
        marketing_consent: data.email ? data.marketing_consent : false,
      },
      await requestIpHash(),
    );
    if (!saved.ok && saved.reason === "rate_limited") {
      return { ok: false as const, error: "You've sent several ideas already. Please try again in an hour." };
    }
    // Either copy reaching the owner counts: the saved row on the admin page, or the email.
    const sent = await emailOwner({ ...suggestionEmail(data), replyTo: data.email || undefined });
    if (!saved.ok && !sent) {
      return { ok: false as const, error: "Something went wrong saving your idea. Please try again." };
    }
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
