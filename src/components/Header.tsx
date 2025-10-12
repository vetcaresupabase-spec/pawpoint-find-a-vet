import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const Header = () => {
  const location = useLocation();
  
  return (
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
              location.pathname === "/for-vets" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            For Vets
          </Link>
          <Button asChild size="sm">
            <Link to="/for-vets">Join as a Vet</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
