import { z } from "zod";
import { books, comingSoon } from "./site";

/** Books a school can ask about: everything for sale, everything coming soon, or "not sure yet". */
export const INQUIRY_BOOKS = [
  ...books.map((b) => ({ value: b.slug as string, label: b.short, group: "available" as const })),
  ...comingSoon.map((b) => ({ value: b.slug as string, label: b.short, group: "coming-soon" as const })),
  { value: "unsure", label: "Not sure yet: help me choose", group: "unsure" as const },
];
const BOOK_VALUES = INQUIRY_BOOKS.map((b) => b.value) as [string, ...string[]];

export const MAX_QUANTITY = 10000;

export const classSetSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(200),
  org: z.string().trim().min(1, "Please enter your school or organization.").max(200),
  email: z.string().trim().max(255).email("Please enter a valid email address."),
  books: z
    .array(z.enum(BOOK_VALUES))
    .min(1, "Choose at least one book, or “Not sure yet”.")
    .max(10),
  quantity: z.coerce
    .number({ message: "Enter a whole number of copies, like 30." })
    .int("Enter a whole number of copies, like 30.")
    .min(1, "Enter how many copies you need (at least 1).")
    .max(MAX_QUANTITY, `For more than ${MAX_QUANTITY.toLocaleString("en-US")} copies, please email us directly.`),
  message: z.string().trim().max(2000, "Please keep your message under 2,000 characters.").optional().default(""),
  website: z.string().max(0).optional().default(""), // honeypot: must stay empty
});

export type ClassSetInput = z.input<typeof classSetSchema>;
export type ClassSetInquiry = z.output<typeof classSetSchema>;

/** "Cursive Safari, Times Table Safari (coming soon)" for emails and confirmations. */
export function bookNames(values: readonly string[] | null | undefined) {
  return (values ?? [])
    .map((v) => {
      const b = INQUIRY_BOOKS.find((x) => x.value === v);
      if (!b) return v;
      if (b.group === "coming-soon") return `${b.label} (coming soon)`;
      return b.group === "unsure" ? "Not sure yet" : b.label;
    })
    .join(", ");
}

export function classSetEmail(d: ClassSetInquiry) {
  return {
    subject: `Class-set inquiry: ${d.org}`,
    text: `Name: ${d.name}\nSchool/organization: ${d.org}\nEmail: ${d.email}\nBooks: ${bookNames(d.books)}\nApprox. quantity: ${d.quantity}\n\n${d.message}`,
  };
}
