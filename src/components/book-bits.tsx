import { Link } from "@tanstack/react-router";
import { recordAmazonClick } from "@/lib/clicks.functions";
import type { Book } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function AmazonButton({ book, className = "" }: { book: Book; className?: string }) {
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
      aria-label={`Buy ${book.short} on Amazon${book.price ? ` – ${book.price}` : ""}`}
    >
      Buy on Amazon{book.price && ` – ${book.price}`}
    </a>
    </Button>
  );
}

export function PurchaseButtons({ book }: { book: Book }) {
  return (
    <div className="grid grid-cols-2 items-start gap-3">
      <AmazonButton book={book} className="w-full" />
      <div className="min-w-0">
        <Button asChild variant="bookDigital" size="purchase" className="w-full">
          <a href={book.digital.url} target="_blank" rel="noopener noreferrer" aria-label={`${book.short}: Digital PDF – ${book.digital.price}`}>
            Digital PDF – {book.digital.price}
          </a>
        </Button>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Instant download. Print at home or trace on a tablet with a stylus.</p>
      </div>
    </div>
  );
}

export function BookCard({ book }: { book: Book }) {
  return (
    <article className="card-soft flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <Link to="/books/$slug" params={{ slug: book.slug }} className="block bg-secondary p-6">
        <img
          src={book.cover}
          alt={`${book.title} book cover`}
          width={621}
          height={810}
          loading="lazy"
          className="mx-auto aspect-[621/810] w-full max-w-xs rounded-lg object-cover shadow-lift"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow">{book.ages}</p>
        <h3 className="mt-1 text-2xl font-semibold leading-tight">
          <Link to="/books/$slug" params={{ slug: book.slug }} className="hover:text-terracotta">{book.title}</Link>
        </h3>
        <p className="mt-2 text-muted-foreground">{book.tagline}</p>
        <ul className="mt-4 flex-1 space-y-1.5 text-sm">
          {book.facts.slice(0, 3).map((f) => (
            <li key={f} className="flex gap-2"><span aria-hidden className="text-terracotta">●</span>{f}</li>
          ))}
        </ul>
        {book.price && (
          <p className="mt-auto pt-6 font-display text-xl font-semibold">
            Paperback {book.price}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <PurchaseButtons book={book} />
          <Link to="/books/$slug" params={{ slug: book.slug }} className="btn btn-outline">
            See inside {book.short}
          </Link>
        </div>
      </div>
    </article>
  );
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
