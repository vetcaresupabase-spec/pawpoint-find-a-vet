import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import BookAppointment from "../BookAppointment";

vi.mock("@/hooks/useServices", () => ({
  useActiveServices: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/components/PetOwnerAuthDialog", () => ({
  PetOwnerAuthDialog: () => null,
}));

describe("BookAppointment – loading state", () => {
  it("renders skeletons instead of plain Loading text while fetching clinic", () => {
    const { container } = render(<BookAppointment />, {
      route: "/book-appointment?clinicId=test-id",
    });
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [data-testid="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("BookAppointment – accessibility", () => {
  it("week navigation icon-only buttons have aria-labels", async () => {
    const { container } = render(<BookAppointment />, {
      route: "/book-appointment?clinicId=test-id",
    });
    await vi.waitFor(() => {
      const iconButtons = container.querySelectorAll('button[class*="icon"]');
      iconButtons.forEach((btn) => {
        if (!btn.textContent?.trim()) {
          expect(
            btn.getAttribute("aria-label") || btn.getAttribute("title")
          ).toBeTruthy();
        }
      });
    });
  });
});
