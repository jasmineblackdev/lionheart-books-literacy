import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { books } from "@/lib/site";

// The sample PDFs are imported as URLs; map each back to its file in src/assets.
const file = (url: string) => path.join(process.cwd(), "src/assets", path.basename(url).replace(/-[\w-]{8}(\.pdf)$/, "$1"));
const pdfPages = (p: string) => (readFileSync(p).toString("latin1").match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;

describe("free sample PDFs", () => {
  const withSamples = books.filter((b) => b.sample);

  it("exist for ABC Animal Adventure and Cursive Safari", () => {
    expect(withSamples.map((b) => b.slug)).toEqual(["abc-animal-adventure", "cursive-safari"]);
  });

  it("state the real page count and file size of each PDF", () => {
    for (const b of withSamples) {
      const s = b.sample!;
      const f = file(s.url);
      expect(pdfPages(f), b.slug).toBe(s.pageCount);
      expect(s.label).toContain(`${s.pageCount} pages`);
      // Decimal megabytes, as Finder and most browsers show file sizes.
      expect((statSync(f).size / 1_000_000).toFixed(1), b.slug).toBe(s.sizeMB);
    }
  });

  it("preview three real pages from the PDF", () => {
    for (const b of withSamples) {
      expect(b.sample!.pages).toHaveLength(3);
      for (const p of b.sample!.pages) expect(p.alt).toMatch(/^Free sample page/);
    }
  });
});
