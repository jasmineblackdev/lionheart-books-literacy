import { getRequest } from "@tanstack/react-start/server";

// Saves a public form submission through the Supabase "forms" edge function
// (supabase/functions/forms). The site runs on Vercel, which has no database service
// key, so it can't write to the database directly. FORMS_SECRET must match the
// Edge Function secret of the same name in Supabase.
export type SaveResult = { ok: true } | { ok: false; reason: "rate_limited" | "failed" };

export async function hashIp(ip: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("lionheart:" + ip));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function requestIpHash() {
  const req = getRequest();
  const ip = req?.headers.get("cf-connecting-ip") ?? req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return hashIp(ip);
}

export async function saveSubmission(type: "suggestion" | "class_set" | "amazon_click", row: Record<string, unknown>, ip_hash: string): Promise<SaveResult> {
  const base = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ?? process.env["SUPABASE_URL"];
  const secret = process.env["FORMS_SECRET"];
  if (!base || !secret) {
    console.error("saveSubmission: missing", !base ? "VITE_SUPABASE_URL" : "FORMS_SECRET");
    return { ok: false, reason: "failed" };
  }
  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}/functions/v1/forms`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forms-secret": secret },
      body: JSON.stringify({ type, row, ip_hash }),
    });
    if (res.ok) return { ok: true };
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    console.error("saveSubmission: forms function returned", res.status, await res.text());
  } catch (e) {
    console.error("saveSubmission: request failed", e instanceof Error ? e.message : e);
  }
  return { ok: false, reason: "failed" };
}
