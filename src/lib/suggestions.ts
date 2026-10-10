import { z } from "zod";

export const CATEGORIES = [
  { value: "coloring", label: "Coloring & activity books" },
  { value: "handwriting", label: "Handwriting & cursive" },
  { value: "puzzles", label: "Puzzles & brain games" },
  { value: "animal-facts", label: "Animal facts & educational adventures" },
  { value: "other", label: "Other" },
] as const;

export const AUDIENCES = [
  { value: "3-6", label: "Ages 3–6" },
  { value: "7-10", label: "Ages 7–10" },
  { value: "11+", label: "Ages 11+" },
  { value: "adults", label: "Adults" },
  { value: "teachers", label: "Teachers / classrooms" },
] as const;

export const STATUSES = [
  { value: "new", label: "New" },
  { value: "under_consideration", label: "Under consideration" },
  { value: "planned", label: "Planned" },
  { value: "declined", label: "Declined" },
] as const;

type Vals<T extends readonly { value: string }[]> = [T[number]["value"], ...T[number]["value"][]];
const vals = <T extends readonly { value: string }[]>(a: T) => a.map((x) => x.value) as Vals<T>;

export const suggestionSchema = z
  .object({
    category: z.enum(vals(CATEGORIES), { message: "Please choose a kind of book." }),
    intended_audience: z.enum(vals(AUDIENCES), { message: "Please choose who the book is for." }),
    idea: z.string().trim().max(1000, "Please keep your idea under 1,000 characters.").optional().default(""),
    email: z
      .string()
      .trim()
      .max(255)
      .optional()
      .default("")
      .refine((v) => v === "" || z.string().email().safeParse(v).success, "Please enter a valid email address, or leave it blank."),
    marketing_consent: z.boolean().default(false),
    website: z.string().max(0).optional().default(""), // honeypot: must stay empty
  })
  .refine((d) => !d.marketing_consent || d.email !== "", {
    message: "Add an email address to receive release updates.",
    path: ["email"],
  });

export type SuggestionInput = z.input<typeof suggestionSchema>;
export const statusSchema = z.enum(vals(STATUSES));
export const labelOf = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((x) => x.value === v)?.label ?? v;

/** Max suggestions per visitor (by hashed IP) per hour. */
export const RATE_LIMIT_PER_HOUR = 5;
