import { createServerFn } from "@tanstack/react-start";
import { classSetEmail, classSetSchema } from "./class-sets";
import { EMAIL } from "./site";

const FAILED = `Sorry, your inquiry couldn't be sent. Please email ${EMAIL} directly.`;

export const submitClassSetInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => classSetSchema.parse(d))
  .handler(async ({ data }) => {
    // Honeypot filled → pretend success, send nothing.
    if (data.website) return { ok: true as const };
    const { emailOwner } = await import("./email.server");
    const sent = await emailOwner({ ...classSetEmail(data), replyTo: data.email });
    return sent ? { ok: true as const } : { ok: false as const, error: FAILED };
  });
