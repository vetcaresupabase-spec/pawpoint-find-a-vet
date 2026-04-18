import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", ...options }: CustomRenderOptions = {}
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <TooltipProvider>{children}</TooltipProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

export * from "@testing-library/react";
export { renderWithProviders as render };
