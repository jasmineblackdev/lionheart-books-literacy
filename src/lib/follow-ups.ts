import type { InquiryRow } from "./admin-api";

/** Today's date as YYYY-MM-DD in the viewer's own time zone. */
export function todayIso(now = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** A follow-up is due on or after its date, until the inquiry is marked Done. */
export function isFollowUpDue(r: Pick<InquiryRow, "follow_up_on" | "status">, today = todayIso()) {
  return !!r.follow_up_on && r.follow_up_on <= today && r.status !== "done";
}

/** "Follow up today", "Follow-up overdue since Oct 9", or "Follow up Oct 20". */
export function followUpLabel(date: string, today = todayIso()) {
  const nice = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: date.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric" });
  if (date === today) return "Follow up today";
  return date < today ? `Follow-up overdue since ${nice}` : `Follow up ${nice}`;
}
