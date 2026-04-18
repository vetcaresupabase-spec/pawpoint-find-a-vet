import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, CheckCircle2, Calendar, SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { Clinic } from "@/integrations/supabase/queries";
import { useGoogleVetSearch } from "@/hooks/useGoogleVetSearch";
import { GoogleVetCard } from "@/components/GoogleVetCard";

interface ClinicSearchResult {
  id: string;
  name: string;
  city: string;
  address_line1: string | null;
  postcode: string | null;
  distance_m: number | null;
  specialties: string[] | null;
}

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const petType = searchParams.get("petType") || "";
  const location = searchParams.get("location") || "";
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Google Vets Search
  const { 
    results: googleVets, 
    loading: googleLoading, 
    searchGoogleVets 
  } = useGoogleVetSearch();

  useEffect(() => {
    const performSearch = async () => {
      if (!petType && !location) {
        setClinics([]);
        return;
      }

      setLoading(true);
      try {
        // Simple direct query - fetch all active clinics matching criteria
        let query = (supabase as any)
          .from("clinics")
          .select("*")
          .eq("is_active", true);

        // Filter by city if location provided (skip "near me")
        const locationTrimmed = location.trim().toLowerCase();
        if (locationTrimmed && locationTrimmed !== "near me") {
          query = query.ilike("city", `%${location.trim()}%`);
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;

        let results = (data || []) as Clinic[];

        // Client-side filter by pet type / name / specialty
        if (petType && petType.trim().length >= 2) {
          const searchLower = petType.trim().toLowerCase();
          results = results.filter((c: any) => {
            const nameMatch = c.name?.toLowerCase().includes(searchLower);
            const specialtyMatch = (c.specialties || []).some((s: string) =>
              s.toLowerCase().includes(searchLower)
            );
            return nameMatch || specialtyMatch;
          });
        }

        setClinics(results);
      } catch (e: any) {
        toast({ title: "Search failed", description: e.message });
        setClinics([]);
      } finally {
        setLoading(false);
      }

      // Google Places search (runs independently, non-blocking)
      const googleParams: any = {};
      if (petType && petType.trim()) {
        googleParams.query = petType.trim();
      }
      if (location && location.trim()) {
        googleParams.query = (googleParams.query ? googleParams.query + " " : "") + location.trim();
      }
      if (googleParams.query) {
        searchGoogleVets(googleParams).catch(() => {});
      }
    };

    performSearch();
  }, [location, petType, searchGoogleVets]);

  const handleSearch = (search: string, loc: string) => {
    setSearchParams({ petType: search, location: loc });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />

      {/* Search Bar */}
      <section className="bg-primary/10 border-b py-8">
        <div className="container">
          <SearchBar 
            defaultSearch={petType} 
            defaultLocation={location}
            onSearch={handleSearch}
          />
        </div>
      </section>

      <div className="container py-8">
        <PageBreadcrumbs items={[{ label: "Search Results" }]} className="mb-4" />
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Clinics {location && `in ${location}`}</h1>
          <p className="text-muted-foreground">{loading ? "Searching..." : `Found ${clinics.length} clinics`}</p>
        </div>

        {loading && (
          <div className="grid gap-4" data-testid="search-skeletons">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-l-4 border-l-transparent">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-[140px_1fr_200px] gap-4">
                    <Skeleton className="aspect-square rounded-tl-lg" />
                    <div className="py-4 space-y-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex flex-col justify-center p-4 gap-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-4">
          {clinics.map((c) => (
            <Card 
              key={c.id} 
              tabIndex={0}
              role="article"
              className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => navigate(`/clinic/${c.id}`)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/clinic/${c.id}`); } }}
            >
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[140px_1fr_200px] gap-4">
                  {/* Clinic Profile Picture */}
                  <div className="relative">
                    <div className="aspect-square rounded-tl-lg bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center shadow-md">
                        <span className="text-4xl font-bold text-primary">
                          {c.name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Info */}
                  <div className="py-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold text-foreground">{c.name}</h2>
                          {c.verified && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {(c.specialties || []).join(", ") || "Veterinary Clinic"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{c.address_line1}, {c.city}</span>
                    </div>

                    {c.languages && c.languages.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.languages.map((lang, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm pt-2">
                      {c.phone && (
                        <a 
                          href={`tel:${c.phone}`} 
                          className="text-primary hover:text-primary/80 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{c.phone}</span>
                        </a>
                      )}
                      {c.email && (
                        <a 
                          href={`mailto:${c.email}`} 
                          className="text-primary hover:text-primary/80 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Email</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Booking Actions */}
                  <div className="flex flex-col justify-center p-4 gap-2 bg-muted/50">
                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book-appointment?clinicId=${c.id}`);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-xs">Book Appointment</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/clinic/${c.id}`);
                      }}
                    >
                      View Profile
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-1">
                      Available appointments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {(!loading && clinics.length === 0 && !googleLoading && googleVets.length === 0) && (
          <Card className="p-12 text-center">
            <SearchX className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or location
            </p>
            <Button onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </Card>
        )}

        {/* Google Vets Section */}
        {(googleVets.length > 0 || googleLoading) && (
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">More Vets Nearby</h2>
              <p className="text-muted-foreground">
                {googleLoading 
                  ? "Searching Google Maps..." 
                  : `Found ${googleVets.length} additional vets from Google Maps`}
              </p>
            </div>

            {googleLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-9 w-28" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {googleVets.map((vet) => (
                  <GoogleVetCard key={vet.google_place_id} clinic={vet} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
