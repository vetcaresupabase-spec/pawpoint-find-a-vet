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
import { searchClinics, Clinic } from "@/integrations/supabase/queries";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const petType = searchParams.get("petType") || "";
  const location = searchParams.get("location") || "";
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await searchClinics({ city: location });
        setClinics(list);
      } catch (e: any) {
        toast({ title: "Search failed", description: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [location]);

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
