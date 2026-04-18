import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { PawPrint } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Silently track 404 - could be sent to analytics
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <div className="container flex flex-col items-center justify-center py-20 px-4">
        <PawPrint className="h-16 w-16 text-muted-foreground/40 mb-6" />
        <h1 className="mb-2 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Oops! Page not found
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Return to Home
        </Link>
        <div className="mt-10 w-full max-w-xl">
          <p className="mb-3 text-center text-sm text-muted-foreground">
            Or try searching for what you need:
          </p>
          <SearchBar />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
