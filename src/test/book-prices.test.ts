import { describe, expect, it } from "vitest";
import { getBook, pageHead, SITE_URL } from "@/lib/site";

describe("book prices shown to shoppers", () => {
  it("lists the price the owner set for each of the three books", () => {
    expect(getBook("abc-animal-adventure")?.price).toBe("$9.99");
    expect(getBook("cursive-safari")?.price).toBe("$12.99");
    expect(getBook("rorys-safari-field-guide")?.price).toBe("$10.99");
  });

  it("offers ABC as a $5.99 digital PDF with paperback available", () => {
    expect(getBook("abc-animal-adventure")?.digital).toEqual({ price: "$5.99", url: "https://payhip.com/b/heOAD" });
    expect(getBook("abc-animal-adventure")?.paperbackAvailable).toBe(true);
  });

  it("offers Cursive as a $7.99 digital PDF with paperback available", () => {
    expect(getBook("cursive-safari")?.digital).toEqual({ price: "$7.99", url: "https://payhip.com/b/qaUHk" });
    expect(getBook("cursive-safari")?.paperbackAvailable).toBe(true);
  });

  it("offers the Field Guide as a $6.99 digital PDF with paperback available", () => {
    expect(getBook("rorys-safari-field-guide")?.digital).toEqual({ price: "$6.99", url: "https://payhip.com/b/fNdyi" });
    expect(getBook("rorys-safari-field-guide")?.paperbackAvailable).toBe(true);
  });

  it("uses the Vercel domain and each page's own path for canonical and sharing URLs", () => {
    expect(SITE_URL).toBe("https://lionheart-books-literacy.vercel.app");
    const head = pageHead({ title: "Book", description: "Book", path: "/books/cursive-safari" });
    expect(head.links).toContainEqual({ rel: "canonical", href: "https://lionheart-books-literacy.vercel.app/books/cursive-safari" });
    expect(head.meta).toContainEqual({ property: "og:url", content: "https://lionheart-books-literacy.vercel.app/books/cursive-safari" });
  });
});
