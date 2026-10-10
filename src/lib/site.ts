import abcCover from "@/assets/abc-cover.jpg.asset.json";
import cursiveCover from "@/assets/cursive-cover.jpg.asset.json";
import guideCover from "@/assets/field-guide-cover.jpg.asset.json";
import abcAlligator from "@/assets/abc-alligator.jpg.asset.json";
import abcLion from "@/assets/abc-lion.jpg.asset.json";
import abcZebra from "@/assets/abc-zebra.jpg.asset.json";
import curRory from "@/assets/cursive-meet-rory.jpg.asset.json";
import curI from "@/assets/cursive-letter-i.jpg.asset.json";
import curA from "@/assets/cursive-capital-a.jpg.asset.json";
import curAlpha from "@/assets/cursive-alphabet.jpg.asset.json";
import guidePages from "@/assets/field-guide-pages.jpg.asset.json";
import sampleAbc from "@/assets/sample-abc.pdf.asset.json";
import sampleCursive from "@/assets/sample-cursive.pdf.asset.json";

export const SITE_URL = "https://lionheart-books-literacy.lovable.app";
export const EMAIL = "jblionheartbooks@gmail.com";

// TODO(owner): swap these Amazon search links for each book's exact listing URL.
const amazonSearch = (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;

export type Preview = { src: string; alt: string };
export type Book = {
  slug: "abc-animal-adventure" | "cursive-safari" | "rorys-safari-field-guide";
  title: string;
  short: string;
  ages: string;
  goal: string;
  tagline: string;
  description: string;
  facts: string[];
  parentBenefits: string[];
  teacherBenefits: string[];
  price?: string;
  pages?: string;
  cover: string;
  amazon: string;
  previews: Preview[];
  sample?: { url: string; label: string; contents: string };
  faqs: { q: string; a: string }[];
};

export const books: [Book, Book, Book] = [
  {
    slug: "abc-animal-adventure",
    title: "Color, Trace & Roar! ABC Animal Adventure",
    short: "ABC Animal Adventure",
    ages: "Ages 3–6 · Pre-K & Kindergarten",
    goal: "Learn the alphabet",
    tagline: "An alphabet tracing and coloring book with 26 friendly animals.",
    description:
      "Meet 26 friendly animals, from Alligator to Zebra. On every page your child colors a big, bold animal, traces the uppercase and lowercase letter, traces the animal's name and learns a fun fact to share.",
    facts: [
      "26 animals, one for each letter",
      "Uppercase and lowercase letter tracing",
      "Trace-the-word practice on every page",
      "A fun fact on every page",
      "Single-sided pages, so markers won't bleed through",
    ],
    parentBenefits: [
      "Short, one-page activities that fit quiet time",
      "Big shapes that suit small hands and crayons",
      "A fun fact to read and talk about together",
    ],
    teacherBenefits: [
      "Letter-of-the-day pages for preschool and kindergarten prep",
      "Simple, repeatable routine: color, trace, say it out loud",
    ],
    price: "$9.99",
    cover: abcCover.url,
    amazon: amazonSearch("ABC Animal Adventure J. B. Lionheart"),
    previews: [
      { src: abcAlligator.url, alt: "Sample page: A is for Alligator, with a dotted letter Aa, an alligator to color and the word alligator to trace" },
      { src: abcLion.url, alt: "Sample page: L is for Lion, with a dotted letter Ll, a cartoon lion to color and the word lion to trace" },
      { src: abcZebra.url, alt: "Sample page: Z is for Zebra, with a dotted letter Zz, a zebra to color and the word zebra to trace" },
    ],
    sample: {
      url: sampleAbc.url,
      label: "ABC Animal Adventure sample pages (PDF, 5 pages)",
      contents: "A name page with how-to-use steps plus A is for Alligator, L is for Lion and Z is for Zebra.",
    },
    faqs: [
      { q: "What age is ABC Animal Adventure for?", a: "Ages 3–6, which fits preschool, pre-K and kindergarten prep." },
      { q: "Can my child use markers?", a: "Yes. Pages are single-sided, so markers won't bleed onto the next activity." },
    ],
  },
  {
    slug: "cursive-safari",
    title: "Cursive Safari",
    short: "Cursive Safari",
    ages: "Grades 2–4 · Ages 7–10",
    goal: "Learn cursive handwriting",
    tagline: "A cursive handwriting workbook with Rory the lion.",
    description:
      "Join Rory the lion on a 128-page adventure through every lowercase and capital letter. Kids trace, copy and write their way from single letters to joins, words and whole sentences, and meet a real safari animal on every letter page.",
    facts: [
      "128 pages",
      "52 letters taught in stroke-family order",
      "Start dots, first-stroke arrows and numbered steps",
      "Joins, animal words and sentence practice",
      "26 animals to color, each with a true fact",
      "Safari Missions, passport stamps and a certificate",
    ],
    parentBenefits: [
      "Clear stroke steps, so you don't need to be a cursive expert",
      "Passport stamps and a certificate to keep kids motivated",
      "Builds from letters to real words and sentences",
    ],
    teacherBenefits: [
      "Letters grouped by stroke family for logical lesson order",
      "Copy and write-from-memory boxes for quick checks",
      "A full cursive alphabet reference page",
    ],
    price: "$12.99",
    pages: "128 pages",
    cover: cursiveCover.url,
    amazon: amazonSearch("Cursive Safari J. B. Lionheart"),
    previews: [
      { src: curI.url, alt: "Cursive Safari page: Letter i with stroke steps, a start dot and tracing rows" },
      { src: curA.url, alt: "Cursive Safari page: Capital A with stroke steps, tracing rows and the sentence An antelope is fast" },
      { src: curAlpha.url, alt: "Cursive Safari reference page showing the full lowercase and capital cursive alphabet" },
    ],
    sample: {
      url: sampleCursive.url,
      label: "Cursive Safari sample pages (PDF, 6 pages)",
      contents: "Meet Rory, Letter i, Join it: i, Capital A and the full cursive alphabet reference.",
    },
    faqs: [
      { q: "What grade is Cursive Safari for?", a: "Grades 2–4 (ages 7–10)." },
      { q: "What should kids write with?", a: "A pencil for writing practice and colored pencils for the animals." },
    ],
  },
  {
    slug: "rorys-safari-field-guide",
    title: "Rory's Safari Field Guide",
    short: "Rory's Safari Field Guide",
    ages: "Ages 6–10",
    goal: "Explore wild animals",
    tagline: "Color, learn and spot 50 real wild animals.",
    description:
      "Join Rory the lion on a safari around the world. From the savanna to the ocean, the rainforest to the snowy mountains, kids color 50 realistic animals, read a checked fact about each one and hunt for Rory's hidden paw print on every page.",
    facts: [
      "50 realistic animals from 7 habitats",
      "A source-checked fact on every page",
      "Hidden paw prints and Rory's lost items",
      "One-sided pages, so markers won't bleed through",
      "Checklist, answer key and Explorer certificate",
    ],
    parentBenefits: [
      "Calm, detailed coloring for curious older kids",
      "Seek-and-find challenges on every page",
      "Real facts that spark conversations about nature",
    ],
    teacherBenefits: [
      "Pairs well with habitat and animal science units",
      "Answer key included for seek-and-find challenges",
    ],
    cover: guideCover.url,
    amazon: amazonSearch("Rory's Safari Field Guide J. B. Lionheart"),
    previews: [
      { src: guidePages.url, alt: "Three Field Guide pages: a realistic lion, a leopard on a branch and an octopus, each with a field fact and challenge box" },
    ],
    faqs: [
      { q: "Are the animals cartoon or realistic?", a: "Realistic line drawings of 50 real animals from 7 habitats." },
      { q: "Is there a free sample?", a: "Not yet. The preview images on this page show real interior pages." },
    ],
  },
];

export const rory = curRory.url;
export const getBook = (slug: string) => books.find((b) => b.slug === slug);

export const generalFaqs = [
  { q: "Which book should I start with?", a: "Ages 3–6: ABC Animal Adventure. Grades 2–4 learning cursive: Cursive Safari. Ages 6–10 who love animals: Rory's Safari Field Guide." },
  { q: "Where can I buy the books?", a: "All three books are sold on Amazon. Each book card has its own Amazon button." },
  { q: "Are the sample pages really free?", a: "Yes. The sample PDFs may be printed and copied freely for home or classroom use. They are not for resale." },
  { q: "Can I suggest an idea for a future book?", a: "Yes! Use the Suggest a Book page. No email is needed, and sharing one doesn't sign you up for anything." },
  { q: "Do you offer class sets for schools?", a: "You can send a class-set inquiry with your quantity. We'll reply with options; pricing depends on the order." },
];

export function pageHead(opts: { title: string; description: string; path: string; image?: string }) {
  const url = `${SITE_URL}${opts.path}`;
  const meta: Record<string, string>[] = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (opts.image) {
    const img = `${SITE_URL}${opts.image}`;
    meta.push({ property: "og:image", content: img }, { name: "twitter:image", content: img });
  }
  return { meta, links: [{ rel: "canonical", href: url }] };
}
