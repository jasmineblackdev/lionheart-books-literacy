import { Link } from "@tanstack/react-router";
import type { Book } from "@/lib/site";

export function AmazonButton({ book, className = "" }: { book: Book; className?: string }) {
  return (
    <a href={book.amazon} target="_blank" rel="noopener noreferrer" className={`btn btn-gold ${className}`}>
      Buy {book.short} on Amazon
    </a>
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
            {book.price}
            <span className="ml-1 text-sm font-normal text-muted-foreground">on Amazon</span>
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <AmazonButton book={book} />
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
