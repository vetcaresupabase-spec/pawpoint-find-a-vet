import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchBarProps {
  defaultSearch?: string;
  defaultLocation?: string;
  onSearch?: (search: string, location: string) => void;
}

export const SearchBar = ({ defaultSearch = "", defaultLocation = "", onSearch }: SearchBarProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const [location, setLocation] = useState(defaultLocation);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions based on search term
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      // Search in specialties and service names
      const { data: clinics } = await supabase
        .from("clinics")
        .select("specialties")
        .limit(10);

      const { data: services } = await supabase
        .from("clinic_services")
        .select("name")
        .ilike("name", `%${searchTerm}%`)
        .limit(5);

      const suggestions: string[] = [];
      
      // Add matching services
      services?.forEach(s => {
        if (!suggestions.includes(s.name)) {
          suggestions.push(s.name);
        }
      });

      // Add matching specialties
      clinics?.forEach(c => {
        c.specialties?.forEach((spec: string) => {
          if (spec.toLowerCase().includes(searchTerm.toLowerCase()) && !suggestions.includes(spec)) {
            suggestions.push(spec);
          }
        });
      });

      setSuggestions(suggestions.slice(0, 5));
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch location suggestions
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (location.length < 2) {
        setLocationSuggestions([]);
        return;
      }

      const { data } = await supabase
        .from("clinics")
        .select("city")
        .ilike("city", `%${location}%`)
        .limit(5);

      const uniqueCities = [...new Set(data?.map(c => c.city))];
      setLocationSuggestions(uniqueCities);
    };

    const timer = setTimeout(fetchLocationSuggestions, 300);
    return () => clearTimeout(timer);
  }, [location]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm, location);
    } else {
      navigate(`/search?petType=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`);
    }
    setShowSuggestions(false);
    setShowLocationSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Search Input */}
          <div ref={searchRef} className="flex-1 relative">
            <div className="flex items-center gap-3 px-6 py-4 border-b sm:border-b-0 sm:border-r">
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <Input
                  placeholder="Name, field of expertise, institution"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyPress={handleKeyPress}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
                />
              </div>
            </div>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-6 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Input */}
          <div ref={locationRef} className="flex-1 relative">
            <div className="flex items-center gap-3 px-6 py-4">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <Input
                  placeholder="e.g. Berlin or 12043"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onKeyPress={handleKeyPress}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
                />
              </div>
              <button
                className="text-primary hover:text-primary/80 transition-colors"
                onClick={() => {
                  // Get user's location
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        // In a real app, you'd reverse geocode this
                        setLocation("Current Location");
                      },
                      (error) => {
                        console.error("Error getting location:", error);
                      }
                    );
                  }
                }}
              >
                <Navigation className="h-5 w-5" />
              </button>
            </div>

            {/* Location Suggestions Dropdown */}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setLocation(suggestion);
                      setShowLocationSuggestions(false);
                    }}
                    className="w-full px-6 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="sm:w-auto">
            <Button
              onClick={handleSearch}
              size="lg"
              className="w-full sm:w-auto h-full rounded-none sm:rounded-r-2xl px-8 text-base font-medium"
            >
              <Search className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Seek</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};




