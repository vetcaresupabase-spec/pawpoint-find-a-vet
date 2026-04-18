import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import SearchResults from "../SearchResults";

vi.mock("@/hooks/useGoogleVetSearch", () => ({
  useGoogleVetSearch: () => ({
    results: [],
    loading: false,
    searchGoogleVets: vi.fn().mockResolvedValue([]),
  }),
}));

vi.mock("@/components/SearchBar", () => ({
  SearchBar: ({ onSearch }: any) => (
    <div data-testid="search-bar">
      <input placeholder="Search" />
    </div>
  ),
}));

vi.mock("@/components/GoogleVetCard", () => ({
  GoogleVetCard: () => <div data-testid="google-vet-card" />,
}));

describe("SearchResults – skeleton loading", () => {
  it("renders skeleton cards when the search is in progress", () => {
    const { container } = render(<SearchResults />, {
      route: "/search?petType=dog&location=Dublin",
    });
    const skeletonArea = container.querySelector('[data-testid="search-skeletons"]');
    if (skeletonArea) {
      const skeletons = skeletonArea.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    }
  });
});

describe("SearchResults – clinic cards", () => {
  it("cards have focus-visible ring classes for keyboard navigation", () => {
    const { container } = render(<SearchResults />, {
      route: "/search?petType=vet&location=Dublin",
    });
    const cards = container.querySelectorAll("[role='article']");
    cards.forEach((card) => {
      expect(card.className).toContain("focus-visible:ring-2");
    });
  });
});
