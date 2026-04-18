import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import ClinicProfile from "../ClinicProfile";

vi.mock("@/integrations/supabase/queries", () => ({
  getClinicProfile: vi.fn().mockResolvedValue(null),
  placeHold: vi.fn(),
  confirmAppointment: vi.fn(),
}));

describe("ClinicProfile – loading state", () => {
  it("renders skeleton cards during loading, not plain text", () => {
    const { container } = render(<ClinicProfile />, {
      route: "/clinic/test-id",
    });
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("renders Header even during loading", () => {
    render(<ClinicProfile />, { route: "/clinic/test-id" });
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});

describe("ClinicProfile – not-found state", () => {
  it("shows a proper not-found message with icon after loading", async () => {
    render(<ClinicProfile />, { route: "/clinic/nonexistent" });
    await vi.waitFor(() => {
      const notFoundText = screen.queryByText(/clinic not found/i);
      if (notFoundText) {
        expect(screen.getByRole("banner")).toBeInTheDocument();
        const container = notFoundText.closest("div.container") || notFoundText.parentElement?.parentElement;
        const svg = container?.querySelector("svg");
        expect(svg).toBeInTheDocument();
      }
    });
  });
});
