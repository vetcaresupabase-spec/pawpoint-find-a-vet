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
        <div className="container grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 sm:py-12 lg:py-20 px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Find trusted vets near you
            </h1>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" />
                </div>
                <p className="text-base sm:text-lg text-foreground">Book appointments 24/7</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" />
                </div>
                <p className="text-base sm:text-lg text-foreground">Read real reviews, and manage your pet's health—all in one app</p>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" />
                </div>
                <p className="text-base sm:text-lg text-foreground">No phone calls required</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-3xl">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <div className="text-left">
                <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Verified Professionals</div>
              </div>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="text-left">
                <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Instant 24/7 Booking</div>
              </div>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="text-left">
                <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Seamless, Centralized Care</div>
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
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4">
            Your Pet's Care in 3 Simple Steps
          </h2>
          <p className="text-center text-muted-foreground text-base sm:text-lg mb-10 sm:mb-12 lg:mb-16 max-w-2xl mx-auto px-4">
            Book appointments with trusted veterinarians in your area — it's fast, easy, and secure.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-1 sm:mb-2">
                <Search className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">1. Discover & Compare</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Search our network by location or specialty. Filter by services, opening hours, and real patient reviews.
              </p>
            </div>
            
            <div 
              className="flex flex-col items-center text-center space-y-3 sm:space-y-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/search?petType=dog&location=berlin")}
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-1 sm:mb-2">
                <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">2. Book Instantly</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                See a clinic's live schedule and confirm your appointment in seconds. We'll handle the rest.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-1 sm:mb-2">
                <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">3. Manage Everything</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Get smart reminders, access your pet's complete health history, and re-book with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Veterinarians Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="container px-4 sm:px-6">
          <div className="max-w-5xl mx-auto bg-card rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-border">
            <div className="grid md:grid-cols-2 gap-0 items-stretch">
              <div className="p-6 sm:p-8 lg:p-12 space-y-4 sm:space-y-6 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Are You a Veterinarian?
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg">
                  Grow your practice, reduce no-shows, and delight your clients. Join our partner network and get your first 3 months free.
                </p>
                <Button size="lg" className="font-semibold w-fit" asChild>
                  <Link to="/for-vets">Join as a Partner</Link>
                </Button>
              </div>
              
              <div className="bg-muted/50 p-6 sm:p-8 lg:p-12 space-y-4 sm:space-y-6 flex flex-col justify-center">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base text-foreground">Attract new, engaged pet owners in your local area.</p>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base text-foreground">Automate your schedule with smart booking and intelligent reminders.</p>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base text-foreground">Reduce administrative work and focus on what matters: patient care.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Privacy Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
            <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 mb-1 sm:mb-2">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold px-4">
              Your pet's health, your privacy
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              All data is securely stored and never shared without consent. We're committed to protecting your information with industry-leading security standards.
            </p>
            <Button variant="outline" size="lg" className="border-border hover:bg-muted font-semibold" asChild>
              <Link to="/privacy">Learn about our privacy practices</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="container px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold px-4">
              Join Our Community of Pet Lovers
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Pet2Vet is being built for pet lovers, by pet lovers. Our mission is to make veterinary care fast, easy, and stress-free. Be the first to download the app and help us build the future of pet health.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-card hover:bg-muted border h-12 sm:h-14 px-4 sm:px-6 w-full sm:w-auto"
                onClick={() => window.open("https://apps.apple.com/", "_blank")}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 bg-foreground rounded-lg flex items-center justify-center">
                    <span className="text-background text-lg sm:text-xl font-bold">📱</span>
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
                className="bg-card hover:bg-muted border h-12 sm:h-14 px-4 sm:px-6 w-full sm:w-auto"
                onClick={() => window.open("https://play.google.com/", "_blank")}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 bg-foreground rounded-lg flex items-center justify-center">
                    <span className="text-background text-lg sm:text-xl font-bold">▶</span>
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
      <footer className="bg-muted/30 border-t py-8 sm:py-12">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-base sm:text-lg font-bold">Pet2Vet<span className="text-muted-foreground">.app</span></span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              © 2025 Pet2Vet.app. Caring for pets, one appointment at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;