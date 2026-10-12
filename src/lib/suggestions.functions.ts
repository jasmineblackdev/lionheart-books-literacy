import { createServerFn } from "@tanstack/react-start";
import { suggestionEmail, suggestionSchema } from "./suggestions";

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
