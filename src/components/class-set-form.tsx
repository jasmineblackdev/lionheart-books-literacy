import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { classSetSchema } from "@/lib/class-sets";
import { submitClassSetInquiry } from "@/lib/class-sets.functions";
import { EMAIL } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

export function ClassSetForm() {
  const submit = useServerFn(submitClassSetInquiry);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name") ?? ""),
      org: String(fd.get("org") ?? ""),
      email: String(fd.get("email") ?? ""),
      quantity: String(fd.get("quantity") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    const parsed = classSetSchema.safeParse(input);
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
      setFormError(`Something went wrong sending your inquiry. Please check your connection and try again, or email ${EMAIL} directly.`);
      setStatus("error");
    }
  }

  const field = "mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-base";
  const err = (k: string) =>
    errors[k] ? <p id={`${k}-err`} className="mt-1 text-sm font-semibold text-destructive">{errors[k]}</p> : null;

  if (status === "sent") {
    return (
      <div role="status" className="card-soft p-6">
        <h3 className="text-2xl font-bold text-success">Thanks! Your inquiry was sent</h3>
        <p className="mt-2">We'll reply to the email address you gave us with options for your class set.</p>
        <button className="btn btn-outline mt-4" onClick={() => setStatus("idle")}>Send another inquiry</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card-soft relative grid gap-4 p-6 sm:grid-cols-2">
      {formError && (
        <p role="alert" className="text-sm font-semibold text-destructive sm:col-span-2">{formError}</p>
      )}
      {[
        { k: "name", label: "Your name", type: "text", ac: "name" },
        { k: "org", label: "School or organization", type: "text", ac: "organization" },
        { k: "email", label: "Work email", type: "email", ac: "email" },
        { k: "quantity", label: "Approximate quantity", type: "number", ac: "off" },
      ].map((f) => (
        <label key={f.k} className="font-semibold">
          {f.label}
          <input
            name={f.k}
            type={f.type}
            min={f.type === "number" ? 1 : undefined}
            autoComplete={f.ac}
            aria-invalid={!!errors[f.k]}
            aria-describedby={errors[f.k] ? `${f.k}-err` : undefined}
            className={field}
          />
          {err(f.k)}
        </label>
      ))}
      <label className="font-semibold sm:col-span-2">
        Message <span className="font-normal text-muted-foreground">(optional: which books, grade, timing)</span>
        <textarea name="message" rows={4} maxLength={2000} className={field} />
        {err("message")}
      </label>

      {/* Honeypot for bots; hidden from people and screen readers */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full sm:w-auto disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Send class-set inquiry"}
        </button>
        <p className="mt-3 text-sm text-muted-foreground">
          We'll reply by email with options; pricing depends on your order.
        </p>
      </div>
    </form>
  );
}
