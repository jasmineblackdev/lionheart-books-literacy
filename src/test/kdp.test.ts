import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { kdpDate, parseKdpReport } from "@/lib/kdp";
import { bookForSale, summarize } from "@/lib/sales";
import { readXlsx } from "@/lib/xlsx";

// Fixtures are generated fake reports shaped like KDP's "Orders" download.
const load = async (name: string) => {
  const b = readFileSync(path.join(process.cwd(), "src/test/fixtures", name));
  return readXlsx(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};

describe("KDP report upload", () => {
  it("reads a KDP-style report with inline strings", async () => {
    const sheets = await load("kdp-inline.xlsx");
    expect(sheets.map((s) => s.name)).toEqual(["Report Definitions", "Summary", "Paperback Royalty", "eBook Royalty"]);
    const { rows, skipped, foundSheets } = parseKdpReport(sheets);
    expect(foundSheets).toEqual(["Paperback Royalty", "eBook Royalty"]);
    expect(skipped).toBe(0);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      kind: "sale",
      product_key: "B0HMP263KH",
      format: "Paperback",
      marketplace: "Amazon.com",
      quantity: 2,
      amount_cents: 542,
      currency: "USD",
      sold_at: "2026-10-03T00:00:00.000Z",
    });
    expect(rows[0]!.external_id).toBe("kdp|Paperback|2026-10-05|2026-10-03|B0HMP263KH|Amazon.com|60%|Standard");
  });

  it("reads a report re-saved by Excel (shared strings, real date cells)", async () => {
    const { rows } = parseKdpReport(await load("kdp-excel-saved.xlsx"));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ quantity: 2, amount_cents: 542, sold_at: "2026-10-03T00:00:00.000Z" });
  });

  it("matches imported rows to the right books and totals them", async () => {
    const { rows } = parseKdpReport(await load("kdp-inline.xlsx"));
    const sales = rows.map((r, i) => ({ ...r, id: String(i), source: "amazon" as const }));
    expect(sales.map((r) => bookForSale(r)?.slug)).toEqual(["cursive-safari", "abc-animal-adventure"]);
    const s = summarize(sales, { recent: [], totals: {} });
    expect(s.find((x) => x.book.slug === "cursive-safari")).toMatchObject({ paperbackUnits: 2, amazonRoyaltyUsdCents: 542 });
    // GBP royalties count as units but stay out of the USD royalty total.
    expect(s.find((x) => x.book.slug === "abc-animal-adventure")).toMatchObject({ paperbackUnits: 1, amazonRoyaltyUsdCents: 0 });
  });

  it("rejects files that aren't KDP reports or aren't spreadsheets", async () => {
    expect(parseKdpReport([{ name: "Sheet1", rows: [["a"]] }]).foundSheets).toEqual([]);
    await expect(readXlsx(new TextEncoder().encode("not a zip").buffer as ArrayBuffer)).rejects.toThrow();
  });

  it("understands KDP date formats", () => {
    expect(kdpDate("2026-10")).toBe("2026-10-01T00:00:00.000Z");
    expect(kdpDate(46300)).toBe(new Date(Date.UTC(1899, 11, 30) + 46300 * 86400_000).toISOString());
    expect(kdpDate("")).toBeNull();
    expect(kdpDate("not a date")).toBeNull();
  });
});
