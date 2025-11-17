import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { PawPrint, HelpCircle } from "lucide-react";
import { VetRegistrationDialog } from "./VetRegistrationDialog";
import { PetOwnerAuthDialog } from "./PetOwnerAuthDialog";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const location = useLocation();
  const [vetDialogOpen, setVetDialogOpen] = useState(false);
  const [petOwnerDialogOpen, setPetOwnerDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const isVetPage = location.pathname === "/for-vets";

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setUserRole(session?.user?.user_metadata?.role ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setUserRole(session?.user?.user_metadata?.role ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="font-bold text-base sm:text-xl whitespace-nowrap">Pet2Vet<span className="text-muted-foreground">.app</span></span>
          </Link>
          
          <nav className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Link 
              to="/" 
              className={`text-xs sm:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="hidden sm:inline">For Pet Owners</span>
              <span className="sm:hidden">Pet Owners</span>
            </Link>
            
            {/* Only show "For Vets" link if user is not logged in OR user is a vet */}
            {(!user || userRole === "vet") && (
              <Link 
                to="/for-vets" 
                className={`text-xs sm:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                  isVetPage ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="hidden sm:inline">For Vets</span>
                <span className="sm:hidden">Vets</span>
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                    <span className="max-w-[100px] sm:max-w-none truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={userRole === "vet" ? "/vet-dashboard" : "/pet-owner-dashboard"}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">My account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => { await supabase.auth.signOut(); }}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {isVetPage ? (
                  <Button size="sm" onClick={() => setVetDialogOpen(true)} className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-4 whitespace-nowrap">
                    Join as Vet
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setPetOwnerDialogOpen(true)} className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
                    Log in
                  </Button>
                )}
              </>
            )}
            
            {/* Help Icon */}
            <Link 
              to="/help" 
              className={`flex items-center gap-1 text-xs font-medium transition-colors hover:text-primary flex-shrink-0 ${
                location.pathname === "/help" ? "text-primary" : "text-muted-foreground"
              }`}
              title="Help"
            >
              <HelpCircle className="h-4 w-4 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline text-xs">Help</span>
            </Link>
          </nav>
        </div>
      </header>
      
      <VetRegistrationDialog 
        open={vetDialogOpen} 
        onOpenChange={setVetDialogOpen}
        mode="signup"
      />

      <PetOwnerAuthDialog 
        open={petOwnerDialogOpen} 
        onOpenChange={setPetOwnerDialogOpen}
      />
    </>
  );
};
