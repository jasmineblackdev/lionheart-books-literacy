import abcCover from "@/assets/abc-cover.jpg";
import cursiveCover from "@/assets/cursive-cover.jpg";
import guideCover from "@/assets/field-guide-cover.jpg";
import abcAlligator from "@/assets/abc-alligator.jpg";
import abcLion from "@/assets/abc-lion.jpg";
import abcZebra from "@/assets/abc-zebra.jpg";
import curRory from "@/assets/cursive-meet-rory.jpg";
import curI from "@/assets/cursive-letter-i.jpg";
import curA from "@/assets/cursive-capital-a.jpg";
import curAlpha from "@/assets/cursive-alphabet.jpg";
import guidePages from "@/assets/field-guide-pages.jpg";
import sampleAbc from "@/assets/sample-abc.pdf";
import sampleCursive from "@/assets/sample-cursive.pdf";
import detectivesCover from "@/assets/reading-detectives-cover.jpg";
import detectivesPassage from "@/assets/reading-detectives-passage.jpg";
import detectivesQuestions from "@/assets/reading-detectives-questions.jpg";
import detectivesColor from "@/assets/reading-detectives-color-by-clue.jpg";
import timesCover from "@/assets/times-table-cover.jpg";
import timesMeet from "@/assets/times-table-meet-the-facts.jpg";
import timesMaze from "@/assets/times-table-skip-count-maze.jpg";
import timesCode from "@/assets/times-table-crack-the-code.jpg";
import mathCover from "@/assets/math-detectives-cover.jpg";
import mathCaseFile from "@/assets/math-detectives-case-file.jpg";
import mathSolve from "@/assets/math-detectives-solve-the-case.jpg";
import mathMeasure from "@/assets/math-detectives-feather-measuring.jpg";

export const SITE_URL = "https://lionheart-books-literacy.vercel.app";
export const EMAIL = "jblionheartbooks@gmail.com";

// TODO(owner): swap the remaining Amazon search link (ABC Animal Adventure) for its exact listing URL.
const amazonSearch = (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;

export type Preview = { src: string; alt: string };
/** Learning categories used by the home page catalog filters. */
export const CATEGORIES = [
  { value: "letters", label: "Letters & handwriting" },
  { value: "reading", label: "Reading" },
  { value: "math", label: "Math" },
  { value: "animals", label: "Animals & coloring" },
] as const;
export type Category = (typeof CATEGORIES)[number]["value"];

/** Age filters; a book matches when its age range overlaps the group. */
export const AGE_GROUPS = [
  { value: "3-6", label: "Ages 3–6", range: [3, 6] },
  { value: "7-8", label: "Ages 7–8", range: [7, 8] },
  { value: "9-10", label: "Ages 9–10", range: [9, 10] },
] as const;

export type Book = {
  slug: "abc-animal-adventure" | "cursive-safari" | "rorys-safari-field-guide";
  title: string;
  short: string;
  ages: string;
  /** Youngest and oldest age the book is for, from its cover. */
  ageRange: [number, number];
  categories: Category[];
  goal: string;
  tagline: string;
  description: string;
  facts: string[];
  parentBenefits: string[];
  teacherBenefits: string[];
  price?: string;
  paperbackAvailable: boolean;
  digital: { price: string; url: string };
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
    ageRange: [3, 6],
    categories: ["letters", "animals"],
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
    paperbackAvailable: true,
    digital: { price: "$5.99", url: "https://payhip.com/b/heOAD" },
    cover: abcCover,
    amazon: amazonSearch("ABC Animal Adventure J. B. Lionheart"),
    previews: [
      { src: abcAlligator, alt: "Sample page: A is for Alligator, with a dotted letter Aa, an alligator to color and the word alligator to trace" },
      { src: abcLion, alt: "Sample page: L is for Lion, with a dotted letter Ll, a cartoon lion to color and the word lion to trace" },
      { src: abcZebra, alt: "Sample page: Z is for Zebra, with a dotted letter Zz, a zebra to color and the word zebra to trace" },
    ],
    sample: {
      url: sampleAbc,
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
    ageRange: [7, 10],
    categories: ["letters"],
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
    paperbackAvailable: true,
    digital: { price: "$7.99", url: "https://payhip.com/b/qaUHk" },
    pages: "128 pages",
    cover: cursiveCover,
    amazon: "https://www.amazon.com/dp/B0HMP263KH",
    previews: [
      { src: curI, alt: "Cursive Safari page: Letter i with stroke steps, a start dot and tracing rows" },
      { src: curA, alt: "Cursive Safari page: Capital A with stroke steps, tracing rows and the sentence An antelope is fast" },
      { src: curAlpha, alt: "Cursive Safari reference page showing the full lowercase and capital cursive alphabet" },
    ],
    sample: {
      url: sampleCursive,
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
    ageRange: [6, 10],
    categories: ["animals"],
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
    price: "$10.99",
    paperbackAvailable: true,
    digital: { price: "$6.99", url: "https://payhip.com/b/fNdyi" },
    cover: guideCover,
    amazon: amazonSearch("Rory's Safari Field Guide J. B. Lionheart"),
    previews: [
      { src: guidePages, alt: "Three Field Guide pages: a realistic lion, a leopard on a branch and an octopus, each with a field fact and challenge box" },
    ],
    faqs: [
      { q: "Are the animals cartoon or realistic?", a: "Realistic line drawings of 50 real animals from 7 habitats." },
      { q: "Is there a free sample?", a: "Not yet. The preview images on this page show real interior pages." },
    ],
  },
];

/** A book that's announced but not for sale yet: no prices, purchase links or sales tracking. */
export type UpcomingBook = Pick<
  Book,
  "title" | "short" | "ages" | "ageRange" | "categories" | "goal" | "tagline" | "description" | "facts" | "parentBenefits" | "teacherBenefits" | "pages" | "cover" | "previews" | "faqs"
> & { slug: "safari-reading-detectives" | "times-table-safari" | "safari-math-detectives"; status: "coming-soon" };

export const comingSoon: UpcomingBook[] = [
  {
    slug: "safari-reading-detectives",
    status: "coming-soon",
    title: "Safari Reading Detectives",
    short: "Safari Reading Detectives",
    ages: "Grades 2–3 · Ages 7–9",
    ageRange: [7, 9],
    categories: ["reading", "animals"],
    goal: "Build reading comprehension",
    tagline: "40 true animal cases to read, solve and color.",
    description:
      "Join Rory the lion on 40 reading cases about real animals, from an ostrich dad on the night shift to a spider that eats its own web. Kids read a short, true passage, answer the questions, and prove each answer with clues from the text. Every case ends with a hands-on Detective Activity.",
    facts: [
      "40 true passages that get a little harder unit by unit",
      "Main idea, details, vocabulary and inference questions",
      "Color by Clue, dot-to-dots, comics, labeling and word match",
      "Compare pages with a Venn diagram in every unit",
      "Answer key, glossary and a Reading Detective certificate",
      "Every fact checked against zoo, government and science sources",
    ],
    parentBenefits: [
      "One case a day takes about 15–20 minutes, so the book lasts about 10 weeks",
      "Builds the habit of looking back at the passage to prove each answer",
      "Answer key, glossary and fact sources at the back",
    ],
    teacherBenefits: [
      "Four-choice questions on main idea, details, vocabulary in context and inference, like state reading tests",
      "Practice in the reading skills North Carolina students are tested on",
      "Eight themed units, each ending with a compare-two-animals page",
    ],
    pages: "156 pages",
    cover: detectivesCover,
    previews: [
      { src: detectivesPassage, alt: "Safari Reading Detectives Case 1, The Ostrich Nest: a short true passage with a Detective Word, a Fast Fact and an ostrich picture" },
      { src: detectivesQuestions, alt: "Safari Reading Detectives Solve the Case page: four multiple-choice questions tagged Main Idea, Clue, Word and Why, plus a written answer" },
      { src: detectivesColor, alt: "Safari Reading Detectives Color by Clue page: an ostrich on its nest to color using clues from the passage" },
    ],
    faqs: [
      { q: "What grade is Safari Reading Detectives for?", a: "Grades 2–3 (ages 7–9). Passages start short in Unit 1 and grow a little longer unit by unit." },
      { q: "When can I buy it?", a: "It's coming soon. Paperback and digital links will appear on this page as soon as it's available." },
      { q: "What should kids write with?", a: "A pencil and colored pencils. Markers may bleed through the page." },
    ],
  },
  {
    slug: "times-table-safari",
    status: "coming-soon",
    title: "Times Table Safari",
    short: "Times Table Safari",
    ages: "Grades 3–4 · Ages 8–10",
    ageRange: [8, 10],
    categories: ["math"],
    goal: "Learn the times tables",
    tagline: "Count it. Color it. Remember it! Every multiplication fact from ×0 to ×10.",
    description:
      "Join Rory the lion on a 10-stop safari through every times table, from ×0 to ×10. At each Safari Stop, kids meet a real animal (zebra legs for ×4, octopus arms for ×8), learn the facts with a memory trick, and practice until the facts stick. Great for third and fourth graders at home, in the classroom or over the summer.",
    facts: [
      "10 Safari Stops covering every fact from ×0 to ×10",
      "Easy facts first, then the tricky ones, one stop at a time",
      "Skip-count mazes, mystery pictures and secret-code jokes",
      "Story problems and a timed Speed Round in every stop",
      "3 mixed reviews and a times table chart with a pattern hunt",
      "Safari Race board game, bingo cards and 48 cut-out flash cards",
      "Answer key and a Times Table Explorer certificate",
    ],
    parentBenefits: [
      "One page a day, about 10–15 minutes, finishes the book in about 12 weeks",
      "Redo each Speed Round on three different days and celebrate a faster time",
      "Board game, bingo and flash cards make an easy family game night",
    ],
    teacherBenefits: [
      "Facts taught easiest first (×0, ×1, ×2, ×10, ×5), then used to build the harder ones",
      "Practice in the multiplication skills North Carolina students are tested on",
      "Copy pages for one household or one classroom",
    ],
    pages: "76 pages",
    cover: timesCover,
    previews: [
      { src: timesMeet, alt: "Times Table Safari Stop 2 Meet the ×2 Facts page: counting ostrich legs in groups, skip-counting tracks, a memory trick and an array to color" },
      { src: timesMaze, alt: "Times Table Safari Skip-Count Maze: a number grid where kids find the one path that counts by 2s" },
      { src: timesCode, alt: "Times Table Safari Crack the Code page: solve ×2 facts to decode an ostrich joke, plus a fact family triangle" },
    ],
    faqs: [
      { q: "What grade is Times Table Safari for?", a: "Grades 3–4 (ages 8–10). Third graders in North Carolina are expected to multiply fluently with factors up to 10, and this book gives practice in those skills." },
      { q: "When can I buy it?", a: "It's coming soon. Paperback and digital links will appear on this page as soon as it's available." },
      { q: "How long does it take?", a: "One page a day, about 10–15 minutes, finishes the book in about 12 weeks." },
    ],
  },
  {
    slug: "safari-math-detectives",
    status: "coming-soon",
    title: "Safari Math Detectives",
    short: "Safari Math Detectives",
    ages: "Grades 2–3 · Ages 7–9",
    ageRange: [7, 9],
    categories: ["math"],
    goal: "Solve math word problems",
    tagline: "Find the clues. Do the math! 40 true animal cases to solve with math.",
    description:
      "Join Rory the lion on 40 math cases built on true animal facts, from ostrich eggs to orb-weaver webs. Each case starts with real evidence about an animal, then kids crack a word problem using a simple 4-step detective method: Clues, Question, Plan, Solve & Check. Every case ends with a hands-on Detective Activity. Great for second and third graders at home, in the classroom, for summer practice or test prep.",
    facts: [
      "40 word-problem cases in 8 units that get a little harder as kids go",
      "Add and subtract within 100, place value to 1,000, multiplication and division",
      "Time to the minute, counting coins, measuring with a ruler, graphs, area, perimeter and fractions",
      "Multiple-choice questions in a test-style format, plus a two-step problem in every case",
      "Hands-on activities: draw bar graphs, read and draw clocks, count coins, measure lines, color arrays and fractions, and decode secret-code jokes",
      "A Detective Review after every unit and a mixed-skill Final Case",
      "Math Tool Kit with a number line and hundreds chart, a Case Tracker, an answer key and an Official Math Detective certificate",
    ],
    parentBenefits: [
      "A simple 4-step detective method: Clues, Question, Plan, Solve & Check",
      "Each case starts with real evidence about an animal, so the math has a story",
      "Great for summer practice or test prep at home",
    ],
    teacherBenefits: [
      "Units 1–4 practice second-grade skills and step up into third grade; Units 5–8 practice third-grade skills",
      "Practice in the math skills North Carolina students are tested on, with the standards listed for each unit",
      "Copy pages for one household or one classroom",
    ],
    pages: "141 pages",
    cover: mathCover,
    previews: [
      { src: mathCaseFile, alt: "Safari Math Detectives Case 1, The Ostrich Egg Line: true ostrich facts, a word problem and boxes for clues, question, plan, and solve and check" },
      { src: mathSolve, alt: "Safari Math Detectives Solve the Case page: four multiple-choice word problems and a two-step problem about ostriches" },
      { src: mathMeasure, alt: "Safari Math Detectives Feather Measuring activity: measure four feathers with an inch ruler and answer questions" },
    ],
    faqs: [
      { q: "What grade is Safari Math Detectives for?", a: "Second and third graders (ages 7–9). Units 1–4 practice second-grade skills and step up into third grade; Units 5–8 practice third-grade skills." },
      { q: "When can I buy it?", a: "It's coming soon. Paperback and digital links will appear on this page as soon as it's available." },
      { q: "How should I print the measuring pages?", a: "Print or copy them at 100% size so the lines match a real ruler." },
    ],
  },
];

export const rory = curRory;
export const getBook = (slug: string) => books.find((b) => b.slug === slug);
export const getUpcomingBook = (slug: string) => comingSoon.find((b) => b.slug === slug);

export const generalFaqs = [
  { q: "Which book should I start with?", a: "Ages 3–6: ABC Animal Adventure. Grades 2–4 learning cursive: Cursive Safari. Ages 6–10 who love animals: Rory's Safari Field Guide." },
  { q: "Where can I buy the books?", a: "All three paperbacks are sold on Amazon. All three books are also available as digital PDFs on Payhip." },
  { q: "Is there a digital version?", a: "Yes. Each book is available as a printable PDF you can use at home or on a tablet with a stylus. A digital copy is licensed for one household or one classroom. Please don't share or resell it." },
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
