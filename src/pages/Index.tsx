import { useNavigate } from "react-router-dom";
import { Search, Calendar, Bell, Heart, Users, Shield, Star, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();

  const handleSearch = (search: string, location: string) => {
    navigate(`/search?petType=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`);
  };
  return <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{backgroundImage: 'linear-gradient(to right bottom, #F9F5F1, rgba(243, 227, 206, 0.3), rgba(63, 166, 166, 0.1))'}}>
        <div className="container grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Find trusted vets near you
            </h1>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <p className="text-lg text-foreground">Book appointments online in seconds</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <p className="text-lg text-foreground">Trusted by pet owners across Europe</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <p className="text-lg text-foreground">Available for all your furry, feathered friends</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-3xl">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">4.9</div>
                <div className="text-sm text-muted-foreground">App Rating</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">2,500+</div>
                <div className="text-sm text-muted-foreground">Veterinarians</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-50" />
            <img 
              src={heroImage} 
              alt="Cheerful veterinarian with Golden Retriever, Beagle, cat, rabbit, parakeet, and goldfish in a modern veterinary clinic" 
              className="relative rounded-2xl shadow-2xl w-full h-full object-contain" 
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            In 3 simple steps to your vet
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
            Book appointments with trusted veterinarians in your area — it's fast, easy, and secure.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">1. Search for vets</h3>
              <p className="text-muted-foreground">
                Enter your location and pet type to find trusted veterinarians near you. Compare ratings and availability.
              </p>
            </div>
            
            <div 
              className="flex flex-col items-center text-center space-y-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/search?petType=dog&location=berlin")}
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">2. Book your appointment</h3>
              <p className="text-muted-foreground">
                Choose a convenient time slot and book instantly. No phone calls needed — everything happens online.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">3. Visit your vet</h3>
              <p className="text-muted-foreground">
                Receive reminders before your appointment. After your visit, all records are saved in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Veterinarians Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-5xl mx-auto bg-card rounded-2xl shadow-lg overflow-hidden border border-border">
            <div className="grid md:grid-cols-2 gap-0 items-stretch">
              <div className="p-8 lg:p-12 space-y-6 flex flex-col justify-center">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Grow your practice with Pet2Vet.app
                </h2>
                <p className="text-muted-foreground text-lg">
                  Simplify your schedule, reduce no-shows, and attract new clients. Join free for 3 months.
                </p>
                <Button size="lg" className="font-semibold w-fit" asChild>
                  <Link to="/for-vets">Join as a Vet</Link>
                </Button>
              </div>
              
              <div className="bg-muted/50 p-8 lg:p-12 space-y-6 flex flex-col justify-center">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-foreground">Attract new pet owners looking for trusted care nearby</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-foreground">Manage your schedule with automated booking and reminders</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-foreground">Reduce administrative burden and focus on patient care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Privacy Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-2">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Your pet's health, your privacy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All data is securely stored and never shared without consent. We're committed to protecting your information with industry-leading security standards.
            </p>
            <Button variant="outline" size="lg" className="border-border hover:bg-muted font-semibold" asChild>
              <Link to="/privacy">Learn about our privacy practices</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Trusted by pet lovers across Europe
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pet2Vet.app makes accessing veterinary care fast and easy. Join thousands of pet owners keeping their companions healthy.
            </p>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-accent text-accent" />)}
              </div>
              <span className="text-muted-foreground font-medium">
                4.9 ★ Over 100,000 reviews
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-card hover:bg-muted border h-14 px-6"
                onClick={() => window.open("https://apps.apple.com/", "_blank")}
              >
                <div className="flex items-center gap-3">
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
                className="bg-card hover:bg-muted border h-14 px-6"
                onClick={() => window.open("https://play.google.com/", "_blank")}
              >
                <div className="flex items-center gap-3">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Pet2Vet<span className="text-muted-foreground">.app</span></span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Pet2Vet.app. Caring for pets, one appointment at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;