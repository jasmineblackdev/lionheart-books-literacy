import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Check, GraduationCap } from "lucide-react";
import { BookCard, ComingSoonBadge, Faq } from "@/components/book-bits";
import { Gallery } from "@/components/gallery";
import { PurchasePanel, StickyBuyBar } from "@/components/purchase";
import { isUpcoming } from "@/lib/catalog";
import { books, CATEGORIES, comingSoon, getBook, getUpcomingBook, pageHead, SITE_URL, type Book, type UpcomingBook } from "@/lib/site";

export const Route = createFileRoute("/books/$slug")({
  loader: ({ params }) => {
    const book: Book | UpcomingBook | undefined = getBook(params.slug) ?? getUpcomingBook(params.slug);
    if (!book) throw notFound();
    return book;
  },
  head: ({ loaderData: b }) => {
    if (!b) return {};
    const h = pageHead({
      title: `${b.title} | ${b.ages} | J. B. Lionheart`,
      description: isUpcoming(b)
        ? `${b.tagline} ${b.ages}. Coming soon from J. B. Lionheart. See real interior pages.`
        : `${b.tagline} ${b.ages}. See real interior pages and buy on Amazon.`,
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
  const upcoming = isUpcoming(b);
  // Related: books that share a learning category first, then the rest; never the book itself.
  const others = [...books, ...comingSoon].filter((x) => x.slug !== b.slug);
  const shares = (x: Book | UpcomingBook) => x.categories.some((c) => b.categories.includes(c));
  const related = [...others.filter(shares), ...others.filter((x) => !shares(x))].slice(0, 3);
  const categoryLabels = b.categories.map((c) => CATEGORIES.find((x) => x.value === c)?.label ?? c);

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-14 md:pb-20 md:pt-10">
        <div>
          <div className="rounded-[1.75rem] bg-sage-soft p-6 sm:p-10 md:sticky md:top-24">
            <img src={b.cover} alt={`${b.title} book cover`} width={621} height={810} fetchPriority="high" className="mx-auto w-full max-w-sm rounded-md shadow-lift" />
          </div>
        </div>

        <div className="min-w-0">
          <Link to="/" hash="books" className="text-sm font-semibold underline underline-offset-4">← All books</Link>
          {upcoming && <div className="mt-4"><ComingSoonBadge /></div>}
          <p className="eyebrow mt-4">{b.ages}</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-[1.08] md:text-5xl">{b.title}</h1>
          <p className="mt-3 text-lg font-semibold text-sage-ink">{b.tagline}</p>
          <p className="mt-4 text-lg leading-relaxed">{b.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border bg-card px-4 py-3">
              <dt className="text-muted-foreground">Ages &amp; grades</dt>
              <dd className="mt-0.5 font-semibold">{b.ages}</dd>
            </div>
            <div className="rounded-xl border bg-card px-4 py-3">
              <dt className="text-muted-foreground">Learning</dt>
              <dd className="mt-0.5 font-semibold">{categoryLabels.join(", ")}</dd>
            </div>
            {b.pages && (
              <div className="rounded-xl border bg-card px-4 py-3">
                <dt className="text-muted-foreground">Length</dt>
                <dd className="mt-0.5 font-semibold">{b.pages}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            {upcoming ? (
              <p className="rounded-2xl bg-secondary px-5 py-4 font-semibold">
                This book is coming soon. Paperback and digital links will appear here as soon as it's available.
              </p>
            ) : (
              <PurchasePanel book={b} />
            )}
          </div>

          <h2 className="mt-10 text-2xl font-extrabold">What's inside</h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {b.facts.map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-sage-ink" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="pages-heading" className="bg-secondary px-5 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 id="pages-heading" className="text-3xl font-extrabold">Look inside</h2>
          <p className="mt-1 text-muted-foreground">Real interior pages. Select a page to enlarge it.</p>
          <div className="mt-6"><Gallery images={b.previews} title={b.title} /></div>
        </div>
      </section>

      <section aria-labelledby="who-heading" className="mx-auto max-w-6xl px-5 py-14 md:py-16">
        <h2 id="who-heading" className="text-3xl font-extrabold">Who it's for</h2>
        <p className="mt-2 flex items-center gap-2 text-lg">
          <GraduationCap aria-hidden className="size-5 text-sage-ink" />
          <span><strong>{b.ages}.</strong> {b.goal}.</span>
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {[{ t: "For parents", l: b.parentBenefits }, { t: "For teachers & homeschoolers", l: b.teacherBenefits }].map((s) => (
            <div key={s.t} className="rounded-[1.25rem] border bg-card p-6 shadow-soft">
              <h3 className="text-xl font-extrabold">{s.t}</h3>
              <ul className="mt-3 space-y-2.5">
                {s.l.map((x) => (
                  <li key={x} className="flex gap-2.5"><Check aria-hidden className="mt-0.5 size-5 shrink-0 text-sage-ink" />{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-5 pb-14 md:pb-16">
        <h2 id="faq-heading" className="text-3xl font-extrabold">Questions about {b.short}</h2>
        <div className="mt-6"><Faq items={b.faqs} /></div>
      </section>

      <section aria-labelledby="related-heading" className="bg-secondary px-5 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 id="related-heading" className="text-3xl font-extrabold">More Color, Trace &amp; Roar! books</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <BookCard key={r.slug} book={r} />)}
          </div>
        </div>
      </section>

      {!upcoming && (
        <>
          <StickyBuyBar book={b} />
          <div aria-hidden className="h-20 md:hidden" />
        </>
      )}
    </>
  );
}
