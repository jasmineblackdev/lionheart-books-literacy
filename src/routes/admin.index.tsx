import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertCircle, BookOpen, CalendarClock, Lightbulb, MessageSquare, School, Upload, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { sel } from "@/components/admin/panels";
import { PageTitle } from "@/components/admin/shell";
import { useAdminData, withDefaults } from "@/components/admin/use-admin";
import { RANGES, overviewTotals, recentActivity, type Range } from "@/lib/overview";
import { formatCents } from "@/lib/sales";

export const Route = createFileRoute("/admin/")({ component: Overview });

function Overview() {
  const q = useAdminData();
  const [range, setRange] = useState<Range>("30d");
  if (!q.data) return null;
  const data = withDefaults(q.data);
  const t = overviewTotals(data, range);
  const activity = recentActivity(data);

  const stats: { label: string; value: string; hint?: string }[] = [
    { label: "Revenue", value: formatCents(t.revenueUsdCents), hint: "Payhip sales + Amazon royalties (USD)" },
    { label: "Books sold", value: String(t.booksSold), hint: `${t.digitalUnits} digital · ${t.paperbackUnits} paperback` },
    { label: "Amazon clicks", value: String(t.amazonClicks), hint: "Interest, not confirmed sales" },
    { label: "School inquiries", value: String(t.inquiriesReceived), hint: "Received in this period" },
    { label: "Book suggestions", value: String(t.suggestionsReceived), hint: "Received in this period" },
  ];

  const attention: { icon: LucideIcon; text: string; to: string }[] = [];
  if (t.newInquiries) attention.push({ icon: AlertCircle, text: `${t.newInquiries} new school ${t.newInquiries === 1 ? "inquiry" : "inquiries"}`, to: "/admin/school-orders" });
  if (t.followUpsDue) attention.push({ icon: CalendarClock, text: `${t.followUpsDue} school ${t.followUpsDue === 1 ? "order needs" : "orders need"} a follow-up`, to: "/admin/school-orders" });
  if (t.newSuggestions) attention.push({ icon: Lightbulb, text: `${t.newSuggestions} new book ${t.newSuggestions === 1 ? "suggestion" : "suggestions"}`, to: "/admin/suggestions" });

  const actions: { icon: LucideIcon; label: string; to: string }[] = [
    { icon: School, label: "Review school inquiries", to: "/admin/school-orders" },
    { icon: MessageSquare, label: "Review suggestions", to: "/admin/suggestions" },
    { icon: Upload, label: "Upload KDP report", to: "/admin/sales" },
    { icon: BookOpen, label: "View my books", to: "/admin/books" },
  ];

  return (
    <>
      <PageTitle title="Overview" subtitle="Your publishing business at a glance">
        <select aria-label="Date range" className={sel} value={range} onChange={(e) => setRange(e.target.value as Range)}>
          {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </PageTitle>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {stats.map((s, i) => (
          <div key={s.label} className={`rounded-2xl border bg-card p-4 sm:p-5 ${i === 0 ? "col-span-2 lg:col-span-1" : ""}`}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-primary sm:text-3xl">{s.value}</p>
            {s.hint && <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="text-xl font-semibold">Needs attention</h2>
            {attention.length ? (
              <ul className="mt-3 space-y-2">
                {attention.map((a) => (
                  <li key={a.text}>
                    <Link to={a.to} className="flex items-center gap-3 rounded-xl px-2 py-2 font-semibold hover:bg-secondary">
                      <a.icon aria-hidden className="size-5 text-accent-foreground" />
                      {a.text}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-muted-foreground">You're all caught up.</p>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-5">
            <h2 className="text-xl font-semibold">Quick actions</h2>
            <ul className="mt-3 grid gap-2">
              {actions.map((a, i) => (
                <li key={a.label}>
                  <Link to={a.to} className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${i === 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary hover:bg-secondary/70"}`}>
                    <a.icon aria-hidden className="size-5" />
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-semibold">Recent activity</h2>
          {activity.length ? (
            <ul className="mt-3 divide-y">
              {activity.map((a, i) => (
                <li key={i}>
                  <Link to={a.to} className="flex flex-wrap items-baseline justify-between gap-2 px-1 py-3 hover:bg-secondary/50">
                    <span className="min-w-0 break-words">{a.text}</span>
                    <time className="text-sm text-muted-foreground" dateTime={a.at}>{new Date(a.at).toLocaleDateString()}</time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-muted-foreground">Nothing yet. New inquiries, suggestions and sales will show up here.</p>
          )}
        </section>
      </div>
    </>
  );
}
