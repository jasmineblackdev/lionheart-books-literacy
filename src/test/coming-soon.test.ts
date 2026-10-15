import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { books, comingSoon, getBook, getUpcomingBook } from "@/lib/site";
import { routeTree } from "@/routeTree.gen";

describe("coming-soon books", () => {
  it("lists Safari Reading Detectives as coming soon, separate from books for sale", () => {
    const b = getUpcomingBook("safari-reading-detectives");
    expect(b).toMatchObject({ status: "coming-soon", ages: "Grades 2–3 · Ages 7–9", pages: "156 pages" });
    // Not in the for-sale list, so it gets no Buy buttons, sales matching or click tracking.
    expect(getBook("safari-reading-detectives")).toBeUndefined();
    expect(books.map((x) => x.slug)).not.toContain("safari-reading-detectives");
    expect(b).not.toHaveProperty("amazon");
    expect(b).not.toHaveProperty("digital");
  });

  it("uses the real cover and three interior pages from the book's PDFs", () => {
    for (const f of ["reading-detectives-cover.jpg", "reading-detectives-passage.jpg", "reading-detectives-questions.jpg", "reading-detectives-color-by-clue.jpg"]) {
      expect(existsSync(path.join(process.cwd(), "src/assets", f))).toBe(true);
    }
    for (const b of comingSoon) expect(b.previews).toHaveLength(3);
  });

  it("lists Times Table Safari as coming soon with the grades printed on its cover", () => {
    expect(getUpcomingBook("times-table-safari")).toMatchObject({ status: "coming-soon", ages: "Grades 3–4 · Ages 8–10", pages: "76 pages" });
    expect(getBook("times-table-safari")).toBeUndefined();
    for (const f of ["times-table-cover.jpg", "times-table-meet-the-facts.jpg", "times-table-skip-count-maze.jpg", "times-table-crack-the-code.jpg"]) {
      expect(existsSync(path.join(process.cwd(), "src/assets", f))).toBe(true);
    }
  });

  it("lists Safari Math Detectives as coming soon from its PDFs", () => {
    expect(getUpcomingBook("safari-math-detectives")).toMatchObject({ status: "coming-soon", ages: "Grades 2–3 · Ages 7–9", pages: "141 pages" });
    expect(getBook("safari-math-detectives")).toBeUndefined();
    for (const f of ["math-detectives-cover.jpg", "math-detectives-case-file.jpg", "math-detectives-solve-the-case.jpg", "math-detectives-feather-measuring.jpg"]) {
      expect(existsSync(path.join(process.cwd(), "src/assets", f))).toBe(true);
    }
  });

  it("lists Numbers Animal Adventure as coming soon from its PDFs", () => {
    expect(getUpcomingBook("numbers-animal-adventure")).toMatchObject({ status: "coming-soon", ages: "Ages 3–6 · Pre-K & Kindergarten", ageRange: [3, 6], pages: "56 pages" });
    expect(getBook("numbers-animal-adventure")).toBeUndefined();
    for (const f of ["numbers-cover.jpg", "numbers-number-8.jpg", "numbers-practice-8.jpg", "numbers-adding-within-10.jpg"]) {
      expect(existsSync(path.join(process.cwd(), "src/assets", f))).toBe(true);
    }
  });

  it("has its own book page", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const b of comingSoon) expect(router.matchRoutes(`/books/${b.slug}`).at(-1)?.routeId).toBe("/books/$slug");
  });
});
