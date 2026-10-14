import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { PageTitle } from "@/components/admin/shell";
import { useAdminData, withDefaults } from "@/components/admin/use-admin";
import { formatCents, summarize } from "@/lib/sales";
import { books, comingSoon } from "@/lib/site";

export const Route = createFileRoute("/admin/books")({ component: BooksPage });

/** Amazon search links are placeholders until the book's own listing URL is added. */
const isSearchLink = (url: string) => /amazon\.[a-z.]+\/s\?/.test(url);

function BooksPage() {
  const q = useAdminData();
  if (!q.data) return null;
  const { sales, clicks } = withDefaults(q.data);
  const totals = new Map(summarize(sales, clicks).map((s) => [s.book.slug, s]));

  return (
    <>
      <PageTitle title="My Books" subtitle="What each book's page and buttons show on the website" />
      <ul className="mt-6 space-y-6">
        {books.map((b) => {
          const t = totals.get(b.slug);
          const search = isSearchLink(b.amazon);
          return (
            <li key={b.slug} className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <img src={b.cover} alt={`${b.title} cover`} width={621} height={810} loading="lazy" className="w-32 rounded-lg shadow-soft" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold">{b.title}</h2>
                  <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${b.paperbackAvailable ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                    {b.paperbackAvailable ? "Published" : "Paperback coming soon"}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{b.ages} · {b.goal}</p>
                <p className="mt-2">{b.tagline}</p>

                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <Row label="Paperback price">{b.price ?? "Not set"}</Row>
                  <Row label="Digital PDF price">{b.digital.price}</Row>
                  <Row label="Amazon link">
                    <a href={b.amazon} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
                      Open <ExternalLink aria-hidden className="size-3.5" />
                    </a>
                    {search ? (
                      <span className="ml-2 inline-flex items-center gap-1 text-destructive">
                        <AlertTriangle aria-hidden className="size-4" /> Search link: exact listing not added yet
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center gap-1 text-success">
                        <CheckCircle2 aria-hidden className="size-4" /> Book's own page
                      </span>
                    )}
                  </Row>
                  <Row label="Payhip link">
                    <a href={b.digital.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
                      Open <ExternalLink aria-hidden className="size-3.5" />
                    </a>
                  </Row>
                  <Row label="Free sample PDF">{b.sample ? <a href={b.sample.url} target="_blank" rel="noopener noreferrer" className="underline">Yes, open it</a> : "None"}</Row>
                  <Row label="Preview images">{b.previews.length}</Row>
                </dl>

                {t && (
                  <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm">
                    All time: <strong>{t.digitalUnits}</strong> digital ({formatCents(t.digitalCents)}) · <strong>{t.paperbackUnits}</strong> paperback ({formatCents(t.amazonRoyaltyUsdCents)} royalties) · <strong>{t.clicksTotal}</strong> Amazon clicks
                  </p>
                )}
                <Link to="/books/$slug" params={{ slug: b.slug }} target="_blank" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline">
                  View the book's page <ExternalLink aria-hidden className="size-3.5" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      {comingSoon.length > 0 && (
        <>
          <h2 className="mt-10 text-2xl font-semibold">Coming soon</h2>
          <ul className="mt-4 space-y-4">
            {comingSoon.map((b) => (
              <li key={b.slug} className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-[8rem_minmax(0,1fr)]">
                <img src={b.cover} alt={`${b.title} cover`} width={621} height={810} loading="lazy" className="w-32 rounded-lg shadow-soft" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-semibold">{b.title}</h3>
                    <span className="rounded-full bg-accent px-3 py-0.5 text-sm font-semibold text-accent-foreground">Coming soon</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{b.ages} · {b.goal} · {b.pages}</p>
                  <p className="mt-2">{b.tagline}</p>
                  <p className="mt-3 text-sm text-muted-foreground">No prices or purchase links yet, so no Buy buttons are shown and nothing is tracked. When it's published, add its prices and links to move it into the books above.</p>
                  <Link to="/books/$slug" params={{ slug: b.slug }} target="_blank" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline">
                    View the book's page <ExternalLink aria-hidden className="size-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        Book details, prices, links and artwork are built into the website so it works on any host. To change any of them, request the update and it will be published with the next site update.
      </p>
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="font-semibold">{label}:</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
