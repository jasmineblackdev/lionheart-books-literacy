import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { classSetEmail, classSetSchema } from "@/lib/class-sets";

const submit = vi.fn();
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => submit }));
vi.mock("@/lib/class-sets.functions", () => ({ submitClassSetInquiry: {} }));

const { ClassSetForm } = await import("@/components/class-set-form");

function fillForm() {
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ms. O'Hara" } });
  fireEvent.change(screen.getByLabelText("School or organization"), { target: { value: "Oak & Pine Elementary" } });
  fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "teacher@school.org" } });
  fireEvent.change(screen.getByLabelText("Approximate quantity"), { target: { value: "30" } });
  fireEvent.change(screen.getByLabelText(/Message/), { target: { value: "Cursive Safari, grade 3?" } });
  fireEvent.click(screen.getByRole("button", { name: "Send class-set inquiry" }));
}

beforeEach(() => submit.mockReset());

describe("class-set inquiry form", () => {
  it("sends the inquiry to the server and confirms it was sent", async () => {
    submit.mockResolvedValue({ ok: true });
    render(<ClassSetForm />);
    fillForm();

    expect(await screen.findByText("Thanks! Your inquiry was sent")).toBeInTheDocument();
    expect(submit).toHaveBeenCalledWith({
      data: {
        name: "Ms. O'Hara",
        org: "Oak & Pine Elementary",
        email: "teacher@school.org",
        quantity: 30,
        message: "Cursive Safari, grade 3?",
        website: "",
      },
    });
  });

  it("shows the server's error and keeps the form when sending fails", async () => {
    submit.mockResolvedValue({ ok: false, error: "Sorry, your inquiry couldn't be sent." });
    render(<ClassSetForm />);
    fillForm();

    expect(await screen.findByRole("alert")).toHaveTextContent("Sorry, your inquiry couldn't be sent.");
    expect(screen.getByRole("button", { name: "Send class-set inquiry" })).toBeInTheDocument();
  });

  it("does not send when required fields are missing", () => {
    render(<ClassSetForm />);
    fireEvent.click(screen.getByRole("button", { name: "Send class-set inquiry" }));

    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Please fix the highlighted fields.");
  });
});

describe("class-set inquiry email", () => {
  it("builds the subject and body sent to the owner", () => {
    const d = classSetSchema.parse({ name: "Ann", org: "Oak School", email: "ann@oak.org", quantity: "25", message: "Grade 2" });
    expect(classSetEmail(d)).toEqual({
      subject: "Class-set inquiry: Oak School",
      text: "Name: Ann\nSchool/organization: Oak School\nEmail: ann@oak.org\nApprox. quantity: 25\n\nGrade 2",
    });
  });

  it("rejects a filled honeypot field", () => {
    expect(classSetSchema.safeParse({ name: "A", org: "B", email: "a@b.co", quantity: "1", website: "spam.com" }).success).toBe(false);
  });
});
