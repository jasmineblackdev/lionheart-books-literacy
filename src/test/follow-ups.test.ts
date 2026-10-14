import { describe, expect, it } from "vitest";
import { followUpLabel, isFollowUpDue, todayIso } from "@/lib/follow-ups";

describe("school order follow-ups", () => {
  it("is due on or after its date until the order is Done", () => {
    expect(isFollowUpDue({ follow_up_on: "2026-10-12", status: "new" }, "2026-10-12")).toBe(true);
    expect(isFollowUpDue({ follow_up_on: "2026-10-01", status: "replied" }, "2026-10-12")).toBe(true);
    expect(isFollowUpDue({ follow_up_on: "2026-10-20", status: "new" }, "2026-10-12")).toBe(false);
    expect(isFollowUpDue({ follow_up_on: "2026-10-01", status: "done" }, "2026-10-12")).toBe(false);
    expect(isFollowUpDue({ follow_up_on: null, status: "new" }, "2026-10-12")).toBe(false);
  });

  it("labels today, overdue and upcoming follow-ups", () => {
    expect(followUpLabel("2026-10-12", "2026-10-12")).toBe("Follow up today");
    expect(followUpLabel("2026-10-09", "2026-10-12")).toMatch(/^Follow-up overdue since Oct 9$/);
    expect(followUpLabel("2026-10-20", "2026-10-12")).toMatch(/^Follow up Oct 20$/);
  });

  it("uses the viewer's local date", () => {
    expect(todayIso(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});
