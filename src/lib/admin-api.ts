import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { ClickData, SaleRow } from "./sales";

// Browser-side client for the private `admin` edge function (supabase/functions/admin).
// It sends the signed-in admin's access token; the function checks site_admins.

type Tables = Database["public"]["Tables"];
export type SuggestionRow = Omit<Tables["book_suggestions"]["Row"], "ip_hash">;
// notes/follow_up_on were added in supabase/setup/2026-10-12-school-order-notes.sql; the
// generated Database types predate them, so they're declared here.
export type InquiryRow = Omit<Tables["class_set_inquiries"]["Row"], "ip_hash"> & {
  /** Book slugs or "unsure" (supabase/migrations/20261015000000_class_set_books.sql); null on older inquiries. */
  books?: string[] | null;
  notes: string | null;
  /** YYYY-MM-DD */
  follow_up_on: string | null;
};
export type AdminData = { suggestions: SuggestionRow[]; inquiries: InquiryRow[]; sales: SaleRow[]; clicks: ClickData };

export const INQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "done", label: "Done" },
] as const;

export class AdminError extends Error {
  constructor(
    public code: "signed_out" | "not_admin" | "failed",
    public userId?: string,
  ) {
    super(code);
  }
}

async function callAdmin<T>(body: Record<string, unknown>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new AdminError("signed_out");
  const res = await fetch(`${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/admin`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const out = (await res.json().catch(() => ({}))) as { error?: string; userId?: string };
  if (res.status === 401) throw new AdminError("signed_out");
  if (res.status === 403) throw new AdminError("not_admin", out.userId);
  if (!res.ok) throw new AdminError("failed");
  return out as T;
}

export const loadAdminData = () => callAdmin<AdminData>({ action: "list" });

export const setAdminStatus = (kind: "suggestion" | "class_set", id: string, status: string) =>
  callAdmin<{ ok: true }>({ action: "set_status", kind, id, status });

export const updateInquiry = (id: string, notes: string, followUpOn: string) =>
  callAdmin<{ ok: true }>({ action: "update_inquiry", id, notes, follow_up_on: followUpOn });

export type SaleImport = Omit<SaleRow, "id" | "source"> & { external_id: string };

export const importSales = (rows: SaleImport[]) => callAdmin<{ ok: true; imported: number }>({ action: "import_sales", rows });

/** Opens a Gmail compose window replying to a class-set inquiry. */
export function gmailReplyUrl(r: Pick<InquiryRow, "email" | "org">) {
  const q = new URLSearchParams({ view: "cm", fs: "1", to: r.email, su: `Re: Class-set inquiry: ${r.org}` });
  return `https://mail.google.com/mail/?${q}`;
}
