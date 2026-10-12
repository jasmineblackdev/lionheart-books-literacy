import { z } from "zod";

export const classSetSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(200),
  org: z.string().trim().min(1, "Please enter your school or organization.").max(200),
  email: z.string().trim().max(255).email("Please enter a valid email address."),
  quantity: z.coerce
    .number({ message: "Please enter an approximate quantity." })
    .int("Please enter a whole number.")
    .min(1, "Please enter an approximate quantity.")
    .max(100000),
  message: z.string().trim().max(2000, "Please keep your message under 2,000 characters.").optional().default(""),
  website: z.string().max(0).optional().default(""), // honeypot: must stay empty
});

export type ClassSetInput = z.input<typeof classSetSchema>;
export type ClassSetInquiry = z.output<typeof classSetSchema>;

export function classSetEmail(d: ClassSetInquiry) {
  return {
    subject: `Class-set inquiry: ${d.org}`,
    text: `Name: ${d.name}\nSchool/organization: ${d.org}\nEmail: ${d.email}\nApprox. quantity: ${d.quantity}\n\n${d.message}`,
  };
}
