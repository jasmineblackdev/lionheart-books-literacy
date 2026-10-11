import { describe, expect, it } from "vitest";
import { getBook } from "@/lib/site";

describe("book prices shown to shoppers", () => {
  it("lists the price the owner set for each of the three books", () => {
    expect(getBook("abc-animal-adventure")?.price).toBe("$9.99");
    expect(getBook("cursive-safari")?.price).toBe("$12.99");
    expect(getBook("rorys-safari-field-guide")?.price).toBe("$10.99");
  });
});
