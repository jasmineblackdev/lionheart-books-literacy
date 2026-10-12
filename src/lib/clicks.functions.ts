import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { books } from "./site";

const slugs = books.map((b) => b.slug) as [string, ...string[]];

/** Counts a "Buy on Amazon" click for the /admin dashboard. Never throws to the caller. */
export const recordAmazonClick = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ slug: z.enum(slugs) }).parse(d))
  .handler(async ({ data }) => {
    const { requestIpHash, saveSubmission } = await import("./forms.server");
    const saved = await saveSubmission("amazon_click", { book_slug: data.slug }, await requestIpHash());
    return { ok: saved.ok };
  });
