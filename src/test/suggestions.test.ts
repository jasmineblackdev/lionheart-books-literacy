import { describe, expect, it } from "vitest";
import { suggestionSchema } from "@/lib/suggestions";

const base = { category: "puzzles", intended_audience: "7-10" };

describe("book suggestion rules", () => {
  it("accepts a suggestion with no email and no consent", () => {
    const r = suggestionSchema.parse(base);
    expect(r.email).toBe("");
    expect(r.marketing_consent).toBe(false);
  });
  it("requires a category and audience", () => {
    expect(suggestionSchema.safeParse({ intended_audience: "7-10" }).success).toBe(false);
    expect(suggestionSchema.safeParse({ category: "puzzles" }).success).toBe(false);
  });
  it("rejects ideas over 1000 characters", () => {
    expect(suggestionSchema.safeParse({ ...base, idea: "x".repeat(1001) }).success).toBe(false);
  });
  it("rejects release-update consent without an email", () => {
    expect(suggestionSchema.safeParse({ ...base, marketing_consent: true }).success).toBe(false);
  });
  it("rejects a filled honeypot field", () => {
    expect(suggestionSchema.safeParse({ ...base, website: "spam.com" }).success).toBe(false);
  });
});
