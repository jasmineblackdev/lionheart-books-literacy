import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { books, comingSoon, EMAIL } from "@/lib/site";

const nav = [
  { label: "Home", to: "/" as const },
  { label: "Explore the Books", to: "/" as const, hash: "books" },
  { label: "For Teachers & Schools", to: "/teachers" as const },
  { label: "Suggest a Book", to: "/suggest-a-book" as const },
  { label: "About", to: "/" as const, hash: "about" },
  { label: "Contact", to: "/" as const, hash: "contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  // Escape closes the phone menu and returns focus to the Menu button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  // Publish the header's real height so section anchors (scroll-mt-header) clear it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const set = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
        <Link to="/" className="min-w-0 font-display text-xl font-bold text-primary">
          <span className="truncate">J. B. Lionheart <span className="text-terracotta">Books</span></span>
        </Link>
        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex gap-6 font-semibold">
            {nav.map((n) => (
              <li key={n.label}>
                <Link to={n.to} {...(n.hash ? { hash: n.hash } : {})} className="hover:text-terracotta">{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          ref={menuButton}
          type="button"
          className="btn btn-outline px-4 py-2 text-base xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t px-5 pb-4 xl:hidden">
          <ul className="flex flex-col">
            {nav.map((n) => (
              <li key={n.label}>
                <Link to={n.to} {...(n.hash ? { hash: n.hash } : {})} onClick={() => setOpen(false)} className="block py-3 text-lg font-semibold">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold">J. B. Lionheart Books</p>
          <p className="mt-2 opacity-85">Color, Trace & Roar! learning books for curious kids.</p>
        </div>
        <div>
          <h2 className="text-lg font-extrabold">The books</h2>
          <ul className="mt-3 space-y-2 opacity-90">
            {books.map((b) => (
              <li key={b.slug}>
                <Link to="/books/$slug" params={{ slug: b.slug }} className="underline-offset-4 hover:underline">{b.short}</Link>
              </li>
            ))}
            {comingSoon.map((b) => (
              <li key={b.slug}>
                <Link to="/books/$slug" params={{ slug: b.slug }} className="underline-offset-4 hover:underline">{b.short}</Link>{" "}
                <span className="text-sm opacity-75">(coming soon)</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-extrabold">Contact</h2>
          <a href={`mailto:${EMAIL}`} className="mt-3 inline-block font-bold underline underline-offset-4">{EMAIL}</a>
          <ul className="mt-4 space-y-2 opacity-90">
            <li><Link to="/teachers" className="hover:underline">Teachers & Schools</Link></li>
            <li><Link to="/suggest-a-book" className="hover:underline">Suggest a Book</Link></li>
            <li><Link to="/privacy" className="hover:underline">Privacy policy</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-primary-foreground/20 py-5 text-center text-sm opacity-80">
        © {new Date().getFullYear()} J. B. Lionheart. All rights reserved. ·{" "}
        <Link to="/admin" className="underline-offset-4 hover:underline">Admin login</Link>
      </p>
    </footer>
  );
}
