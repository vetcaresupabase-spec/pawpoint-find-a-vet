import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Bell, Heart, Users, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [petType, setPetType] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?petType=${encodeURIComponent(petType)}&location=${encodeURIComponent(location)}`);
  };
  return <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>
        
        <div className="container grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Find trusted vets near you: for every wag, purr, and feather.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
              Book appointments online in seconds and keep your pet's health records in one place.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-card rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2 max-w-3xl border border-border">
              <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Pet type / service" 
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                />
              </div>
              <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="City or postal code" 
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8">
                Search
              </Button>
            </form>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
            <img src={heroImage} alt="Happy pet owner with veterinarian and dog" className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]" />
          </div>
        </div>
      </section>

      {/* For Pet Owners Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16">
            Your everyday partner in pet care.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 transition-colors">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Book online — anytime, anywhere.</h3>
              <p className="text-muted-foreground">
                Find and book appointments with trusted vets in your area, 24/7. No more phone tag.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-accent/5 to-transparent hover:from-accent/10 transition-colors">
              <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
                <Bell className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Never miss a visit — get automatic reminders.</h3>
              <p className="text-muted-foreground">
                Receive timely notifications for upcoming appointments and important pet health milestones.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-secondary/30 to-transparent hover:from-secondary/40 transition-colors">
              <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center">
                <Heart className="h-10 w-10 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">All your pet's info in one digital health card.</h3>
              <p className="text-muted-foreground">
                Keep vaccination records, prescriptions, and visit history organized. <span className="text-sm text-accent font-medium">(Coming soon)</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Veterinarians Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container">
          <div className="max-w-5xl mx-auto bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="p-8 lg:p-12 space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Grow your practice with PetFinder.
                </h2>
                <p className="text-muted-foreground text-lg">
                  Simplify your schedule, reduce no-shows, and attract new clients. Join free for 3 months and experience the difference.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link to="/for-vets">Join as a Vet</Link>
                </Button>
              </div>
              
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 lg:p-12 space-y-4 h-full flex flex-col justify-center">
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-foreground">Attract new pet owners looking for trusted care nearby</p>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-foreground">Manage your schedule with automated booking and reminders</p>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-foreground">Reduce administrative burden and focus on patient care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Privacy Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Your pet's health, your privacy.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All data is securely stored and never shared without consent. We're committed to protecting your information and your pet's medical records with industry-leading security standards.
            </p>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
              <Link to="/privacy">Learn how we protect your privacy</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* App Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Trusted by pet lovers and clinics across Europe.
                </h2>
                <p className="text-lg text-muted-foreground">
                  PetFinder makes accessing veterinary care fast and easy. Join thousands of pet owners who trust us to keep their furry, feathered, and scaled companions healthy.
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-accent text-accent" />)}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    4.8 ★ Over 100,000+ reviews
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-card hover:bg-muted border-2 h-14 px-6"
                    onClick={() => window.open("https://apps.apple.com/", "_blank")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center">
                        <span className="text-background text-xl font-bold">📱</span>
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">Download on the</div>
                        <div className="text-sm font-semibold">App Store</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-card hover:bg-muted border-2 h-14 px-6"
                    onClick={() => window.open("https://play.google.com/", "_blank")}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center">
                        <span className="text-background text-xl font-bold">▶</span>
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">Get it on</div>
                        <div className="text-sm font-semibold">Google Play</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl" />
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary fill-primary" />
              <span className="text-lg font-bold">PetFinder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 PetFinder. Caring for pets, one appointment at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;