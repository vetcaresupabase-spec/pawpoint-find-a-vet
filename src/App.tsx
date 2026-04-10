import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TranslationBanner } from "@/components/TranslationBanner";
import { initialisePushNotifications } from "@/lib/notifications";
import { supabase } from "@/integrations/supabase/client";
import { FEATURES } from "@/config/features";
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
import Help from "./pages/Help";
import PetParks from "./pages/PetParks";
import PetShops from "./pages/PetShops";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    try {
      initialisePushNotifications();
    } catch (error) {
      console.error("[App] Push notification init failed:", error);
    }
  }, []);

  useEffect(() => {
    if (!FEATURES.GAMIFICATION) return;

    const trackLogin = async (userId: string) => {
      try {
        await supabase.rpc("record_user_action" as any, {
          p_user_id: userId,
          p_action: "DAILY_LOGIN",
        });
      } catch { /* non-critical */ }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.id) {
          trackLogin(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) trackLogin(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
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
            <Route path="/help" element={<Help />} />
            <Route path="/pet-parks" element={<PetParks />} />
            <Route path="/pet-shops" element={<PetShops />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
