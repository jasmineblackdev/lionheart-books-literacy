import { createFileRoute, Link } from "@tanstack/react-router";
import { BookCard, ComingSoonCard, Faq } from "@/components/book-bits";
import { books, comingSoon, generalFaqs, pageHead, rory } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "J. B. Lionheart Books | Alphabet Tracing, Cursive & Animal Coloring Books",
      description:
        "Color, Trace & Roar! learning books for kids: an ABC alphabet tracing book (ages 3–6), a cursive handwriting workbook (grades 2–4) and a wild animal coloring field guide. Free sample pages for teachers.",
      path: "/",
      image: books[1].cover,
    }),
  component: Index,
});

const finder = [
  { age: "Ages 3–6", goal: "Learning letters and first words", book: books[0] },
  { age: "Grades 2–4", goal: "Learning to read and write cursive", book: books[1] },
  { age: "Ages 6–10", goal: "Loves animals, coloring and seek-and-find", book: books[2] },
];

function Index() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
        <div>
          <p className="eyebrow">Color, Trace & Roar! books</p>
          <h1 className="mt-3 text-5xl font-extrabold leading-[1.05] md:text-6xl">
            Little Learners. <span className="text-terracotta">Big Adventures.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Alphabet tracing, cursive practice and wild-animal coloring books, guided by Rory the lion.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/" hash="books" className="btn btn-primary">Explore the Books</Link>
            <Link to="/teachers" className="btn btn-outline">Get Free Sample Pages</Link>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Now available on Amazon.</p>
        </div>
        <div className="relative mx-auto h-[270px] w-full max-w-md sm:h-[420px]" aria-hidden>
          <img src={books[0].cover} alt="" width={621} height={810} className="absolute left-0 top-10 w-[48%] -rotate-6 rounded-lg shadow-lift" />
          <img src={books[2].cover} alt="" width={621} height={810} className="absolute right-0 top-10 w-[48%] rotate-6 rounded-lg shadow-lift" />
          <img src={books[1].cover} alt="" width={621} height={810} className="absolute left-1/2 top-0 w-[54%] -translate-x-1/2 rounded-lg shadow-lift" />
        </div>
      </section>

      <section id="books" className="scroll-mt-20 bg-secondary px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-center">The books</p>
          <h2 className="mt-2 text-center text-4xl font-bold">Three books, one safari of learning</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {books.map((b) => <BookCard key={b.slug} book={b} />)}
          </div>
          {comingSoon.length > 0 && (
            <div className="mt-14">
              <h2 className="text-center text-3xl font-bold">Coming soon</h2>
              <div className="mx-auto mt-6 max-w-4xl space-y-6">
                {comingSoon.map((b) => <ComingSoonCard key={b.slug} book={b} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">Real pages</p>
        <h2 className="mt-2 text-4xl font-bold">Peek inside the books</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[books[0].previews[1], books[1].previews[0], books[1].previews[1], books[0].previews[0]].filter((p) => p !== undefined).map((p) => (
            <img key={p.src} src={p.src} alt={p.alt} width={935} height={1210} loading="lazy" className="card-soft aspect-[612/792] w-full object-cover p-0" />
          ))}
        </div>
        <img src={books[2].previews[0]?.src} alt={books[2].previews[0]?.alt ?? ""} width={1000} height={450} loading="lazy" className="card-soft mt-4 w-full" />
      </section>

      <section className="bg-secondary px-5 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-4xl font-bold">Find the right book for your learner</h2>
          <ul className="mt-8 space-y-4">
            {finder.map((f) => (
              <li key={f.age} className="card-soft grid items-center gap-4 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                <img src={f.book.cover} alt="" width={621} height={810} loading="lazy" className="hidden w-16 rounded sm:block" />
                <div className="min-w-0">
                  <p className="eyebrow">{f.age}</p>
                  <p className="font-display text-xl font-semibold">{f.goal}</p>
                  <p className="text-muted-foreground">Try {f.book.title}</p>
                </div>
                <Link to="/books/$slug" params={{ slug: f.book.slug }} className="btn btn-outline">
                  View {f.book.short}
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
          <img src={rory} alt="Meet Rory sample page: Rory the lion waving, with cursive words lion and Antelope" width={935} height={1210} loading="lazy" className="card-soft mx-auto w-full max-w-sm" />
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

      <section id="about" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-16 text-center">
        <p className="eyebrow">About</p>
        <h2 className="mt-2 text-4xl font-bold">About J. B. Lionheart</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          J. B. Lionheart creates the Color, Trace & Roar! books: hands-on workbooks that pair real skills, like letters and cursive, with animals kids love. Each book is designed to be printed-page simple, clearly structured and fun enough that kids ask for the next page.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="card-soft grid items-center gap-8 bg-secondary p-8 md:grid-cols-[auto_minmax(0,1fr)] md:p-12">
          <img src={books[2].cover} alt="" width={621} height={810} loading="lazy" className="mx-auto w-32 -rotate-3 rounded-lg shadow-lift md:w-40" />
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
