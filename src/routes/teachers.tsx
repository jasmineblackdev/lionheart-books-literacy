import { createFileRoute, Link } from "@tanstack/react-router";
import { ClassSetForm } from "@/components/class-set-form";
import { books, pageHead } from "@/lib/site";

export const Route = createFileRoute("/teachers")({
  head: () =>
    pageHead({
      title: "Free Printable Sample Pages for Teachers & Schools | J. B. Lionheart",
      description:
        "Download free alphabet tracing and cursive handwriting sample pages for the classroom or homeschool, and send a class-set inquiry for Color, Trace & Roar! books.",
      path: "/teachers",
    }),
  component: Teachers,
});

function Teachers() {
  const withSamples = books.filter((b) => b.sample);
  return (
    <>
      <section className="mx-auto max-w-4xl px-5 py-14 text-center">
        <p className="eyebrow">For teachers, homeschoolers & schools</p>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">Free sample pages & class sets</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Real pages you can print and copy freely for home or classroom use (not for resale).
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 md:grid-cols-2">
        {withSamples.map((b) => (
          <article key={b.slug} className="card-soft flex flex-col p-6">
            <div className="flex gap-4">
              <img src={b.cover} alt={`${b.title} cover`} width={621} height={810} className="w-20 shrink-0 rounded shadow-soft" />
              <div className="min-w-0">
                <p className="eyebrow">{b.ages}</p>
                <h2 className="text-2xl font-semibold leading-tight">{b.short}</h2>
              </div>
            </div>
            <p className="mt-4 flex-1"><strong>What's included:</strong> {b.sample!.contents}</p>
            <a href={b.sample!.url} download className="btn btn-primary mt-5">Download {b.sample!.label}</a>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-14 md:grid-cols-3">
        <div className="card-soft p-6">
          <h2 className="text-xl font-semibold">Grade guidance</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {books.map((b) => <li key={b.slug}><strong>{b.short}:</strong> {b.ages}</li>)}
          </ul>
        </div>
        <div className="card-soft p-6">
          <h2 className="text-xl font-semibold">In the classroom</h2>
          <p className="mt-3 text-sm">Use one page per lesson: letter-of-the-day for Pre-K and K, stroke-family cursive lessons for grades 2–4, and Field Guide pages alongside habitat units.</p>
        </div>
        <div className="card-soft p-6">
          <h2 className="text-xl font-semibold">North Carolina cursive</h2>
          <p className="mt-3 text-sm">North Carolina law requires public schools to teach cursive so students can write legibly in cursive by the end of 5th grade. Cursive Safari covers all 52 letters, joins, words and sentences.</p>
        </div>
      </section>

      <section id="class-sets" className="scroll-mt-20 bg-secondary px-5 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold">Class-set inquiry</h2>
          <p className="mt-2 text-muted-foreground">Tell us what you need and we'll get back to you with options.</p>
          <div className="mt-6"><ClassSetForm /></div>
          <p className="mt-6 text-center"><Link to="/" hash="books" className="font-semibold underline">Browse all books</Link></p>
        </div>
      </section>
    </>
  );
}
