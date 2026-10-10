import { createFileRoute } from "@tanstack/react-router";
import abc from "@/assets/abc-cover.jpg.asset.json";
import cursive from "@/assets/cursive-cover.jpg.asset.json";
import guide from "@/assets/field-guide-cover.jpg.asset.json";
import sampleAbc from "@/assets/sample-abc.pdf.asset.json";
import sampleCursive from "@/assets/sample-cursive.pdf.asset.json";

// Replace with the real details when ready.
const EMAIL = "hello@colortraceroar.com";
const AMAZON = {
  abc: "https://www.amazon.com/",
  cursive: "https://www.amazon.com/",
  guide: "https://www.amazon.com/",
};

const books = [
  { title: "Color, Trace & Roar! ABC Animal Adventure", ages: "Ages 3–6", blurb: "26 friendly animals from Alligator to Zebra. Color, trace every letter and learn a fun fact.", img: abc.url, link: AMAZON.abc },
  { title: "Cursive Safari", ages: "Grades 2–4 · Ages 7–10", blurb: "A 128-page cursive workbook with Rory the lion. Letters, joins, words and sentences.", img: cursive.url, link: AMAZON.cursive },
  { title: "Rory's Safari Field Guide", ages: "Ages 6–10", blurb: "Color 50 real wild animals from 7 habitats, each with a checked true fact.", img: guide.url, link: AMAZON.guide },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Color, Trace & Roar! — Kids' Books by J. B. Lionheart" },
      { name: "description", content: "Safari-themed coloring, tracing and cursive workbooks for kids. Free sample pages for teachers and class-set offers for schools." },
      { property: "og:title", content: "Color, Trace & Roar! — Kids' Books by J. B. Lionheart" },
      { property: "og:description", content: "Safari coloring, tracing and cursive workbooks for kids, plus free sample pages for teachers." },
    ],
  }),
  component: Index,
});

const btn = "inline-flex items-center justify-center rounded-full px-6 py-3 font-display text-lg font-semibold transition-transform hover:-translate-y-0.5";

function Index() {
  return (
    <main className="min-h-screen">
      <header className="bg-navy px-6 py-16 text-center text-background">
        <p className="font-display text-sun tracking-wide">J. B. Lionheart presents</p>
        <h1 className="mt-2 text-5xl font-bold md:text-7xl">
          Color, Trace <span className="text-primary">&</span> Roar!
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">
          Safari adventure workbooks that make letters, cursive and wild animals fun.
        </p>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-4xl font-bold">The Books</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {books.map((b) => (
            <article key={b.title} className="flex flex-col rounded-3xl bg-card p-5 shadow-lg">
              <img src={b.img} alt={`${b.title} cover`} className="aspect-[621/810] w-full rounded-2xl object-cover" loading="lazy" />
              <p className="mt-4 text-sm font-bold text-primary">{b.ages}</p>
              <h3 className="text-2xl font-semibold leading-tight">{b.title}</h3>
              <p className="mt-2 flex-1 text-muted-foreground">{b.blurb}</p>
              <a href={b.link} target="_blank" rel="noopener noreferrer" className={`${btn} mt-5 bg-primary text-primary-foreground`}>
                Buy on Amazon
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-4xl font-bold">Teachers & Schools</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-card p-6">
              <h3 className="text-2xl font-semibold">Free sample pages</h3>
              <p className="mt-2 text-muted-foreground">Print-ready PDFs to try in class.</p>
              <div className="mt-4 flex flex-col gap-3">
                <a href={sampleAbc.url} download className={`${btn} bg-navy text-background`}>ABC Animal Adventure (PDF)</a>
                <a href={sampleCursive.url} download className={`${btn} bg-navy text-background`}>Cursive Safari (PDF)</a>
              </div>
            </div>
            <div className="rounded-3xl bg-card p-6">
              <h3 className="text-2xl font-semibold">North Carolina cursive law</h3>
              <p className="mt-2 text-muted-foreground">
                NC law requires public schools to teach cursive so students can write legibly in cursive by the end of 5th grade. Cursive Safari covers all 52 letters, joins and sentences to help meet it.
              </p>
            </div>
            <div className="rounded-3xl bg-accent p-6 md:col-span-2">
              <h3 className="text-2xl font-semibold">Class sets</h3>
              <p className="mt-2">Ordering for a whole class or school? Email for class-set pricing.</p>
              <a href={`mailto:${EMAIL}?subject=Class%20set%20inquiry`} className={`${btn} mt-4 bg-navy text-background`}>Ask about class sets</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 py-12 text-center">
        <h2 className="text-3xl font-bold">Say hello</h2>
        <a href={`mailto:${EMAIL}`} className="mt-2 inline-block text-lg font-bold text-primary underline">{EMAIL}</a>
        <p className="mt-6 text-sm text-muted-foreground">© {new Date().getFullYear()} J. B. Lionheart</p>
      </footer>
    </main>
  );
}
