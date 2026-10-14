import type { AdminData } from "./admin-api";
import { isFollowUpDue, todayIso } from "./follow-ups";
import { bookForSale } from "./sales";

// Numbers for the /admin Overview page, computed only from real dashboard data.

export const RANGES = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null },
] as const;
export type Range = (typeof RANGES)[number]["value"];

export function rangeStart(range: Range, now = Date.now()) {
  const days = RANGES.find((r) => r.value === range)?.days ?? null;
  return days === null ? null : now - days * 86400_000;
}

export type OverviewTotals = {
  /** Payhip sales plus Amazon royalties, USD only, net of refunds. */
  revenueUsdCents: number;
  booksSold: number;
  digitalUnits: number;
  paperbackUnits: number;
  amazonClicks: number;
  inquiriesReceived: number;
  suggestionsReceived: number;
  newInquiries: number;
  newSuggestions: number;
  /** School orders whose follow-up date is today or earlier and that aren't Done. */
  followUpsDue: number;
};

export function overviewTotals(d: AdminData, range: Range, now = Date.now()): OverviewTotals {
  const since = rangeStart(range, now);
  const inRange = (iso: string) => since === null || Date.parse(iso) >= since;
  const sales = d.sales.filter((s) => inRange(s.sold_at));
  const sign = (k: string) => (k === "refund" ? -1 : 1);
  const units = (source: "payhip" | "amazon") =>
    sales.filter((s) => s.source === source).reduce((n, s) => n + sign(s.kind) * s.quantity, 0);
  const digitalUnits = units("payhip");
  const paperbackUnits = units("amazon");
  return {
    revenueUsdCents: sales
      .filter((s) => (s.currency ?? "USD") === "USD")
      .reduce((n, s) => n + sign(s.kind) * (s.amount_cents ?? 0), 0),
    booksSold: digitalUnits + paperbackUnits,
    digitalUnits,
    paperbackUnits,
    amazonClicks:
      since === null
        ? Object.values(d.clicks.totals).reduce((a, b) => a + b, 0)
        : d.clicks.recent.filter((c) => Date.parse(c.created_at) >= since).length,
    inquiriesReceived: d.inquiries.filter((r) => inRange(r.created_at)).length,
    suggestionsReceived: d.suggestions.filter((r) => inRange(r.created_at)).length,
    newInquiries: d.inquiries.filter((r) => r.status === "new").length,
    newSuggestions: d.suggestions.filter((r) => r.status === "new").length,
    followUpsDue: d.inquiries.filter((r) => isFollowUpDue(r, todayIso(new Date(now)))).length,
  };
}

export type Activity = { at: string; kind: "inquiry" | "suggestion" | "sale" | "refund"; text: string; to: string };

/** The newest inquiries, suggestions and sales, merged and newest first. */
export function recentActivity(d: AdminData, limit = 8): Activity[] {
  const items: Activity[] = [
    ...d.inquiries.map((r) => ({
      at: r.created_at,
      kind: "inquiry" as const,
      text: `School inquiry from ${r.org} · ${r.quantity} books`,
      to: "/admin/school-orders",
    })),
    ...d.suggestions.map((r) => ({
      at: r.created_at,
      kind: "suggestion" as const,
      text: `Book suggestion: ${(r.idea ?? "").slice(0, 80) || "(no idea text)"}`,
      to: "/admin/suggestions",
    })),
    ...d.sales.map((s) => ({
      at: s.sold_at,
      kind: s.kind === "refund" ? ("refund" as const) : ("sale" as const),
      text: `${s.kind === "refund" ? "Refund" : "Sale"}: ${s.quantity} × ${bookForSale(s)?.short ?? s.product_name ?? "Unknown product"} (${s.source === "payhip" ? "Payhip" : "Amazon"})`,
      to: "/admin/sales",
    })),
  ];
  return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, limit);
}
