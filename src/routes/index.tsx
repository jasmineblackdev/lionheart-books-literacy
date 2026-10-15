import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenCheck, PawPrint, School, Sparkles, type LucideIcon } from "lucide-react";
import { Faq } from "@/components/book-bits";
import { Catalog } from "@/components/catalog";
import { books, comingSoon, EMAIL, generalFaqs, pageHead, rory, SITE_URL } from "@/lib/site";
import { responsive } from "@/lib/images";

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageHead({
      title: "J. B. Lionheart Books | Color, Trace & Roar! Workbooks for Ages 3–10",
      description:
        "Color, Trace & Roar! learning books for kids ages 3–10: alphabet tracing, cursive handwriting, a wild animal coloring field guide, and new reading and math workbooks coming soon. Free sample pages for teachers.",
      path: "/",
      image: books[1].cover,
      imageAlt: "Cursive Safari book cover with Rory the lion",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "J. B. Lionheart Books",
          url: SITE_URL,
          email: EMAIL,
          founder: { "@type": "Person", name: "J. B. Lionheart" },
        }),
      },
    ],
  }),
  component: Index,
});

// Only claims the books themselves support; no testimonials, ratings or sales figures.
const valueProps: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: BookOpenCheck, title: "Real skills, one page at a time", text: "Short, clearly structured pages for tracing letters, writing cursive, reading closely and practicing math." },
  { icon: PawPrint, title: "Real animals, checked facts", text: "Kids learn alongside real animals. The animal facts in our newest books are checked against zoo, government and science sources." },
  { icon: School, title: "Made for home and classroom", text: "Free printable sample pages, clear grade guidance and class-set inquiries for teachers and homeschoolers." },
  { icon: Sparkles, title: "Guided by Rory the lion", text: "A friendly lion in a safari vest cheers kids on from the first page to the certificate at the end." },
];

function Index() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 md:grid-cols-[1.05fr_1fr] md:pb-24 md:pt-20">
          <div>
            <p className="eyebrow">Color, Trace &amp; Roar! workbooks</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-[1.02] md:text-6xl lg:text-7xl">
              Little Learners. <span className="text-terracotta">Big Adventures.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Hands-on workbooks for ages 3–10 that pair real skills (letters, cursive, reading and math) with the animals kids love, guided by Rory the lion.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/" hash="books" className="btn btn-primary px-7">Explore the Books</Link>
              <Link to="/teachers" className="btn btn-outline">Get Free Sample Pages</Link>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Now available on Amazon.</p>
          </div>
          <div className="relative mx-auto h-[300px] w-full max-w-md sm:h-[440px]" aria-hidden>
            <div className="absolute inset-x-6 bottom-0 top-8 rounded-[2.5rem] bg-sage-soft" />
            <div className="absolute -right-4 top-2 size-24 rounded-full bg-honey/60" />
            <img {...responsive(books[0].cover, "220px")} alt="" width={621} height={810} className="absolute left-0 top-14 w-[46%] -rotate-6 rounded-md shadow-lift" />
            <img {...responsive(books[2].cover, "220px")} alt="" width={621} height={810} className="absolute right-0 top-14 w-[46%] rotate-6 rounded-md shadow-lift" />
            <img {...responsive(books[1].cover, "240px")} alt="" width={621} height={810} fetchPriority="high" className="absolute left-1/2 top-2 w-[52%] -translate-x-1/2 rounded-md shadow-lift" />
          </div>
        </div>
      </section>

      <section aria-labelledby="why-heading" className="border-y bg-card px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 id="why-heading" className="sr-only">Why families and teachers choose Color, Trace &amp; Roar!</h2>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((v) => (
              <li key={v.title}>
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-sage-soft text-sage-ink">
                  <v.icon aria-hidden className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{v.title}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted-foreground">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="books" aria-labelledby="books-heading" className="scroll-mt-header bg-secondary px-5 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">The books</p>
          <h2 id="books-heading" className="mt-2 text-4xl font-extrabold md:text-5xl">Find the right book for your learner</h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {books.length} books available now and {comingSoon.length} on the way. Filter by age or what your child is learning.
          </p>
          <Catalog />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">Real pages</p>
        <h2 className="mt-2 text-4xl font-bold">Peek inside the books</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[books[0].previews[1], books[1].previews[0], books[1].previews[1], books[0].previews[0]].filter((p) => p !== undefined).map((p) => (
            <img key={p.src} {...responsive(p.src, "(min-width: 768px) 270px, 45vw")} alt={p.alt} width={935} height={1210} loading="lazy" className="card-soft aspect-[612/792] w-full object-cover p-0" />
          ))}
        </div>
        <img {...responsive(books[2].previews[0]!.src, "(min-width: 1152px) 1120px, 92vw")} alt={books[2].previews[0]?.alt ?? ""} width={1000} height={450} loading="lazy" className="card-soft mt-4 w-full" />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="card-soft grid gap-8 bg-primary p-8 text-primary-foreground md:grid-cols-[minmax(0,1fr)_auto] md:p-12">
          <div>
            <p className="eyebrow text-accent">For teachers, homeschoolers & schools</p>
            <h2 className="mt-2 text-4xl font-bold">Free sample pages for your classroom</h2>
            <p className="mt-3 max-w-xl opacity-90">
              Print and copy real pages from ABC Animal Adventure and Cursive Safari, free for home and classroom use. Ordering for a class? Send a class-set inquiry.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <Link to="/teachers" className="btn btn-gold">Get Free Sample Pages</Link>
            <Link to="/teachers" hash="class-sets" className="btn border-2 border-primary-foreground">Class-set inquiry</Link>
          </div>
        </div>
      </section>

      <section className="bg-secondary px-5 py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <img {...responsive(rory, "(min-width: 768px) 384px, 90vw")} alt="Meet Rory sample page: Rory the lion waving, with cursive words lion and Antelope" width={935} height={1210} loading="lazy" className="card-soft mx-auto w-full max-w-sm" />
          <div>
            <p className="eyebrow">Your safari guide</p>
            <h2 className="mt-2 text-4xl font-bold">Meet Rory</h2>
            <p className="mt-4 text-lg">
              Rory is a friendly lion in a safari vest who guides kids through every page. In Cursive Safari he cheers kids on with "Start at the dot!", and in the Field Guide he hides a paw print on every page.
            </p>
            <p className="mt-3 font-display text-2xl text-terracotta">"Ready? Let's roar!"</p>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-3xl scroll-mt-header px-5 py-16 text-center">
        <p className="eyebrow">About</p>
        <h2 className="mt-2 text-4xl font-bold">About J. B. Lionheart</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          J. B. Lionheart creates the Color, Trace & Roar! books: hands-on workbooks that pair real skills, like letters, cursive, reading and math, with animals kids love. Each book is designed to be printed-page simple, clearly structured and fun enough that kids ask for the next page.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="card-soft grid items-center gap-8 bg-secondary p-8 md:grid-cols-[auto_minmax(0,1fr)] md:p-12">
          <img {...responsive(books[2].cover, "160px")} alt="" width={621} height={810} loading="lazy" className="mx-auto w-32 -rotate-3 rounded-lg shadow-lift md:w-40" />
          <div>
            <p className="eyebrow">Your ideas matter</p>
            <h2 className="mt-2 text-4xl font-bold">Help Us Choose Our Next Adventure!</h2>
            <p className="mt-3 max-w-2xl text-lg">
              Your ideas help inspire our next books! Tell us what you'd love to see in future Lionheart books, from new coloring adventures to handwriting activities, puzzles, and educational discoveries.
            </p>
            <Link to="/suggest-a-book" className="btn btn-primary mt-6">Suggest a Book</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20">
        <h2 className="text-center text-4xl font-bold">Questions</h2>
        <div className="mt-8">
          <Faq items={generalFaqs} />
        </div>
      </section>
    </>
  );
}
