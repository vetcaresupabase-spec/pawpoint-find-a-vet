import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TranslationBanner } from "@/components/TranslationBanner";
import Index from "./pages/Index";
import ForVets from "./pages/ForVets";
import VetOnboarding from "./pages/VetOnboarding";
import VetDashboard from "./pages/VetDashboard";
import PetOwnerDashboard from "./pages/PetOwnerDashboard";
import SearchResults from "./pages/SearchResults";
import ClinicProfile from "./pages/ClinicProfile";
import BookAppointment from "./pages/BookAppointment";
import Account from "./pages/Account";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TranslationBanner />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/for-vets" element={<ForVets />} />
          <Route path="/vet-onboarding" element={<VetOnboarding />} />
          <Route path="/vet-dashboard" element={<VetDashboard />} />
          <Route path="/pet-owner-dashboard" element={<PetOwnerDashboard />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/clinic/:id" element={<ClinicProfile />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/account" element={<Account />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
