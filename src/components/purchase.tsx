import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { AmazonButton } from "@/components/book-bits";
import { Button } from "@/components/ui/button";
import type { Book } from "@/lib/site";

export const PURCHASE_PANEL_ID = "buy";

/** Paperback (Amazon) and digital (Payhip) choices for an available book, using its exact links. */
export function PurchasePanel({ book }: { book: Book }) {
  return (
    <section id={PURCHASE_PANEL_ID} aria-labelledby="buy-heading" className="scroll-mt-header rounded-[1.25rem] border bg-card p-4 shadow-soft sm:p-5">
      <h2 id="buy-heading" className="sr-only">Buy {book.short}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col rounded-2xl bg-secondary p-4">
          <p className="text-sm font-semibold text-muted-foreground">Paperback</p>
          <p className="font-display text-3xl font-extrabold">{book.price ?? "—"}</p>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">{book.pages ? `${book.pages}, ` : ""}printed and shipped by Amazon.</p>
          <AmazonButton book={book} showPrice={false} className="mt-3 w-full" />
        </div>
        <div className="flex flex-col rounded-2xl bg-secondary p-4">
          <p className="text-sm font-semibold text-muted-foreground">Digital PDF</p>
          <p className="font-display text-3xl font-extrabold">{book.digital.price}</p>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">Instant download from Payhip. Print at home or trace on a tablet with a stylus.</p>
          <Button asChild variant="bookDigital" size="purchase" className="mt-3 w-full">
            <a href={book.digital.url} target="_blank" rel="noopener noreferrer" aria-label={`Buy on Payhip: ${book.short} digital PDF, ${book.digital.price}`}>
              Buy on Payhip
            </a>
          </Button>
        </div>
      </div>
      {book.sample && (
        <a href={book.sample.url} download className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-dashed border-sage px-4 py-3 font-semibold hover:bg-sage-soft">
          <Download aria-hidden className="size-5 shrink-0 text-sage-ink" />
          <span>
            Free sample pages <span className="font-normal text-muted-foreground">· {book.sample.label}</span>
          </span>
        </a>
      )}
    </section>
  );
}

/** Phone-only buy bar for available books; hides while the main purchase panel is on screen. */
export function StickyBuyBar({ book }: { book: Book }) {
  const [panelVisible, setPanelVisible] = useState(true);
  useEffect(() => {
    const panel = document.getElementById(PURCHASE_PANEL_ID);
    if (!panel || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setPanelVisible(!!e?.isIntersecting), { threshold: 0 });
    io.observe(panel);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-4 py-3 shadow-lift backdrop-blur transition-transform md:hidden motion-reduce:transition-none ${panelVisible ? "translate-y-full" : "translate-y-0"}`}
      aria-hidden={panelVisible}
      inert={panelVisible || undefined}
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <p className="min-w-0 flex-1 text-sm leading-tight">
          <span className="block truncate font-display font-extrabold">{book.short}</span>
          <span className="text-muted-foreground">Paperback {book.price} · PDF {book.digital.price}</span>
        </p>
        <AmazonButton book={book} showPrice={false} className="min-h-11 w-auto shrink-0 px-4 py-2 text-sm" />
        <a href={book.digital.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-bold underline underline-offset-4" aria-label={`PDF: buy the ${book.short} digital PDF on Payhip, ${book.digital.price}`}>
          PDF
        </a>
      </div>
    </div>
  );
}
