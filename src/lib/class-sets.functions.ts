import { createServerFn } from "@tanstack/react-start";
import { classSetEmail, classSetSchema } from "./class-sets";
import { EMAIL } from "./site";

const FAILED = `Sorry, your inquiry couldn't be sent. Please email ${EMAIL} directly.`;

export const submitClassSetInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => classSetSchema.parse(d))
  .handler(async ({ data }) => {
    // Honeypot filled → pretend success, send nothing.
    if (data.website) return { ok: true as const };
    const { requestIpHash, saveSubmission } = await import("./forms.server");
    const { emailOwner } = await import("./email.server");
    const { website: _honeypot, ...row } = data;
    const saved = await saveSubmission("class_set", row, await requestIpHash());
    if (!saved.ok && saved.reason === "rate_limited") {
      return { ok: false as const, error: "You've sent several inquiries already. Please try again in an hour." };
    }
    // Either copy reaching the owner counts: the email, or the saved row on the admin page.
    const sent = await emailOwner({ ...classSetEmail(data), replyTo: data.email });
    return sent || saved.ok ? { ok: true as const } : { ok: false as const, error: FAILED };
  });
