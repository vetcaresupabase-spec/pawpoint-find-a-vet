import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import NotFound from "../NotFound";

vi.mock("@/components/SearchBar", () => ({
  SearchBar: () => (
    <div data-testid="search-bar">
      <input placeholder="Search" />
    </div>
  ),
}));

describe("NotFound page", () => {
  it("renders the Header component", () => {
    render(<NotFound />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });

  it("renders a descriptive message", () => {
    render(<NotFound />);
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("renders a link back to home", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /return to home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders a search bar so users can search from 404", () => {
    render(<NotFound />);
    expect(
      screen.getByPlaceholderText(/search/i)
    ).toBeInTheDocument();
  });

  it("uses theme tokens instead of hardcoded gray/blue colors", () => {
    const { container } = render(<NotFound />);
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv.className).not.toMatch(/bg-gray-100/);
    const textEl = screen.getByText(/page not found/i);
    expect(textEl.className).not.toMatch(/text-gray-600/);
  });
});
