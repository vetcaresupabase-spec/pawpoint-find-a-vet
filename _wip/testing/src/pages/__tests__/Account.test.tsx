import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test/test-utils";
import Account from "../Account";

describe("Account – loading state", () => {
  it("renders skeleton instead of plain Loading text", () => {
    const { container } = render(<Account />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("renders Header even during loading", () => {
    render(<Account />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});

describe("Account – form labels", () => {
  it("associates label elements with inputs using htmlFor", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
      data: { user: { email: "test@test.com", user_metadata: { full_name: "Test" } } },
      error: null,
    } as any);

    render(<Account />);
    await vi.waitFor(() => {
      const labels = screen.getAllByText(/email|display name/i);
      labels.forEach((label) => {
        if (label.tagName === "LABEL") {
          expect(label).toHaveAttribute("for");
        }
      });
    });
  });
});
