import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { BookCard, Faq, PurchaseButtons } from "@/components/book-bits";
import { books, getBook, pageHead, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/books/$slug")({
  loader: ({ params }) => {
    const book = getBook(params.slug);
    if (!book) throw notFound();
    return book;
  },
  head: ({ loaderData: b }) => {
    if (!b) return {};
    const h = pageHead({
      title: `${b.title} | ${b.ages} | J. B. Lionheart`,
      description: `${b.tagline} ${b.ages}. See real interior pages and buy on Amazon.`,
      path: `/books/${b.slug}`,
      image: b.cover,
    });
    return {
      ...h,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: b.title,
            author: { "@type": "Person", name: "J. B. Lionheart" },
            image: `${SITE_URL}${b.cover}`,
            description: b.description,
            ...(b.pages ? { numberOfPages: parseInt(b.pages) } : {}),
          }),
        },
      ],
    };
  },
  component: BookPage,
});

function BookPage() {
  const b = Route.useLoaderData();
  const related = books.filter((x) => x.slug !== b.slug);
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[2fr_3fr] md:py-16">
        <img src={b.cover} alt={`${b.title} book cover`} width={621} height={810} className="mx-auto w-full max-w-sm rounded-lg shadow-lift" />
        <div>
          <Link to="/" hash="books" className="text-sm font-semibold underline underline-offset-4">← All books</Link>
          <p className="eyebrow mt-4">{b.ages}</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight md:text-5xl">{b.title}</h1>
          <p className="mt-4 text-lg">{b.description}</p>
          {b.pages && <p className="mt-4 text-sm text-muted-foreground">{b.pages}</p>}
          {b.price && (
            <p className="mt-3 font-display text-3xl font-bold">
              Paperback {b.price}
            </p>
          )}
          <div className="mt-6"><PurchaseButtons book={b} /></div>
          {b.sample && (
            <a href={b.sample.url} download className="btn btn-outline mt-3 w-full sm:w-auto">Download free sample pages</a>
          )}
          <h2 className="mt-10 text-2xl font-semibold">What's inside</h2>
          <ul className="mt-3 space-y-2">
            {b.facts.map((f) => <li key={f} className="flex gap-2"><span aria-hidden className="text-terracotta">●</span>{f}</li>)}
          </ul>
        </div>
      </section>

      <section className="bg-secondary px-5 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold">Real interior pages</h2>
          <div className={`mt-6 grid gap-4 ${b.previews.length > 1 ? "sm:grid-cols-3" : ""}`}>
            {b.previews.map((p) => (
              <img key={p.src} src={p.src} alt={p.alt} loading="lazy" className="card-soft w-full" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-14 md:grid-cols-2">
        {[{ t: "For parents", l: b.parentBenefits }, { t: "For teachers & homeschoolers", l: b.teacherBenefits }].map((s) => (
          <div key={s.t} className="card-soft p-6">
            <h2 className="text-2xl font-semibold">{s.t}</h2>
            <ul className="mt-3 space-y-2">{s.l.map((x) => <li key={x}>✓ {x}</li>)}</ul>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-14">
        <h2 className="text-3xl font-bold">Questions about {b.short}</h2>
        <div className="mt-6"><Faq items={b.faqs} /></div>
        <div className="mx-auto mt-8 max-w-xl"><PurchaseButtons book={b} /></div>
      </section>

      <section className="bg-secondary px-5 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold">More Color, Trace & Roar! books</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">{related.map((r) => <BookCard key={r.slug} book={r} />)}</div>
        </div>
      </section>
    </>
  );
}
