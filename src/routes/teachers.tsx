import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, GraduationCap, School } from "lucide-react";
import { ComingSoonBadge } from "@/components/book-bits";
import { ClassSetForm } from "@/components/class-set-form";
import { books, CATEGORIES, comingSoon, pageHead } from "@/lib/site";
import { responsive } from "@/lib/images";

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

      <section id="samples" aria-labelledby="samples-heading" className="scroll-mt-20 bg-secondary px-5 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 id="samples-heading" className="text-3xl font-extrabold md:text-4xl">Free sample pages</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Real pages you can print and copy freely for home or classroom use (not for resale).</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {withSamples.map((b) => (
              <article key={b.slug} className="flex flex-col rounded-[1.25rem] border bg-card p-6 shadow-soft">
                <div className="flex gap-5">
                  <img {...responsive(b.cover, "96px")} alt={`${b.title} cover`} width={621} height={810} loading="lazy" className="h-auto w-24 shrink-0 self-start rounded-md shadow-soft" />
                  <div className="min-w-0">
                    <p className="eyebrow">{b.ages}</p>
                    <h3 className="mt-1 text-2xl font-extrabold leading-tight">{b.short}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FileText aria-hidden className="size-4" /> {b.sample!.label}
                    </p>
                  </div>
                </div>
                <p className="mt-5 flex-1 leading-relaxed"><strong>What's included:</strong> {b.sample!.contents}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <a href={b.sample!.url} download className="btn btn-primary">
                    <Download aria-hidden className="size-5" /> Download free pages
                  </a>
                  <Link to="/books/$slug" params={{ slug: b.slug }} className="font-semibold underline underline-offset-4">
                    About {b.short}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="grades" aria-labelledby="grades-heading" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 md:py-16">
        <h2 id="grades-heading" className="text-3xl font-extrabold md:text-4xl">Grade guide</h2>
        <p className="mt-2 text-muted-foreground">Every Color, Trace &amp; Roar! book by age, grade and skill.</p>
        <div className="mt-6 overflow-x-auto rounded-[1.25rem] border bg-card shadow-soft">
          <table className="w-full min-w-[40rem] text-left">
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
                <tr key={b.slug}>
                  <th scope="row" className="px-5 py-4 font-semibold">
                    <Link to="/books/$slug" params={{ slug: b.slug }} className="underline-offset-4 hover:underline">{b.short}</Link>
                  </th>
                  <td className="px-5 py-4">{b.ages}</td>
                  <td className="px-5 py-4">
                    {b.goal}
                    <span className="block text-sm text-muted-foreground">{b.categories.map(categoryLabel).join(", ")}</span>
                  </td>
                  <td className="px-5 py-4">
                    {"status" in b ? <ComingSoonBadge /> : <span className="font-semibold text-success">Available now</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      <section id="class-sets" aria-labelledby="class-sets-heading" className="scroll-mt-20 bg-secondary px-5 py-14 md:py-16">
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
