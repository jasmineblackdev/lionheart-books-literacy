import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import type { AdminData } from "@/lib/admin-api";
import { overviewTotals, rangeStart, recentActivity } from "@/lib/overview";
import type { SaleRow } from "@/lib/sales";
import { routeTree } from "@/routeTree.gen";

const NOW = Date.parse("2026-10-12T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW - n * 86400_000).toISOString();
const sale = (r: Partial<SaleRow>): SaleRow => ({
  id: Math.random().toString(),
  source: "payhip",
  kind: "sale",
  product_key: "heOAD",
  product_name: "ABC Animal Adventure",
  format: null,
  marketplace: null,
  quantity: 1,
  amount_cents: 599,
  currency: "USD",
  sold_at: daysAgo(1),
  ...r,
});

const data: AdminData = {
  inquiries: [
    { id: "i1", name: "Ann", org: "Oak School", email: "a@o.org", quantity: 30, message: null, status: "new", created_at: daysAgo(2) },
    { id: "i2", name: "Bo", org: "Elm School", email: "b@e.org", quantity: 10, message: null, status: "done", created_at: daysAgo(60) },
  ],
  suggestions: [
    { id: "s1", category: "puzzles", intended_audience: "7-10", idea: "Dinosaur mazes", email: null, marketing_consent: false, status: "new", created_at: daysAgo(3) },
  ],
  sales: [
    sale({ sold_at: daysAgo(1) }),
    sale({ sold_at: daysAgo(40) }),
    sale({ kind: "refund", sold_at: daysAgo(1) }),
    sale({ source: "amazon", product_name: "Cursive Safari", quantity: 2, amount_cents: 1084, sold_at: daysAgo(5) }),
    sale({ source: "amazon", product_name: "Cursive Safari", quantity: 1, amount_cents: 300, currency: "GBP", sold_at: daysAgo(5) }),
  ],
  clicks: {
    totals: { "cursive-safari": 9, "abc-animal-adventure": 1 },
    recent: [
      { book_slug: "cursive-safari", created_at: daysAgo(1) },
      { book_slug: "cursive-safari", created_at: daysAgo(20) },
    ],
  },
};

describe("admin overview", () => {
  it("totals the last 30 days from real data only", () => {
    expect(overviewTotals(data, "30d", NOW)).toEqual({
      revenueUsdCents: 599 - 599 + 1084, // GBP royalties stay out of the USD total
      booksSold: 0 + 3,
      digitalUnits: 0,
      paperbackUnits: 3,
      amazonClicks: 2,
      inquiriesReceived: 1,
      suggestionsReceived: 1,
      newInquiries: 1,
      newSuggestions: 1,
    });
  });

  it("uses all-time click totals for All time and narrows shorter ranges", () => {
    expect(overviewTotals(data, "all", NOW)).toMatchObject({ amazonClicks: 10, inquiriesReceived: 2, digitalUnits: 1 });
    expect(overviewTotals(data, "7d", NOW)).toMatchObject({ amazonClicks: 1, inquiriesReceived: 1 });
    expect(rangeStart("all", NOW)).toBeNull();
  });

  it("lists recent activity newest first with links to the right page", () => {
    const a = recentActivity(data, 3);
    expect(a.map((x) => x.kind)).toEqual(["sale", "refund", "inquiry"]);
    expect(a[2]).toMatchObject({ text: "School inquiry from Oak School · 30 books", to: "/admin/school-orders" });
  });

  it("has a page for every sidebar section", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const path of ["/admin", "/admin/books", "/admin/sales", "/admin/suggestions", "/admin/school-orders", "/admin/settings"]) {
      expect(router.matchRoutes(path).at(-1)?.fullPath.replace(/\/$/, "")).toBe(path);
    }
  });
});
