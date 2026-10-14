import { Link } from "@tanstack/react-router";
import { recordAmazonClick } from "@/lib/clicks.functions";
import { isUpcoming } from "@/lib/catalog";
import type { Book, UpcomingBook } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { responsive } from "@/lib/images";

export function AmazonButton({ book, className = "", showPrice = true }: { book: Book; className?: string; showPrice?: boolean }) {
  if (!book.paperbackAvailable) {
    return <Button disabled variant="bookUnavailable" size="purchase" className={className}>Paperback coming soon to Amazon</Button>;
  }
  return (
    <Button asChild variant="bookAmazon" size="purchase" className={className}>
    <a
      href={book.amazon}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => void recordAmazonClick({ data: { slug: book.slug } }).catch(() => {})}
      aria-label={`Buy on Amazon${showPrice && book.price ? ` – ${book.price}` : ""}: ${book.short} paperback`}
    >
      Buy on Amazon{showPrice && book.price && ` – ${book.price}`}
    </a>
    </Button>
  );
}

/** Catalog card for any book: cover, grade, one-line benefit, price (available books only) and View Book. */
export function BookCard({ book, headingLevel = 3 }: { book: Book | UpcomingBook; headingLevel?: 2 | 3 | 4 }) {
  const upcoming = isUpcoming(book);
  const H = (["h2", "h3", "h4"] as const)[headingLevel - 2]!;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.25rem] border bg-card shadow-soft transition-shadow hover:shadow-lift has-[a:focus-visible]:shadow-lift has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ring">
      <div className="relative bg-sage-soft px-8 pb-5 pt-10 sm:pb-6 sm:pt-8">
        {upcoming && <ComingSoonBadge className="absolute left-4 top-4 z-10 shadow-soft" />}
        <img
          {...responsive(book.cover, "(min-width: 640px) 240px, 176px")}
          alt={`${book.title} book cover`}
          width={621}
          height={810}
          loading="lazy"
          decoding="async"
          className="mx-auto aspect-[621/810] w-full max-w-[11rem] rounded-md sm:max-w-[15rem] object-cover shadow-lift transition-transform duration-200 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow">{book.ages}</p>
        <H className="mt-1.5 text-xl font-extrabold leading-snug">
          {/* The title link covers the whole card, so the card is one keyboard stop. */}
          <Link to="/books/$slug" params={{ slug: book.slug }} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {book.title}
          </Link>
        </H>
        <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted-foreground">{book.tagline}</p>
        <div className="mt-5 flex items-end justify-between gap-3 border-t pt-4">
          {upcoming ? (
            <p className="text-sm font-semibold text-sage-ink">Not available yet</p>
          ) : (
            <p className="text-sm leading-tight">
              <span className="block font-display text-lg font-extrabold">{book.price ? `Paperback ${book.price}` : "Paperback"}</span>
              <span className="text-muted-foreground">Digital PDF {book.digital.price}</span>
            </p>
          )}
          <span aria-hidden className="btn btn-primary shrink-0 px-4 py-2 text-sm">
            {upcoming ? "Preview the book" : "View Book"}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ComingSoonBadge({ className = "" }: { className?: string }) {
  return <span className={`inline-block rounded-full bg-accent px-3 py-1 text-sm font-bold uppercase tracking-wide text-accent-foreground ${className}`}>Coming soon</span>;
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <details key={f.q} className="card-soft group p-5">
          <summary className="cursor-pointer list-none font-display text-lg font-semibold">
            <span className="mr-2 text-terracotta group-open:hidden">+</span>
            <span className="mr-2 hidden text-terracotta group-open:inline">–</span>
            {f.q}
          </summary>
          <p className="mt-3 text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
