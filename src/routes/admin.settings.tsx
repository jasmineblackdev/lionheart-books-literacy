import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { PageTitle } from "@/components/admin/shell";
import { supabase } from "@/integrations/supabase/client";
import { EMAIL } from "@/lib/site";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

const field = "mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-base";

function SettingsPage() {
  const [email, setEmail] = useState("");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? ""));
  }, []);

  return (
    <>
      <PageTitle title="Settings" subtitle="Your account and how the site is connected" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-semibold">Account</h2>
          <p className="mt-2 text-sm">Signed in as <strong>{email}</strong></p>
          <ChangePassword />
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-semibold">Connections</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-semibold">Form emails</dt>
              <dd className="text-muted-foreground">New school inquiries and book suggestions are emailed to {EMAIL} through Resend.</dd>
            </div>
            <div>
              <dt className="font-semibold">Payhip</dt>
              <dd className="text-muted-foreground">Digital sales and refunds arrive automatically through Payhip's webhook (Payhip → Settings → Developer).</dd>
            </div>
            <div>
              <dt className="font-semibold">Amazon KDP</dt>
              <dd className="text-muted-foreground">Paperback sales come from the Orders report you upload on the Sales page.</dd>
            </div>
            <div>
              <dt className="font-semibold">Buy on Amazon clicks</dt>
              <dd className="text-muted-foreground">Counted per book when visitors press a Buy on Amazon button.</dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}

function ChangePassword() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const pw = String(fd.get("password") ?? "");
    if (pw.length < 8) return setMsg({ ok: false, text: "Use at least 8 characters." });
    if (pw !== String(fd.get("confirm") ?? "")) return setMsg({ ok: false, text: "The two passwords don't match." });
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) setMsg({ ok: false, text: "Couldn't change the password. Sign out, sign back in and try again." });
    else {
      form.reset();
      setMsg({ ok: true, text: "Password changed. Use the new one next time you sign in." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-3">
      <h3 className="font-semibold">Change password</h3>
      <label className="text-sm font-semibold">
        New password
        <input name="password" type="password" autoComplete="new-password" minLength={8} required className={field} />
      </label>
      <label className="text-sm font-semibold">
        Confirm new password
        <input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={field} />
      </label>
      {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-success" : "text-destructive"}`}>{msg.text}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary justify-self-start disabled:opacity-60">
        {busy ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
