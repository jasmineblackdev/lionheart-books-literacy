import { describe, expect, it } from "vitest";
import { bookForSale, formatCents, payhipKey, summarize, type SaleRow } from "@/lib/sales";
import { getBook } from "@/lib/site";

const row = (r: Partial<SaleRow>): SaleRow => ({
  id: Math.random().toString(),
  source: "payhip",
  kind: "sale",
  product_key: null,
  product_name: null,
  format: null,
  marketplace: null,
  quantity: 1,
  amount_cents: null,
  currency: "USD",
  sold_at: "2026-10-01T00:00:00Z",
  ...r,
});

describe("sales summary", () => {
  it("matches Payhip sales by the product key in each book's Payhip link", () => {
    expect(payhipKey(getBook("abc-animal-adventure")!)).toBe("heOAD");
    expect(bookForSale(row({ product_key: "qaUHk" }))?.slug).toBe("cursive-safari");
  });

  it("falls back to matching the product name", () => {
    expect(bookForSale(row({ source: "amazon", product_name: "Cursive Safari: A Handwriting Workbook" }))?.slug).toBe("cursive-safari");
    expect(bookForSale(row({ source: "amazon", product_name: "Rory's Safari Field Guide" }))?.slug).toBe("rorys-safari-field-guide");
    expect(bookForSale(row({ source: "amazon", product_name: "Some Other Book" }))).toBeNull();
  });

  it("totals digital units and revenue net of refunds, plus paperbacks and clicks", () => {
    const now = Date.parse("2026-10-12T00:00:00Z");
    const sales = [
      row({ product_key: "heOAD", amount_cents: 599 }),
      row({ product_key: "heOAD", amount_cents: 599 }),
      row({ product_key: "heOAD", kind: "refund", amount_cents: 599 }),
      row({ source: "amazon", product_name: "ABC Animal Adventure", quantity: 3 }),
    ];
    const clicks = {
      totals: { "abc-animal-adventure": 7 },
      recent: [
        { book_slug: "abc-animal-adventure", created_at: "2026-10-10T00:00:00Z" },
        { book_slug: "abc-animal-adventure", created_at: "2026-08-01T00:00:00Z" },
      ],
    };
    const abc = summarize(sales, clicks, now).find((s) => s.book.slug === "abc-animal-adventure")!;
    expect(abc).toMatchObject({ digitalUnits: 1, digitalCents: 599, paperbackUnits: 3, clicksTotal: 7, clicks30d: 1 });
    expect(summarize(sales, clicks, now).find((s) => s.book.slug === "cursive-safari")).toMatchObject({ digitalUnits: 0, clicksTotal: 0 });
  });

  it("formats cents as dollars", () => {
    expect(formatCents(1299)).toBe("$12.99");
  });
});
