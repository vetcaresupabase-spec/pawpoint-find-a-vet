import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Phone, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PetOwnerAuthDialog } from "@/components/PetOwnerAuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { searchClinics, Clinic } from "@/integrations/supabase/queries";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const petType = searchParams.get("petType") || "";
  const location = searchParams.get("location") || "";
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleBookAppointment = (vetName: string) => {
    if (!isLoggedIn) {
      setAuthDialogOpen(true);
    } else {
      toast({ 
        title: "Booking Appointment", 
        description: `Scheduling appointment with ${vetName}` 
      });
    }
  };
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />

      {/* Search Bar */}
      <section className="bg-primary/5 border-b py-8">
        <div className="container">
          <div className="bg-card rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2 max-w-4xl mx-auto border border-border">
            <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Pet type / service"
                defaultValue={petType}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="City or postal code"
                defaultValue={location}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
            </div>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Clinics {location && `in ${location}`}</h1>
          <p className="text-muted-foreground">{loading ? "Searching..." : `Found ${clinics.length} clinics`}</p>
        </div>

        <div className="grid gap-6">
          {clinics.map((c) => (
            <Card key={vet.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-[200px_1fr_auto] gap-6">
                  {/* Vet Image */}
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    <img
                      src={vet.image}
                      alt={vet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Vet Info */}
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-2xl font-bold">{c.name}</h2>
                      <p className="text-lg text-muted-foreground">{c.city}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-accent text-accent" />
                        <span className="font-semibold">{vet.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({vet.reviews} reviews)
                      </span>
                      <Badge variant="secondary">{vet.distance}</Badge>
                    </div>

                    <p className="text-muted-foreground"><strong>Specialties:</strong> {(c.specialties || []).join(", ")}</p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{c.address_line1}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${c.phone}`} className="hover:text-primary">
                          {c.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${c.email}`} className="hover:text-primary">
                          {c.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Verified: {c.verified ? "Yes" : "No"}</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleBookAppointment(c.name)}
                      >
                        Book Appointment
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/clinic/${c.id}`)}
                      >
                        View Profile
                      </Button>
                    </div>
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
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </Card>
        )}
      </div>

      <PetOwnerAuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
      />
    </div>
  );
};

export default SearchResults;
