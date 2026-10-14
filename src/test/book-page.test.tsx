import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { books, comingSoon, getBook } from "@/lib/site";

vi.mock("@/lib/clicks.functions", () => ({ recordAmazonClick: vi.fn(() => Promise.resolve({ ok: true })) }));
const { Gallery } = await import("@/components/gallery");
const { PurchasePanel, StickyBuyBar } = await import("@/components/purchase");
const { recordAmazonClick } = await import("@/lib/clicks.functions");

describe("purchase panel", () => {
  it("uses each book's exact Amazon and Payhip links and counts Amazon clicks", () => {
    for (const b of books) {
      const { unmount } = render(<PurchasePanel book={b} />);
      const amazon = screen.getByRole("link", { name: new RegExp(`^Buy on Amazon: ${b.short} paperback$`) });
      expect(amazon).toHaveAttribute("href", b.amazon);
      expect(amazon).toHaveAttribute("target", "_blank");
      expect(screen.getByRole("link", { name: /^Buy on Payhip: .* digital PDF/ })).toHaveAttribute("href", b.digital.url);
      fireEvent.click(amazon);
      expect(recordAmazonClick).toHaveBeenLastCalledWith({ data: { slug: b.slug } });
      unmount();
    }
  });

  it("shows the free sample download only when the book has one", () => {
    const withSample = getBook("cursive-safari")!;
    const { unmount } = render(<PurchasePanel book={withSample} />);
    expect(screen.getByRole("link", { name: /Free sample pages/ })).toHaveAttribute("href", withSample.sample!.url);
    unmount();
    render(<PurchasePanel book={getBook("rorys-safari-field-guide")!} />);
    expect(screen.queryByRole("link", { name: /Free sample pages/ })).toBeNull();
  });

  it("the phone buy bar starts hidden from assistive tech until the panel scrolls away", () => {
    const { container } = render(<StickyBuyBar book={books[1]} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});

describe("gallery", () => {
  it("offers an enlarge button per page and steps through pages with the arrow keys", () => {
    const images = comingSoon[0]!.previews;
    render(<Gallery images={images} title="Safari Reading Detectives" />);
    const thumbs = screen.getAllByRole("button", { name: /^Enlarge page/ });
    expect(thumbs).toHaveLength(images.length);
    fireEvent.click(thumbs[1]!);
    const dialog = document.querySelector("dialog")!;
    expect(within(dialog).getByText(`Page 2 of ${images.length}`)).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByText(`Page 3 of ${images.length}`)).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByText(`Page 1 of ${images.length}`)).toBeInTheDocument();
    expect(within(dialog).getByRole("img", { hidden: true })).toHaveAttribute("alt", images[0]!.alt);
  });
});
