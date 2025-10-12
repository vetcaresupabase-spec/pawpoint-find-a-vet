import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { VetRegistrationDialog } from "./VetRegistrationDialog";
import { toast } from "@/hooks/use-toast";

export const Header = () => {
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const isVetPage = location.pathname === "/for-vets";
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-bold text-xl">PetFinder</span>
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
            <Link 
              to="/for-vets" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isVetPage ? "text-primary" : "text-muted-foreground"
              }`}
            >
              For Vets
            </Link>
            
            {isVetPage ? (
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                Join as a Vet
              </Button>
            ) : (
              <Button size="sm" onClick={() => toast({ title: "Login", description: "Login functionality coming soon!" })}>
                Log in
              </Button>
            )}
          </nav>
        </div>
      </header>
      
      <VetRegistrationDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        mode="signup"
      />
    </>
  );
};
