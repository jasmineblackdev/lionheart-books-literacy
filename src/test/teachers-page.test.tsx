import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { books, comingSoon } from "@/lib/site";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: { component: unknown }) => ({ options: opts }),
  Link: ({ children, params, to, ...rest }: { children: React.ReactNode; params?: { slug: string }; to: string }) => (
    <a href={params ? to.replace("$slug", params.slug) : to} {...rest}>{children}</a>
  ),
}));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => vi.fn() }));
vi.mock("@/lib/class-sets.functions", () => ({ submitClassSetInquiry: {} }));
vi.mock("@/lib/clicks.functions", () => ({ recordAmazonClick: vi.fn() }));
const { Route } = await import("@/routes/teachers");
const Teachers = (Route as unknown as { options: { component: () => React.ReactElement } }).options.component;

describe("Teacher Resource Center", () => {
  it("grade guide lists every book in the desktop table and the phone cards, available first", () => {
    render(<Teachers />);
    const all = [...books, ...comingSoon];
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows.map((r) => within(r).getByRole("rowheader").textContent)).toEqual(all.map((b) => b.short));
    const cards = within(screen.getByRole("list", { name: /books by age, grade, skill and availability/ })).getAllByRole("listitem");
    expect(cards).toHaveLength(all.length);
    cards.forEach((card, i) => {
      const b = all[i]!;
      expect(within(card).getByRole("link", { name: b.short })).toHaveAttribute("href", `/books/${b.slug}`);
      expect(card).toHaveTextContent(b.ages);
      expect(card).toHaveTextContent("status" in b ? "Coming soon" : "Available now");
    });
  });

  it("sample cards show real pages, the PDF's page count and size, and a download link", () => {
    render(<Teachers />);
    for (const b of books.filter((x) => x.sample)) {
      const s = b.sample!;
      const card = screen.getByRole("article", { name: b.short });
      const dl = within(card).getByRole("link", { name: `Download free ${b.short} sample PDF, ${s.pageCount} pages, ${s.sizeMB} MB` });
      expect(dl).toHaveAttribute("href", s.url);
      expect(dl).toHaveAttribute("download");
      expect(within(card).getAllByRole("button", { name: /^Enlarge page/ })).toHaveLength(s.pages.length);
      expect(card).toHaveTextContent(`${s.pageCount} pages · ${s.sizeMB} MB`);
    }
  });

  it("every section the page links to exists and clears the sticky header", () => {
    const { container } = render(<Teachers />);
    for (const id of ["samples", "grades", "class-sets"]) {
      const section = container.querySelector(`#${id}`)!;
      expect(section, id).not.toBeNull();
      expect(section.className).toContain("scroll-mt-header");
      expect(screen.getAllByRole("link").some((a) => a.getAttribute("href") === `#${id}`) || id === "class-sets").toBe(true);
    }
  });
});
