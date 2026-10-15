import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Preview } from "@/lib/site";
import { responsive } from "@/lib/images";

/** Interior-page thumbnails that open a full-size viewer (native <dialog>: focus is
 *  trapped, Esc closes, arrow keys move between pages). */
export function Gallery({ images, title, compact = false }: { images: Preview[]; title: string; compact?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;
  const current = images[index];

  const open = (i: number) => {
    setIndex(i);
    const d = dialog.current;
    if (d && typeof d.showModal === "function" && !d.open) d.showModal();
  };
  const close = () => dialog.current?.close();
  const step = (by: number) => setIndex((i) => (i + by + count) % count);

  if (!count) return null;
  return (
    <>
      <ul className={`grid ${compact ? "grid-cols-3 gap-2 sm:gap-3" : `gap-4 ${count > 1 ? "grid-cols-2 sm:grid-cols-3" : ""}`}`}>
        {images.map((p, i) => (
          <li key={p.src}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`Enlarge page ${i + 1} of ${count}: ${p.alt}`}
              className={`group block w-full overflow-hidden border bg-card shadow-soft transition-shadow hover:shadow-lift ${compact ? "rounded-xl p-1" : "rounded-2xl p-2"}`}
            >
              <img {...responsive(p.src, compact ? "(min-width: 1024px) 160px, 30vw" : "(min-width: 640px) 360px, 45vw")} alt="" width={935} height={1210} loading="lazy" decoding="async" className="w-full rounded-xl transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={`${title}: interior pages`}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="m-auto max-h-[95vh] w-[min(64rem,94vw)] rounded-2xl bg-card p-0 text-foreground shadow-lift backdrop:bg-black/70"
      >
        {current && (
          <figure className="flex max-h-[95vh] flex-col">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
              <p className="text-sm font-semibold" aria-live="polite">
                Page {index + 1} of {count}
              </p>
              <button type="button" onClick={close} className="rounded-full p-2 hover:bg-secondary" aria-label="Close">
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center bg-secondary p-3">
              <img src={current.src} alt={current.alt} decoding="async" className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-soft" />
              {count > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label="Previous page" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card p-2 shadow-soft hover:bg-secondary">
                    <ChevronLeft aria-hidden className="size-6" />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="Next page" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card p-2 shadow-soft hover:bg-secondary">
                    <ChevronRight aria-hidden className="size-6" />
                  </button>
                </>
              )}
            </div>
            <figcaption className="px-4 py-3 text-sm text-muted-foreground">{current.alt}</figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
