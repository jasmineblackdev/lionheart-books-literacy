import { EMAIL } from "./site";

// Sends an email to the site owner through Resend (https://resend.com). The RESEND_API_KEY
// secret must be set wherever the site's server code runs (Vercel). Without a verified
// domain, Resend's shared sender only delivers to the account owner's address, so the
// Resend account must be registered to EMAIL. Returns false (and logs why) on any failure.
export async function emailOwner(msg: { subject: string; text: string; replyTo?: string | undefined }) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("emailOwner: RESEND_API_KEY is not set");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "J. B. Lionheart Books <onboarding@resend.dev>",
        to: [EMAIL],
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
        subject: msg.subject,
        text: msg.text,
      }),
    });
    if (!res.ok) {
      console.error("emailOwner: send failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("emailOwner: send failed", e instanceof Error ? e.message : e);
    return false;
  }
}
