import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { filterBooks, matchesAge } from "@/lib/catalog";
import { books, comingSoon } from "@/lib/site";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, params, to, ...rest }: { children: React.ReactNode; params?: { slug: string }; to: string }) => (
    <a href={params ? to.replace("$slug", params.slug) : to} {...rest}>{children}</a>
  ),
}));
vi.mock("@/lib/clicks.functions", () => ({ recordAmazonClick: vi.fn() }));
const { Catalog } = await import("@/components/catalog");

const slugs = (list: { slug: string }[]) => list.map((b) => b.slug);

describe("catalog filters", () => {
  it("matches age groups by overlapping age ranges", () => {
    expect(matchesAge({ ageRange: [3, 6] }, "3-6")).toBe(true);
    expect(matchesAge({ ageRange: [3, 6] }, "7-8")).toBe(false);
    expect(matchesAge({ ageRange: [6, 10] }, "3-6")).toBe(true); // Field Guide starts at 6
    expect(matchesAge({ ageRange: [8, 10] }, "7-8")).toBe(true);
    expect(matchesAge({ ageRange: [7, 9] }, "")).toBe(true);
  });

  it("filters the real book list by age and learning category", () => {
    expect(slugs(filterBooks(books, "3-6", ""))).toEqual(["abc-animal-adventure", "rorys-safari-field-guide"]);
    expect(slugs(filterBooks(comingSoon, "", "math"))).toEqual(["times-table-safari", "safari-math-detectives", "numbers-animal-adventure"]);
    expect(slugs(filterBooks(comingSoon, "3-6", ""))).toEqual(["numbers-animal-adventure"]);
    expect(slugs(filterBooks([...books, ...comingSoon], "9-10", "letters"))).toEqual(["cursive-safari"]);
  });

  it("every book has an age range and at least one category", () => {
    for (const b of [...books, ...comingSoon]) {
      expect(b.ageRange[0]).toBeLessThanOrEqual(b.ageRange[1]);
      expect(b.categories.length).toBeGreaterThan(0);
    }
  });
});

describe("home catalog", () => {
  it("shows available books first with prices, and coming-soon books without purchase actions", () => {
    render(<Catalog />);
    const available = screen.getByRole("heading", { name: "Available now" });
    const soon = screen.getByRole("heading", { name: "Coming soon" });
    expect(available.compareDocumentPosition(soon) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByText("View Book")).toHaveLength(books.length);
    expect(screen.getAllByText("Preview the book")).toHaveLength(comingSoon.length);
    for (const b of comingSoon) {
      const card = screen.getByRole("link", { name: b.title }).closest("article")!;
      expect(within(card).queryByText(/\$\d/)).toBeNull();
      expect(within(card).queryByText(/Buy|Amazon|Digital PDF/)).toBeNull();
    }
    expect(screen.queryByText(/Buy on Amazon/)).toBeNull();
  });

  it("filters with toggle chips and can clear them", () => {
    render(<Catalog />);
    fireEvent.click(screen.getByRole("button", { name: "Math" }));
    expect(screen.getByRole("button", { name: "Math" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(`${comingSoon.filter((b) => b.categories.includes("math")).length} books match`)).toBeInTheDocument();
    expect(screen.getByText("No available books match these filters yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Times Table Safari" })).toHaveAttribute("href", "/books/times-table-safari");
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText(`${books.length + comingSoon.length} books`)).toBeInTheDocument();
  });
});
