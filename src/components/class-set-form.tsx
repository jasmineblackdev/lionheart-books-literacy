import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { INQUIRY_BOOKS, MAX_QUANTITY, bookNames, classSetSchema } from "@/lib/class-sets";
import { submitClassSetInquiry } from "@/lib/class-sets.functions";
import { EMAIL } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";
type FieldKey = "name" | "org" | "email" | "books" | "quantity" | "message";

const ORDER: FieldKey[] = ["name", "org", "email", "books", "quantity", "message"];
const LABELS: Record<FieldKey, string> = {
  name: "Your name",
  org: "School or organization",
  email: "Work email",
  books: "Books",
  quantity: "Approximate quantity",
  message: "Message",
};

export function ClassSetForm() {
  const submit = useServerFn(submitClassSetInquiry);
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState<ReactNode>("");
  const [sentBooks, setSentBooks] = useState("");

  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
  }, [status]);

  function focusField(k: FieldKey) {
    const el = formRef.current?.querySelector<HTMLElement>(k === "books" ? `input[name="books"]` : `[name="${k}"]`);
    el?.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name") ?? ""),
      org: String(fd.get("org") ?? ""),
      email: String(fd.get("email") ?? ""),
      books: fd.getAll("books").map(String),
      quantity: String(fd.get("quantity") ?? "").replace(/[,\s]/g, ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    const parsed = classSetSchema.safeParse(input);
    if (!parsed.success) {
      const errs: Partial<Record<FieldKey, string>> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0]) as FieldKey] ??= i.message;
      setErrors(errs);
      setFormError("");
      setStatus("error");
      const first = ORDER.find((k) => errs[k]);
      if (first) requestAnimationFrame(() => focusField(first));
      return;
    }
    setErrors({});
    setFormError("");
    setStatus("sending");
    try {
      const res = await submit({ data: parsed.data });
      if (res.ok) {
        setSentBooks(bookNames(parsed.data.books));
        setStatus("sent");
      } else {
        setFormError(res.error);
        setStatus("error");
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
    } catch {
      setFormError(
        <>
          Your inquiry couldn't be sent. Please check your connection and try again, or email{" "}
          <a href={`mailto:${EMAIL}`} className="underline">{EMAIL}</a> directly.
        </>,
      );
      setStatus("error");
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  const field = "mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-base font-normal aria-[invalid=true]:border-destructive";
  const describedBy = (k: FieldKey, hint?: boolean) => [hint ? id(`${k}-hint`) : "", errors[k] ? id(`${k}-err`) : ""].filter(Boolean).join(" ") || undefined;
  const err = (k: FieldKey) =>
    errors[k] ? <p id={id(`${k}-err`)} className="mt-1.5 text-sm font-semibold text-destructive">{errors[k]}</p> : null;
  const errorKeys = ORDER.filter((k) => errors[k]);

  if (status === "sent") {
    return (
      <div role="status" className="rounded-[1.25rem] border bg-card p-6 shadow-soft">
        <h3 ref={successRef} tabIndex={-1} className="flex items-center gap-2 text-2xl font-extrabold text-success focus:outline-none">
          <CheckCircle2 aria-hidden className="size-7" /> Thanks! Your inquiry was sent
        </h3>
        <p className="mt-3 leading-relaxed">
          We'll reply to the email address you gave us with options for your class set{sentBooks ? <> of <strong>{sentBooks}</strong></> : null}.
        </p>
        <button type="button" className="btn btn-outline mt-5" onClick={() => setStatus("idle")}>Send another inquiry</button>
      </div>
    );
  }

  const groups = [
    { key: "available", title: "Available now", items: INQUIRY_BOOKS.filter((b) => b.group === "available") },
    { key: "coming-soon", title: "Also interested in (coming soon)", items: INQUIRY_BOOKS.filter((b) => b.group === "coming-soon") },
    { key: "unsure", title: "", items: INQUIRY_BOOKS.filter((b) => b.group === "unsure") },
  ];

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby={id("required")} className="relative grid gap-5 rounded-[1.25rem] border bg-card p-6 shadow-soft sm:grid-cols-2">
      <p id={id("required")} className="text-sm text-muted-foreground sm:col-span-2">All fields are required except Message.</p>

      {(errorKeys.length > 0 || formError) && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 text-sm sm:col-span-2 focus:outline-none">
          {formError ? (
            <p className="font-semibold text-destructive">{formError}</p>
          ) : (
            <>
              <p className="font-bold text-destructive">Please fix {errorKeys.length === 1 ? "this field" : `these ${errorKeys.length} fields`}:</p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
                {errorKeys.map((k) => (
                  <li key={k}>
                    <button type="button" className="inline text-left underline underline-offset-2" onClick={() => focusField(k)}>
                      {LABELS[k]}: {errors[k]}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {(["name", "org", "email"] as const).map((k) => (
        <div key={k} className={k === "email" ? "sm:col-span-2" : ""}>
          <label htmlFor={id(k)} className="font-semibold">{LABELS[k]}</label>
          <input
            id={id(k)}
            name={k}
            type={k === "email" ? "email" : "text"}
            autoComplete={k === "name" ? "name" : k === "org" ? "organization" : "email"}
            aria-invalid={!!errors[k]}
            aria-describedby={describedBy(k)}
            className={field}
          />
          {err(k)}
        </div>
      ))}

      <fieldset className="sm:col-span-2" aria-describedby={describedBy("books")} aria-invalid={!!errors.books}>
        <legend className="font-semibold">Which books are you interested in?</legend>
        <div className="mt-2 grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.key} className={g.key === "unsure" ? "md:col-span-2" : ""}>
              {g.title && <p className="mb-1.5 text-sm font-semibold text-muted-foreground">{g.title}</p>}
              <ul className="space-y-1.5">
                {g.items.map((b) => (
                  <li key={b.value}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background px-3 py-2.5 has-[:checked]:border-primary has-[:checked]:bg-secondary">
                      <input type="checkbox" name="books" value={b.value} className="size-5 shrink-0 accent-primary" />
                      <span>{b.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {err("books")}
      </fieldset>

      <div>
        <label htmlFor={id("quantity")} className="font-semibold">{LABELS.quantity}</label>
        <input
          id={id("quantity")}
          name="quantity"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 30"
          aria-invalid={!!errors.quantity}
          aria-describedby={describedBy("quantity", true)}
          className={field}
        />
        <p id={id("quantity-hint")} className="mt-1.5 text-sm text-muted-foreground">
          Approximate number of copies, 1 to {MAX_QUANTITY.toLocaleString("en-US")}.
        </p>
        {err("quantity")}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={id("message")} className="font-semibold">
          {LABELS.message} <span className="font-normal text-muted-foreground">(optional: grade, timing, anything else)</span>
        </label>
        <textarea id={id("message")} name="message" rows={4} maxLength={2000} aria-invalid={!!errors.message} aria-describedby={describedBy("message")} className={field} />
        {err("message")}
      </div>

      {/* Honeypot for bots; hidden from people and screen readers */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} aria-disabled={status === "sending"} className="btn btn-primary w-full sm:w-auto disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Send class-set inquiry"}
        </button>
        <p className="mt-3 text-sm text-muted-foreground">We'll reply by email with options; pricing depends on your order.</p>
      </div>
    </form>
  );
}
