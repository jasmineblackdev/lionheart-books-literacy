import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { pageHead } from "@/lib/site";
import { AUDIENCES, CATEGORIES, suggestionSchema } from "@/lib/suggestions";
import { submitSuggestion } from "@/lib/suggestions.functions";

export const Route = createFileRoute("/suggest-a-book")({
  head: () =>
    pageHead({
      title: "Suggest a Book | Help Choose the Next Lionheart Adventure",
      description:
        "Tell J. B. Lionheart what kids' book you'd love next: coloring, cursive and handwriting, puzzles or animal facts. No email required.",
      path: "/suggest-a-book",
    }),
  component: SuggestPage,
});

type Status = "idle" | "sending" | "sent" | "error";

function SuggestPage() {
  const submit = useServerFn(submitSuggestion);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const input = {
      category: String(fd.get("category") ?? ""),
      intended_audience: String(fd.get("intended_audience") ?? ""),
      idea: String(fd.get("idea") ?? ""),
      email: String(fd.get("email") ?? ""),
      marketing_consent: fd.get("marketing_consent") === "on",
      website: String(fd.get("website") ?? ""),
    };
    const parsed = suggestionSchema.safeParse(input);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
      setErrors(errs);
      setFormError("Please fix the highlighted fields.");
      setStatus("error");
      return;
    }
    setErrors({});
    setFormError("");
    setStatus("sending");
    try {
      const res = await submit({ data: parsed.data });
      if (res.ok) setStatus("sent");
      else {
        setFormError(res.error);
        setStatus("error");
      }
    } catch {
      setFormError("Something went wrong sending your idea. Please check your connection and try again.");
      setStatus("error");
    }
  }

  const err = (k: string) =>
    errors[k] ? <p id={`${k}-err`} className="mt-1 text-sm font-semibold text-destructive">{errors[k]}</p> : null;
  const field = "mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-base";

  return (
    <section className="mx-auto max-w-2xl px-5 py-14">
      <p className="eyebrow">Help us choose our next adventure</p>
      <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">Suggest a Book</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Your ideas help inspire our next books. Every suggestion is read and may shape future publishing decisions, though we can't promise any one idea will become a book.
      </p>

      {status === "sent" ? (
        <div role="status" className="card-soft mt-8 p-6">
          <h2 className="text-2xl font-extrabold text-success">Thank you!</h2>
          <p className="mt-2">Thank you for helping shape our next adventure! Your idea has been submitted for consideration.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button className="btn btn-outline" onClick={() => setStatus("idle")}>Suggest another idea</button>
            <Link to="/" hash="books" className="btn btn-primary">Explore the current books</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="card-soft mt-8 space-y-6 p-6">
          {formError && <p role="alert" className="font-semibold text-destructive">{formError}</p>}

          {([
            { name: "category", legend: "What kind of book would you like to see?", opts: CATEGORIES },
            { name: "intended_audience", legend: "Who is the book for?", opts: AUDIENCES },
          ] as const).map((g) => (
            <fieldset key={g.name} aria-describedby={errors[g.name] ? `${g.name}-err` : undefined}>
              <legend className="font-display text-lg font-semibold">{g.legend}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {g.opts.map((o) => (
                  <label key={o.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-secondary">
                    <input type="radio" name={g.name} value={o.value} className="size-4 accent-primary" />
                    {o.label}
                  </label>
                ))}
              </div>
              {err(g.name)}
            </fieldset>
          ))}

          <label className="block font-semibold">
            What would you love to see?
            <textarea name="idea" rows={5} maxLength={1000} className={field} placeholder="A topic, an animal, a skill, a character…" aria-invalid={!!errors["idea"]} aria-describedby={errors["idea"] ? "idea-err" : undefined} />
            {err("idea")}
          </label>

          <label className="block font-semibold">
            Email address <span className="font-normal text-muted-foreground">(optional)</span>
            <input name="email" type="email" autoComplete="email" maxLength={255} className={field} aria-invalid={!!errors["email"]} aria-describedby={errors["email"] ? "email-err" : undefined} />
            {err("email")}
          </label>

          <label className="flex items-start gap-3">
            <input type="checkbox" name="marketing_consent" className="mt-1 size-5 accent-primary" />
            <span>
              Yes, email me when new Lionheart books are released. <span className="text-muted-foreground">Optional. You can unsubscribe anytime.</span>
            </span>
          </label>

          {/* Honeypot for bots; hidden from people and screen readers */}
          <div aria-hidden className="absolute -left-[9999px]">
            <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>

          <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full sm:w-auto disabled:opacity-60">
            {status === "sending" ? "Sending your idea…" : "Submit my suggestion"}
          </button>
          <p className="text-sm text-muted-foreground">
            Sharing an email is optional and doesn't sign you up for anything. See our <Link to="/privacy" className="underline">privacy policy</Link>.
          </p>
        </form>
      )}
    </section>
  );
}
