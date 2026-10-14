import { useState } from "react";
import { BookCard } from "@/components/book-bits";
import { filterBooks, type AgeFilter, type CategoryFilter } from "@/lib/catalog";
import { AGE_GROUPS, CATEGORIES, books, comingSoon } from "@/lib/site";

// Home page catalog: filter chips for age and learning category, then available books
// followed by coming-soon books. Coming-soon cards never show prices or purchase actions.
export function Catalog() {
  const [age, setAge] = useState<AgeFilter>("");
  const [category, setCategory] = useState<CategoryFilter>("");
  const available = filterBooks(books, age, category);
  const upcoming = filterBooks(comingSoon, age, category);
  const total = available.length + upcoming.length;

  return (
    <>
      <div className="mt-8 space-y-3" role="group" aria-label="Filter books">
        <ChipRow label="Age" value={age} onChange={(v) => setAge(v as AgeFilter)} options={AGE_GROUPS} />
        <ChipRow label="Learning" value={category} onChange={(v) => setCategory(v as CategoryFilter)} options={CATEGORIES} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {age || category ? `${total} ${total === 1 ? "book matches" : "books match"}` : `${total} books`}
        {(age || category) && (
          <button
            type="button"
            onClick={() => {
              setAge("");
              setCategory("");
            }}
            className="ml-3 font-semibold text-foreground underline underline-offset-4"
          >
            Clear filters
          </button>
        )}
      </p>

      <h3 className="mt-8 text-2xl font-extrabold">Available now</h3>
      {available.length ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((b) => <BookCard key={b.slug} book={b} headingLevel={4} />)}
        </div>
      ) : (
        <p className="mt-3 text-muted-foreground">No available books match these filters yet.</p>
      )}

      {upcoming.length > 0 && (
        <>
          <h3 className="mt-14 text-2xl font-extrabold">Coming soon</h3>
          <p className="mt-1 text-muted-foreground">New Color, Trace &amp; Roar! books on the way. Preview real pages now.</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((b) => <BookCard key={b.slug} book={b} headingLevel={4} />)}
          </div>
        </>
      )}
    </>
  );
}

function ChipRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:border-primary"
    }`;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 text-sm font-semibold text-muted-foreground">{label}</span>
      <button type="button" aria-pressed={!value} onClick={() => onChange("")} className={chip(!value)}>
        All
      </button>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(value === o.value ? "" : o.value)} className={chip(value === o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
