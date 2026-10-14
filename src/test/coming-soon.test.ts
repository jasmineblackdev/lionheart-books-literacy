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
    expect(comingSoon[0]!.previews).toHaveLength(3);
  });

  it("has its own book page", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/books/safari-reading-detectives").at(-1)?.routeId).toBe("/books/$slug");
  });
});
