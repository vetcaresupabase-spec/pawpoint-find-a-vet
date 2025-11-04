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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pet2Vet<span className="text-muted-foreground">.app</span></span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              For Pet Owners
            </Link>
            
            {/* Only show "For Vets" link if user is not logged in OR user is a vet */}
            {(!user || userRole === "vet") && (
              <Link 
                to="/for-vets" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isVetPage ? "text-primary" : "text-muted-foreground"
                }`}
              >
                For Vets
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">{user.email}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
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
                  <Button size="sm" onClick={() => setVetDialogOpen(true)}>
                    Join as a Vet
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setPetOwnerDialogOpen(true)}>
                    Log in
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
        
        {/* Help section in corner */}
        <Link 
          to="/help" 
          className={`absolute top-1/2 -translate-y-1/2 right-2 md:right-4 text-xs font-medium transition-colors hover:text-primary flex items-center gap-1 z-10 ${
            location.pathname === "/help" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span className="hidden lg:inline text-xs">Help</span>
        </Link>
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
