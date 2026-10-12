import { books, type Book } from "./site";

// Sales rows as returned by the admin edge function (table book_sales).
export type SaleRow = {
  id: string;
  source: "payhip" | "amazon";
  kind: "sale" | "refund";
  product_key: string | null;
  product_name: string | null;
  format: string | null;
  marketplace: string | null;
  quantity: number;
  amount_cents: number | null;
  currency: string | null;
  sold_at: string;
};

export type ClickData = {
  recent: { book_slug: string; created_at: string }[];
  totals: Record<string, number>;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** The Payhip product key is the last part of the book's Payhip link, e.g. payhip.com/b/heOAD → heOAD. */
export const payhipKey = (b: Book) => b.digital.url.split("/").pop() ?? "";

/** Works out which of the site's books a sale belongs to, or null if it doesn't match one. */
export function bookForSale(r: Pick<SaleRow, "source" | "product_key" | "product_name">): Book | null {
  if (r.source === "payhip" && r.product_key) {
    const byKey = books.find((b) => payhipKey(b) === r.product_key);
    if (byKey) return byKey;
  }
  const name = norm(r.product_name ?? "");
  if (!name) return null;
  return books.find((b) => name.includes(norm(b.short)) || norm(b.title).includes(name)) ?? null;
}

export type BookSummary = {
  book: Book;
  digitalUnits: number;
  digitalCents: number;
  paperbackUnits: number;
  /** Amazon royalties in USD cents; other currencies are left out of this total. */
  amazonRoyaltyUsdCents: number;
  clicksTotal: number;
  clicks30d: number;
};

export function summarize(sales: SaleRow[], clicks: ClickData, now = Date.now()): BookSummary[] {
  const since30 = now - 30 * 86400_000;
  return books.map((book) => {
    const mine = sales.filter((r) => bookForSale(r)?.slug === book.slug);
    const sign = (r: SaleRow) => (r.kind === "refund" ? -1 : 1);
    const digital = mine.filter((r) => r.source === "payhip");
    return {
      book,
      // Refunds subtract their units and refunded amount.
      digitalUnits: digital.reduce((n, r) => n + sign(r) * r.quantity, 0),
      digitalCents: digital.reduce((n, r) => n + sign(r) * (r.amount_cents ?? 0), 0),
      paperbackUnits: mine.filter((r) => r.source === "amazon").reduce((n, r) => n + sign(r) * r.quantity, 0),
      amazonRoyaltyUsdCents: mine
        .filter((r) => r.source === "amazon" && (r.currency ?? "USD") === "USD")
        .reduce((n, r) => n + sign(r) * (r.amount_cents ?? 0), 0),
      clicksTotal: clicks.totals[book.slug] ?? 0,
      clicks30d: clicks.recent.filter((c) => c.book_slug === book.slug && Date.parse(c.created_at) >= since30).length,
    };
  });
}

export const formatCents = (c: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(c / 100);
