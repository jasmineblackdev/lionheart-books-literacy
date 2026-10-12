import type { SaleImport } from "./admin-api";
import type { Cell, Sheet } from "./xlsx";

// Turns a KDP "Orders" report download (kdpreports.amazon.com → Download report) into
// sales rows. Reads the Paperback, eBook and Hardcover Royalty sheets: one row per
// royalty date / order date / book / marketplace / royalty type, with net units and
// royalty. Each row gets a stable id, so re-uploading an overlapping report updates
// rows instead of double-counting them.

const SHEETS: Record<string, string> = {
  "Paperback Royalty": "Paperback",
  "eBook Royalty": "eBook",
  "Hardcover Royalty": "Hardcover",
};

/** Accepts Excel date serials, "YYYY-MM-DD", "YYYY-MM" and other date strings. */
export function kdpDate(v: Cell): string | null {
  if (typeof v === "number" && v > 20000 && v < 80000) return new Date(Date.UTC(1899, 11, 30) + v * 86400_000).toISOString();
  if (typeof v !== "string" || !v.trim()) return null;
  const s = v.trim();
  const ym = s.match(/^(\d{4})-(\d{2})$/);
  if (ym) return new Date(Date.UTC(Number(ym[1]), Number(ym[2]) - 1, 1)).toISOString();
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return new Date(Date.UTC(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))).toISOString();
  const t = Date.parse(s);
  return isNaN(t) ? null : new Date(t).toISOString();
}

const num = (v: Cell) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && !isNaN(Number(v.replace(/,/g, ""))) ? Number(v.replace(/,/g, "")) : null);
const str = (v: Cell) => (v == null ? "" : String(v).trim());
/** The cell in column i, or null when the column is missing (i < 0) or the cell is empty. */
const at = (r: Cell[], i: number): Cell => (i < 0 ? null : (r[i] ?? null));

export type KdpParse = { rows: SaleImport[]; skipped: number; foundSheets: string[] };

export function parseKdpReport(sheets: Sheet[]): KdpParse {
  const rows: SaleImport[] = [];
  let skipped = 0;
  const foundSheets: string[] = [];
  for (const sheet of sheets) {
    const format = SHEETS[sheet.name];
    if (!format) continue;
    foundSheets.push(sheet.name);
    const [header, ...body] = sheet.rows;
    if (!header) continue;
    const col = (name: string) => header.findIndex((h) => str(h).toLowerCase() === name.toLowerCase());
    const c = {
      royaltyDate: col("Royalty Date"),
      orderDate: col("Order Date"),
      title: col("Title"),
      isbn: col("ISBN"),
      asin: col("ASIN"),
      marketplace: col("Marketplace"),
      royaltyType: col("Royalty Type"),
      transactionType: col("Transaction Type"),
      net: col("Net Units Sold"),
      royalty: col("Royalty"),
      currency: col("Currency"),
    };
    if (c.title < 0 || c.net < 0 || c.royaltyDate < 0) continue;
    for (const r of body) {
      const title = str(at(r, c.title));
      if (!title) continue;
      const net = num(at(r, c.net));
      // Prefer the order date; fall back to the royalty date.
      const soldAt = kdpDate(at(r, c.orderDate)) ?? kdpDate(at(r, c.royaltyDate));
      if (net === null || !Number.isInteger(net) || !soldAt) {
        skipped++;
        continue;
      }
      const royalty = num(at(r, c.royalty));
      const key = str(at(r, c.asin)) || str(at(r, c.isbn));
      const id = [
        "kdp",
        format,
        str(at(r, c.royaltyDate)),
        str(at(r, c.orderDate)),
        key || title,
        str(at(r, c.marketplace)),
        str(at(r, c.royaltyType)),
        str(at(r, c.transactionType)),
      ].join("|");
      rows.push({
        external_id: id.slice(0, 300),
        kind: "sale",
        product_key: key ? key.slice(0, 200) : null,
        product_name: title.slice(0, 500),
        format,
        marketplace: str(at(r, c.marketplace)).slice(0, 100) || null,
        quantity: net, // net of refunds; may be negative
        amount_cents: royalty === null ? null : Math.round(royalty * 100), // your royalty, not the list price
        currency: str(at(r, c.currency)).slice(0, 10) || null,
        sold_at: soldAt,
      });
    }
  }
  return { rows, skipped, foundSheets };
}
