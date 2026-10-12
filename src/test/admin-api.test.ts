import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession } } }));
const { AdminError, gmailReplyUrl, loadAdminData, setAdminStatus } = await import("@/lib/admin-api");

const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  getSession.mockResolvedValue({ data: { session: { access_token: "tok" } } });
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("admin dashboard API", () => {
  it("sends the signed-in admin's token to the admin function", async () => {
    fetchMock.mockResolvedValue(new Response('{"suggestions":[],"inquiries":[]}', { status: 200 }));
    expect(await loadAdminData()).toEqual({ suggestions: [], inquiries: [] });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toMatch(/\/functions\/v1\/admin$/);
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(JSON.parse(init.body)).toEqual({ action: "list" });
  });

  it("sends status changes with the row kind", async () => {
    fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    await setAdminStatus("class_set", "abc", "replied");
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({ action: "set_status", kind: "class_set", id: "abc", status: "replied" });
  });

  it("treats a missing session as signed out without calling the server", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    await expect(loadAdminData()).rejects.toMatchObject({ code: "signed_out" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports non-admins with their account id", async () => {
    fetchMock.mockResolvedValue(new Response('{"error":"not_admin","userId":"u1"}', { status: 403 }));
    const err = await loadAdminData().catch((e) => e);
    expect(err).toBeInstanceOf(AdminError);
    expect(err).toMatchObject({ code: "not_admin", userId: "u1" });
  });

  it("builds a Gmail reply addressed to the teacher", () => {
    const u = new URL(gmailReplyUrl({ email: "t@school.org", org: "Oak & Pine" }));
    expect(u.origin + u.pathname).toBe("https://mail.google.com/mail/");
    expect(u.searchParams.get("to")).toBe("t@school.org");
    expect(u.searchParams.get("su")).toBe("Re: Class-set inquiry: Oak & Pine");
  });
});
