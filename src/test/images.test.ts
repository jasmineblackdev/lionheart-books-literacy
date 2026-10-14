import { describe, expect, it } from "vitest";
import { responsive } from "@/lib/images";
import { books, comingSoon, rory } from "@/lib/site";

describe("responsive images", () => {
  it("gives every cover and preview a small copy plus the full image", () => {
    for (const b of [...books, ...comingSoon]) {
      for (const src of [b.cover, ...b.previews.map((p) => p.src)]) {
        const r = responsive(src, "300px");
        expect(r.srcSet, src).toMatch(/-sm\b.* \d+w, .* \d+w$/);
        expect(r.srcSet).toContain(src);
        expect(r.sizes).toBe("300px");
      }
    }
    expect(responsive(rory, "384px").srcSet).toBeDefined();
  });

  it("falls back to the plain src for unknown images", () => {
    expect(responsive("/somewhere/else.png", "10px")).toEqual({ src: "/somewhere/else.png" });
  });
});
