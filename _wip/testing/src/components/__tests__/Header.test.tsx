import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import { Header } from "../Header";

describe("Header – navigation", () => {
  it("renders a banner landmark role", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders a navigation landmark", () => {
    render(<Header />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("highlights the active route with aria-current", () => {
    render(<Header />, { route: "/for-vets" });
    const vetLink = screen.getByRole("link", { name: /for vets|vets/i });
    expect(vetLink).toHaveAttribute("aria-current", "page");
  });
});

describe("Header – accessibility", () => {
  it("icon-only help link has an aria-label", () => {
    render(<Header />);
    const helpLink = screen.getByTitle("Help").closest("a");
    expect(helpLink).toHaveAttribute("aria-label");
  });
});
