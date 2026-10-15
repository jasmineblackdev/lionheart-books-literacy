import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, GraduationCap, School } from "lucide-react";
import { AvailableBadge, ComingSoonBadge } from "@/components/book-bits";
import { Gallery } from "@/components/gallery";
import { responsive } from "@/lib/images";
import { ClassSetForm } from "@/components/class-set-form";
import { books, CATEGORIES, comingSoon, pageHead } from "@/lib/site";

export const Route = createFileRoute("/teachers")({
  head: () =>
    pageHead({
      title: "Teacher Resource Center: Free Sample Pages & Class Sets | J. B. Lionheart",
      description:
        "Free printable alphabet tracing and cursive handwriting sample pages, a grade guide for every Color, Trace & Roar! book, and class-set inquiries for schools and homeschool groups.",
      path: "/teachers",
    }),
  component: Teachers,
});

const categoryLabel = (c: string) => CATEGORIES.find((x) => x.value === c)?.label ?? c;

function Teachers() {
  const withSamples = books.filter((b) => b.sample);
  const allBooks = [...books, ...comingSoon];
  const jump = [
    { href: "#samples", icon: Download, label: "Free sample pages" },
    { href: "#grades", icon: GraduationCap, label: "Grade guide" },
    { href: "#class-sets", icon: School, label: "Class-set inquiry" },
  ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-12 md:pt-16">
        <p className="eyebrow">For teachers, homeschoolers &amp; schools</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">Teacher Resource Center</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Free printable sample pages, a grade guide for every Color, Trace &amp; Roar! book, and class sets for your classroom or school.
        </p>
        <nav aria-label="On this page" className="mt-8">
          <ul className="grid gap-3 sm:grid-cols-3">
            {jump.map((j) => (
              <li key={j.href}>
                <a href={j.href} className="flex items-center gap-3 rounded-2xl border bg-card px-5 py-4 font-display text-lg font-extrabold shadow-soft transition-shadow hover:shadow-lift">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sage-soft text-sage-ink">
                    <j.icon aria-hidden className="size-5" />
                  </span>
                  {j.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section id="samples" aria-labelledby="samples-heading" className="scroll-mt-header bg-secondary px-5 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 id="samples-heading" className="text-3xl font-extrabold md:text-4xl">Free sample pages</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Real pages you can print and copy freely for home or classroom use (not for resale).</p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {withSamples.map((b) => {
              const s = b.sample!;
              const more = s.pageCount - s.pages.length;
              return (
                <article key={b.slug} aria-labelledby={`sample-${b.slug}`} className="flex flex-col rounded-[1.25rem] border bg-card p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <img {...responsive(b.cover, "64px")} alt="" width={621} height={810} loading="lazy" className="h-auto w-16 shrink-0 rounded-md shadow-soft" />
                    <div className="min-w-0">
                      <p className="eyebrow">{b.ages}</p>
                      <h3 id={`sample-${b.slug}`} className="mt-1 text-2xl font-extrabold leading-tight">{b.short}</h3>
                    </div>
                  </div>
                  <p className="mt-4 leading-relaxed"><strong>What's included:</strong> {s.contents}</p>
                  <div className="mt-4">
                    <Gallery images={s.pages} title={`${b.short} free sample`} compact />
                    {more > 0 && <p className="mt-2 text-sm text-muted-foreground">+ {more} more {more === 1 ? "page" : "pages"} in the PDF. Select a page to enlarge it.</p>}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t pt-5">
                    <a href={s.url} download aria-label={`Download free ${b.short} sample PDF, ${s.pageCount} pages, ${s.sizeMB} MB`} className="btn btn-primary">
                      <Download aria-hidden className="size-5" /> Download free PDF
                    </a>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FileText aria-hidden className="size-4" /> {s.pageCount} pages · {s.sizeMB} MB
                    </span>
                    <Link to="/books/$slug" params={{ slug: b.slug }} className="text-sm font-semibold underline underline-offset-4">
                      About {b.short}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="grades" aria-labelledby="grades-heading" className="mx-auto max-w-6xl scroll-mt-header px-5 py-14 md:py-16">
        <h2 id="grades-heading" className="text-3xl font-extrabold md:text-4xl">Grade guide</h2>
        <p className="mt-2 text-muted-foreground">Every Color, Trace &amp; Roar! book by age, grade and skill. Available books first.</p>

        {/* Desktop and tablet: one table */}
        <div className="mt-6 hidden overflow-hidden rounded-[1.25rem] border bg-card shadow-soft md:block">
          <table className="w-full text-left">
            <caption className="sr-only">Color, Trace &amp; Roar! books by age, grade, skill and availability</caption>
            <thead className="bg-secondary text-sm">
              <tr>
                <th scope="col" className="px-5 py-3 font-bold">Book</th>
                <th scope="col" className="px-5 py-3 font-bold">Ages &amp; grades</th>
                <th scope="col" className="px-5 py-3 font-bold">Practices</th>
                <th scope="col" className="px-5 py-3 font-bold">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allBooks.map((b) => (
                <tr key={b.slug} className={"status" in b ? "" : "bg-sage-soft/40"}>
                  <th scope="row" className="px-5 py-4 font-semibold">
                    <Link to="/books/$slug" params={{ slug: b.slug }} className="flex items-center gap-3 underline-offset-4 hover:underline">
                      <img {...responsive(b.cover, "40px")} alt="" width={621} height={810} loading="lazy" className="h-auto w-10 shrink-0 rounded shadow-soft" />
                      {b.short}
                    </Link>
                  </th>
                  <td className="px-5 py-4">{b.ages}</td>
                  <td className="px-5 py-4">
                    {b.goal}
                    <span className="block text-sm text-muted-foreground">{b.categories.map(categoryLabel).join(", ")}</span>
                  </td>
                  <td className="px-5 py-4">{"status" in b ? <ComingSoonBadge /> : <AvailableBadge />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phones: stacked cards, no sideways scrolling */}
        <ul className="mt-6 space-y-3 md:hidden" aria-label="Color, Trace & Roar! books by age, grade, skill and availability">
          {allBooks.map((b) => (
            <li key={b.slug} className={`flex gap-4 rounded-[1.25rem] border p-4 shadow-soft ${"status" in b ? "bg-card" : "bg-sage-soft/40"}`}>
              <img {...responsive(b.cover, "64px")} alt="" width={621} height={810} loading="lazy" className="h-auto w-16 shrink-0 self-start rounded-md shadow-soft" />
              <div className="min-w-0 flex-1">
                {"status" in b ? <ComingSoonBadge className="text-xs" /> : <AvailableBadge className="text-xs" />}
                <h3 className="mt-2 text-lg font-extrabold leading-snug">
                  <Link to="/books/$slug" params={{ slug: b.slug }} className="underline-offset-4 hover:underline">{b.short}</Link>
                </h3>
                <dl className="mt-1.5 space-y-1 text-sm">
                  <div><dt className="sr-only">Ages and grades</dt><dd>{b.ages}</dd></div>
                  <div>
                    <dt className="sr-only">Practices</dt>
                    <dd className="text-muted-foreground">{b.goal} · {b.categories.map(categoryLabel).join(", ")}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.25rem] border bg-card p-6 shadow-soft">
            <h3 className="text-xl font-extrabold">In the classroom</h3>
            <p className="mt-3 leading-relaxed">Use one page per lesson: letter-of-the-day for Pre-K and K, stroke-family cursive lessons for grades 2–4, and Field Guide pages alongside habitat units.</p>
          </div>
          <div className="rounded-[1.25rem] border bg-card p-6 shadow-soft">
            <h3 className="text-xl font-extrabold">Reading &amp; math, coming soon</h3>
            <p className="mt-3 leading-relaxed">Safari Reading Detectives and Safari Math Detectives use test-style multiple-choice questions. Times Table Safari ends every stop with story problems and a timed Speed Round.</p>
          </div>
          <div className="rounded-[1.25rem] border bg-card p-6 shadow-soft">
            <h3 className="text-xl font-extrabold">North Carolina cursive</h3>
            <p className="mt-3 leading-relaxed">North Carolina law requires public schools to teach cursive so students can write legibly in cursive by the end of 5th grade. Cursive Safari covers all 52 letters, joins, words and sentences.</p>
          </div>
        </div>
      </section>

      <section id="class-sets" aria-labelledby="class-sets-heading" className="scroll-mt-header bg-secondary px-5 py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div>
            <h2 id="class-sets-heading" className="text-3xl font-extrabold md:text-4xl">Class-set inquiry</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">Ordering for a class, school or homeschool group? Tell us what you need and we'll get back to you with options.</p>
            <ol className="mt-6 space-y-3">
              {["Send the form with your school and an approximate quantity.", "We reply by email with options for your order.", "Pricing depends on the books and quantity you choose."].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <span className="pt-0.5">{t}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <ClassSetForm />
            <p className="mt-6"><Link to="/" hash="books" className="font-semibold underline underline-offset-4">Browse all books</Link></p>
          </div>
        </div>
      </section>
    </>
  );
}
