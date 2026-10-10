import { useState, type FormEvent } from "react";
import { EMAIL } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ClassSetForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const errs: Record<string, string> = {};
    if (!d.name?.trim()) errs.name = "Please enter your name.";
    if (!d.org?.trim()) errs.org = "Please enter your school or organization.";
    if (!emailRe.test(d.email ?? "")) errs.email = "Please enter a valid email address.";
    if (!d.quantity || Number(d.quantity) < 1) errs.quantity = "Please enter an approximate quantity.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const body = `Name: ${d.name}\nSchool/organization: ${d.org}\nEmail: ${d.email}\nApprox. quantity: ${d.quantity}\n\n${d.message ?? ""}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Class-set inquiry: " + d.org)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => setStatus("sent"), 600);
  }

  const field = "mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-base";
  const err = (k: string) =>
    errors[k] ? <p id={`${k}-err`} className="mt-1 text-sm font-semibold text-destructive">{errors[k]}</p> : null;

  if (status === "sent") {
    return (
      <div role="status" className="card-soft p-6">
        <h3 className="text-2xl font-semibold text-success">Your email is ready to send</h3>
        <p className="mt-2">
          Your email app should have opened with your inquiry filled in. Press send there to reach us. If nothing opened, email{" "}
          <a href={`mailto:${EMAIL}`} className="font-bold underline">{EMAIL}</a> directly.
        </p>
        <button className="btn btn-outline mt-4" onClick={() => setStatus("idle")}>Send another inquiry</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card-soft grid gap-4 p-6 sm:grid-cols-2">
      {status === "error" && (
        <p role="alert" className="text-sm font-semibold text-destructive sm:col-span-2">Please fix the highlighted fields.</p>
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
        <textarea name="message" rows={4} className={field} />
      </label>
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full sm:w-auto">
          {status === "sending" ? "Opening your email…" : "Send class-set inquiry"}
        </button>
        <p className="mt-3 text-sm text-muted-foreground">
          This opens your email app with your details filled in. We'll reply with options; pricing depends on your order.
        </p>
      </div>
    </form>
  );
}
