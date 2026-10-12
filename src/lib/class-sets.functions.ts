import { createServerFn } from "@tanstack/react-start";
import { classSetEmail, classSetSchema } from "./class-sets";
import { EMAIL } from "./site";

const FAILED = `Sorry, your inquiry couldn't be sent. Please email ${EMAIL} directly.`;

// Sends through Resend (https://resend.com). The RESEND_API_KEY secret must be set
// wherever the site runs (Lovable Cloud and Vercel). Without a verified domain, Resend's
// shared sender only delivers to the account owner's address, so the Resend account
// must be registered to EMAIL.
export const submitClassSetInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => classSetSchema.parse(d))
  .handler(async ({ data }) => {
    // Honeypot filled → pretend success, send nothing.
    if (data.website) return { ok: true as const };
    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      console.error("class-set inquiry: RESEND_API_KEY is not set");
      return { ok: false as const, error: FAILED };
    }
    const { subject, text } = classSetEmail(data);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "J. B. Lionheart Books <onboarding@resend.dev>",
          to: [EMAIL],
          reply_to: data.email,
          subject,
          text,
        }),
      });
      if (!res.ok) {
        console.error("class-set inquiry send failed", res.status, await res.text());
        return { ok: false as const, error: FAILED };
      }
    } catch (e) {
      console.error("class-set inquiry send failed", e instanceof Error ? e.message : e);
      return { ok: false as const, error: FAILED };
    }
    return { ok: true as const };
  });
