import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start/server", () => ({ getRequest: () => undefined }));
const { saveSubmission } = await import("@/lib/forms.server");

const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("FORMS_SECRET", "test-secret");
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("saving form submissions through the forms edge function", () => {
  it("posts the row with the shared secret", async () => {
    fetchMock.mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    expect(await saveSubmission("class_set", { name: "Ann" }, "abc")).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://example.supabase.co/functions/v1/forms");
    expect(init.headers["x-forms-secret"]).toBe("test-secret");
    expect(JSON.parse(init.body)).toEqual({ type: "class_set", row: { name: "Ann" }, ip_hash: "abc" });
  });

  it("reports a rate limit separately from other failures", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 429 }));
    expect(await saveSubmission("suggestion", {}, "abc")).toEqual({ ok: false, reason: "rate_limited" });
    fetchMock.mockResolvedValue(new Response("{}", { status: 500 }));
    expect(await saveSubmission("suggestion", {}, "abc")).toEqual({ ok: false, reason: "failed" });
    fetchMock.mockRejectedValue(new Error("offline"));
    expect(await saveSubmission("suggestion", {}, "abc")).toEqual({ ok: false, reason: "failed" });
  });

  it("fails without calling out when the secret is missing", async () => {
    vi.stubEnv("FORMS_SECRET", "");
    expect(await saveSubmission("suggestion", {}, "abc")).toEqual({ ok: false, reason: "failed" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
