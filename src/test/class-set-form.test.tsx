import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { INQUIRY_BOOKS, bookNames, classSetEmail, classSetSchema } from "@/lib/class-sets";
import { books, comingSoon } from "@/lib/site";

const submit = vi.fn();
// A plain function for simulating network failures: vi.fn records each rejected result and
// reports it as an error even though the form catches it.
let failWith: Error | null = null;
vi.mock("@tanstack/react-start", () => ({
  useServerFn: () => (args: unknown) => (failWith ? Promise.reject(failWith) : submit(args)),
}));
vi.mock("@/lib/class-sets.functions", () => ({ submitClassSetInquiry: {} }));

const { ClassSetForm } = await import("@/components/class-set-form");

function fill(overrides: Partial<Record<"name" | "org" | "email" | "quantity" | "message", string>> = {}, pick = ["Cursive Safari", "Times Table Safari"]) {
  const v = { name: "Ms. O'Hara", org: "Oak & Pine Elementary", email: "teacher@school.org", quantity: "30", message: "Grade 3", ...overrides };
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: v.name } });
  fireEvent.change(screen.getByLabelText("School or organization"), { target: { value: v.org } });
  fireEvent.change(screen.getByLabelText("Work email"), { target: { value: v.email } });
  fireEvent.change(screen.getByLabelText("Approximate quantity"), { target: { value: v.quantity } });
  fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: v.message } });
  for (const name of pick) fireEvent.click(screen.getByRole("checkbox", { name }));
}
const send = () => fireEvent.click(screen.getByRole("button", { name: "Send class-set inquiry" }));

beforeEach(() => {
  submit.mockReset();
  failWith = null;
});

describe("class-set inquiry form", () => {
  it("offers every available and coming-soon book, plus Not sure yet, in labelled groups", () => {
    render(<ClassSetForm />);
    const group = screen.getByRole("group", { name: "Which books are you interested in?" });
    expect(within(group).getAllByRole("checkbox")).toHaveLength(books.length + comingSoon.length + 1);
    expect(within(group).getByText("Available now")).toBeInTheDocument();
    expect(within(group).getByText("Also interested in (coming soon)")).toBeInTheDocument();
    for (const b of [...books, ...comingSoon]) expect(within(group).getByRole("checkbox", { name: b.short })).toBeInTheDocument();
  });

  it("sends the chosen books and confirms them, moving focus to the confirmation", async () => {
    submit.mockResolvedValue({ ok: true });
    render(<ClassSetForm />);
    fill({ quantity: "1,200" });
    send();
    const heading = await screen.findByRole("heading", { name: /Thanks! Your inquiry was sent/ });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByRole("status")).toHaveTextContent("Cursive Safari, Times Table Safari (coming soon)");
    expect(submit).toHaveBeenCalledWith({
      data: {
        name: "Ms. O'Hara",
        org: "Oak & Pine Elementary",
        email: "teacher@school.org",
        books: ["cursive-safari", "times-table-safari"],
        quantity: 1200,
        message: "Grade 3",
        website: "",
      },
    });
  });

  it("lists every problem and focuses the first invalid field", async () => {
    render(<ClassSetForm />);
    fill({ name: "", quantity: "0" }, []);
    send();
    expect(submit).not.toHaveBeenCalled();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Please fix these 3 fields");
    expect(alert).toHaveTextContent("Your name: Please enter your name.");
    expect(alert).toHaveTextContent("Books: Choose at least one book");
    expect(alert).toHaveTextContent("Approximate quantity: Enter how many copies you need (at least 1).");
    await waitFor(() => expect(screen.getByLabelText("Your name")).toHaveFocus());
    expect(screen.getByLabelText("Your name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Approximate quantity")).toHaveAccessibleDescription(/1 to 10,000.*at least 1/);
    fireEvent.click(within(alert).getByRole("button", { name: /^Approximate quantity/ }));
    expect(screen.getByLabelText("Approximate quantity")).toHaveFocus();
  });

  it("rejects quantities that aren't whole numbers from 1 to 10,000", () => {
    const cases: [string, string][] = [["abc", "whole number"], ["2.5", "whole number"], ["10001", "please email us directly"]];
    for (const [q, msg] of cases) {
      const { unmount } = render(<ClassSetForm />);
      fill({ quantity: q });
      send();
      expect(screen.getByRole("alert")).toHaveTextContent(new RegExp(msg));
      expect(submit).not.toHaveBeenCalled();
      unmount();
    }
  });

  it("shows the server's error and keeps the form when sending fails", async () => {
    submit.mockResolvedValue({ ok: false, error: "Sorry, your inquiry couldn't be sent." });
    render(<ClassSetForm />);
    fill();
    send();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Sorry, your inquiry couldn't be sent.");
    await waitFor(() => expect(alert).toHaveFocus());
    expect(screen.getByRole("button", { name: "Send class-set inquiry" })).toBeInTheDocument();
  });

  it("offers the email address when the network fails", async () => {
    failWith = new TypeError("Failed to fetch");
    render(<ClassSetForm />);
    fill();
    send();
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("link", { name: "jblionheartbooks@gmail.com" })).toHaveAttribute("href", "mailto:jblionheartbooks@gmail.com");
  });
});

describe("class-set inquiry email", () => {
  it("builds the subject and body sent to the owner, including the books", () => {
    const d = classSetSchema.parse({ name: "Ann", org: "Oak School", email: "ann@oak.org", books: ["abc-animal-adventure", "unsure"], quantity: "25", message: "Grade 2" });
    expect(classSetEmail(d)).toEqual({
      subject: "Class-set inquiry: Oak School",
      text: "Name: Ann\nSchool/organization: Oak School\nEmail: ann@oak.org\nBooks: ABC Animal Adventure, Not sure yet\nApprox. quantity: 25\n\nGrade 2",
    });
  });

  it("names coming-soon books clearly and tolerates older inquiries without books", () => {
    expect(bookNames(["safari-math-detectives"])).toBe("Safari Math Detectives (coming soon)");
    expect(bookNames(null)).toBe("");
    expect(INQUIRY_BOOKS.at(-1)?.value).toBe("unsure");
  });

  it("rejects a filled honeypot field and unknown books", () => {
    const base = { name: "A", org: "B", email: "a@b.co", quantity: "1", books: ["cursive-safari"] };
    expect(classSetSchema.safeParse(base).success).toBe(true);
    expect(classSetSchema.safeParse({ ...base, website: "spam.com" }).success).toBe(false);
    expect(classSetSchema.safeParse({ ...base, books: ["not-a-book"] }).success).toBe(false);
  });
});
