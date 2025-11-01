import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clinic } from "@/integrations/supabase/queries";

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

  useEffect(() => {
    (async () => {
      // Only search if we have search criteria
      if (!petType && !location) {
        setClinics([]);
        return;
      }

      setLoading(true);
      try {
        let searchResults: ClinicSearchResult[] = [];
        const hasNameSearch = petType.trim().length >= 2;
        const hasLocationSearch = location.trim().length >= 2;

        if (hasLocationSearch) {
          // Location-based search with radius expansion (same as SearchBar)
          const isNearMe = location.toLowerCase() === "near me";
          const cityOrPostcode = !isNearMe && location.trim().length >= 2 ? location.trim() : null;
          
          // Try to get user's geolocation if "Near me"
          let coords: { lat: number; lng: number } | null = null;
          if (isNearMe && "geolocation" in navigator) {
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: false,
                  maximumAge: 300000,
                  timeout: 8000
                });
              });
              coords = { lat: position.coords.latitude, lng: position.coords.longitude };
            } catch (error) {
              console.log("Geolocation failed, searching without coords");
            }
          }

          // Search with radius expansion
          const radii = [15000, 50000, 100000, 200000];
          for (const radius of radii) {
            const { data, error } = await (supabase as any).rpc("fn_search_clinics", {
              in_lat: coords?.lat ?? null,
              in_lng: coords?.lng ?? null,
              in_city_or_postcode: cityOrPostcode,
              in_radius_m: radius,
              in_limit: 50,
            });

            if (!error && data && (data as any[]).length > 0) {
              searchResults = data as ClinicSearchResult[];
              break;
            }
          }
        } else {
          // Name-only search (no location)
          const { data, error } = await (supabase as any)
            .from("clinics")
            .select("id, name, city, address_line1, postcode, specialties, phone, email, is_active")
            .eq("is_active", true)
            .limit(50);

          if (!error && data) {
            searchResults = (data as any[]).map((clinic: any) => ({
              ...clinic,
              distance_m: null,
              specialties: clinic.specialties as string[]
            }));
          }
        }

        // Apply name/expertise filter if provided
        if (hasNameSearch && searchResults.length > 0) {
          const searchLower = petType.toLowerCase();
          searchResults = searchResults.filter(clinic => {
            const nameMatch = clinic.name.toLowerCase().includes(searchLower);
            const cityMatch = clinic.city.toLowerCase().includes(searchLower);
            const specialtyMatch = clinic.specialties?.some(s => 
              s.toLowerCase().includes(searchLower)
            ) ?? false;
            
            return nameMatch || cityMatch || specialtyMatch;
          });
        }

        // Convert to Clinic format
        const clinicList: Clinic[] = await Promise.all(
          searchResults.map(async (result) => {
            // Fetch full clinic data
            const { data: fullClinic } = await (supabase as any)
              .from("clinics")
              .select("*")
              .eq("id", result.id)
              .single();

            return (fullClinic || result) as Clinic;
          })
        );

        setClinics(clinicList);
      } catch (e: any) {
        console.error("Search error:", e);
        toast({ title: "Search failed", description: e.message });
        setClinics([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [location, petType]);

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Clinics {location && `in ${location}`}</h1>
          <p className="text-muted-foreground">{loading ? "Searching..." : `Found ${clinics.length} clinics`}</p>
        </div>

        <div className="grid gap-4">
          {clinics.map((c) => (
            <Card 
              key={c.id} 
              className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
              onClick={() => navigate(`/clinic/${c.id}`)}
            >
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[140px_1fr_200px] gap-4">
                  {/* Clinic Profile Picture */}
                  <div className="relative">
                    <div className="aspect-square rounded-tl-lg bg-gradient-to-br from-teal-100 to-blue-100 overflow-hidden flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-md">
                        <span className="text-4xl font-bold text-teal-600">
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
                          <h2 className="text-xl font-bold text-gray-900">{c.name}</h2>
                          {c.verified && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {(c.specialties || []).join(", ") || "Veterinary Clinic"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{c.address_line1}, {c.city}</span>
                    </div>

                    {c.languages && c.languages.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.languages.map((lang, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
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
                          className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{c.phone}</span>
                        </a>
                      )}
                      {c.email && (
                        <a 
                          href={`mailto:${c.email}`} 
                          className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Email</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Booking Actions */}
                  <div className="flex flex-col justify-center p-4 gap-2 bg-gray-50">
                    <Button 
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book-appointment?clinicId=${c.id}`);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
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
        {(!loading && clinics.length === 0) && (
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or location
            </p>
            <Button onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
