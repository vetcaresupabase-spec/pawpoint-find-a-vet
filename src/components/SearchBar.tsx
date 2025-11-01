import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MapPin, Navigation, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultSearch?: string;
  defaultLocation?: string;
  onSearch?: (search: string, location: string) => void;
}

interface ClinicSearchResult {
  id: string;
  name: string;
  city: string;
  address_line1: string | null;
  postcode: string | null;
  distance_m: number | null;
  specialties: string[] | null;
}

type FocusedField = 'name' | 'location' | null;

export const SearchBar = ({ defaultSearch = "", defaultLocation = "", onSearch }: SearchBarProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const [location, setLocation] = useState(defaultLocation);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [results, setResults] = useState<ClinicSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"loading" | "granted" | "denied" | "idle">("idle");
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();

  // Format distance
  const formatDistance = (meters: number | null) => {
    if (meters === null || isNaN(meters)) return null;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Helper function to highlight matching text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return <span key={i} className="text-blue-600 font-semibold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Geolocation on mount (optional, silent fail)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
        setLocation("Near me");
        console.log("Geolocation acquired:", pos.coords.latitude, pos.coords.longitude);
      },
      (error) => {
        console.log("Geolocation denied or failed:", error.message);
        setLocationStatus("denied");
      },
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 }
    );
  }, []);

  // Unified search - triggered only when user types (debounced)
  useEffect(() => {
    const activeField = focusedField;
    const shouldSearch = 
      (activeField === 'name' && searchTerm.trim().length >= 2) ||
      (activeField === 'location' && (location.trim().length >= 2 || coords));

    if (shouldSearch) {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        void performSearch();
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => window.clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, location, focusedField]);

  // Unified search function
  const performSearch = async () => {
    if (isSearching) return;

    const hasNameSearch = searchTerm.trim().length >= 2;
    const hasLocationSearch = location.trim().length >= 2 || coords;

    if (!hasNameSearch && !hasLocationSearch) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      let searchResults: ClinicSearchResult[] = [];

      if (hasLocationSearch) {
        // Location-based search with radius expansion
        const isNearMe = location.toLowerCase() === "near me";
        const cityOrPostcode = !isNearMe && location.trim().length >= 2 ? location.trim() : null;
        const radii = [15000, 50000, 100000, 200000];
        
        for (const radius of radii) {
          const { data, error } = await (supabase as any).rpc("fn_search_clinics", {
            in_lat: coords?.lat ?? null,
            in_lng: coords?.lng ?? null,
            in_city_or_postcode: cityOrPostcode,
            in_radius_m: radius,
            in_limit: 20,
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
          .select("id, name, city, address_line1, postcode, specialties")
          .eq("is_active", true)
          .limit(20);

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
        const searchLower = searchTerm.toLowerCase();
        searchResults = searchResults.filter(clinic => {
          const nameMatch = clinic.name.toLowerCase().includes(searchLower);
          const cityMatch = clinic.city.toLowerCase().includes(searchLower);
          const specialtyMatch = clinic.specialties?.some(s => 
            s.toLowerCase().includes(searchLower)
          ) ?? false;
          
          return nameMatch || cityMatch || specialtyMatch;
        });
      }

      setResults(searchResults.slice(0, 10));
      setShowResults(searchResults.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Search exception:", error);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setFocusedField(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle clinic selection
  const handleClinicSelect = (clinicId: string) => {
    setShowResults(false);
    setFocusedField(null);
    navigate(`/book-appointment?clinicId=${clinicId}`);
  };

  // Handle search button click
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm, location);
    } else {
      // Navigate to search results page
      navigate(`/search?petType=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) {
      if (e.key === "Enter") {
        handleSearch();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleClinicSelect(results[selectedIndex].id);
    } else if (e.key === "Escape") {
      setShowResults(false);
      setSelectedIndex(-1);
      setFocusedField(null);
    }
  };

  // Handle location button click
  const handleUseLocation = () => {
    if (coords) {
      setLocation("Near me");
      setFocusedField('location');
    } else if ("geolocation" in navigator) {
      setLocationStatus("loading");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus("granted");
          setLocation("Near me");
          setFocusedField('location');
          console.log("Location acquired:", pos.coords.latitude, pos.coords.longitude);
        },
        (error) => {
          setLocationStatus("denied");
          console.error("Location error:", error.message);
        }
      );
    }
  };


  return (
    <div ref={resultsRef} className="w-full max-w-5xl mx-auto relative">
      <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Search Input - Name, field of expertise, institution */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 px-1.5 sm:px-3 md:px-4 lg:px-6 py-2.5 sm:py-3 md:py-3.5 lg:py-4 border-b sm:border-b-0 sm:border-r">
              <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Name, field of expertise, institution"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFocusedField('name');
                  }}
                  onFocus={() => {
                    setFocusedField('name');
                    if (results.length > 0) {
                      setShowResults(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 outline-none focus:outline-none text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-900 placeholder:text-gray-600 placeholder:text-[7px] placeholder:sm:text-[8px] placeholder:md:text-[9px] placeholder:lg:text-[10px]"
                />
              </div>
            </div>
          </div>

          {/* Location Input with Geolocation */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 px-1.5 sm:px-3 md:px-4 lg:px-6 py-2.5 sm:py-3 md:py-3.5 lg:py-4">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="e.g. Berlin or 12043"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setFocusedField('location');
                  }}
                  onFocus={() => {
                    setFocusedField('location');
                    if (results.length > 0) {
                      setShowResults(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 outline-none focus:outline-none text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-900 placeholder:text-gray-600 placeholder:text-[7px] placeholder:sm:text-[8px] placeholder:md:text-[9px] placeholder:lg:text-[10px]"
                />
              </div>
              <button
                onClick={handleUseLocation}
                className={cn(
                  "text-muted-foreground hover:text-primary transition-colors flex-shrink-0",
                  locationStatus === "granted" && "text-primary"
                )}
                title={coords ? "Location acquired" : "Get my location"}
              >
                {locationStatus === "loading" ? (
                  <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 animate-spin" />
                ) : (
                  <Navigation className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5", coords && "fill-current")} />
                )}
              </button>
            </div>
          </div>

          {/* Search Button */}
          <div className="sm:w-auto">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              size="lg"
              className="w-full sm:w-auto h-full rounded-none sm:rounded-r-2xl px-8 text-base font-medium"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Seek</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Single Unified Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-border shadow-2xl z-50 max-h-96 overflow-auto">
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-600">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-900 mb-1">No clinics found</p>
                  <p className="text-xs text-gray-500">
                    Try searching with a different name, specialty, or location
                  </p>
                </div>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map((clinic, index) => (
                <li
                  key={clinic.id}
                  className={cn(
                    "px-6 py-4 cursor-pointer transition-colors",
                    "hover:bg-gray-50",
                    selectedIndex === index && "bg-blue-50"
                  )}
                  onClick={() => handleClinicSelect(clinic.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {clinic.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base text-gray-900">
                        {highlightText(clinic.name, searchTerm)}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        {clinic.address_line1 && `${clinic.address_line1} • `}
                        {clinic.city}
                        {clinic.postcode && ` • ${clinic.postcode}`}
                      </div>
                      {clinic.specialties && clinic.specialties.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {clinic.specialties.slice(0, 3).join(" • ")}
                        </div>
                      )}
                    </div>
                    {formatDistance(clinic.distance_m) && (
                      <div className="text-sm text-gray-700 font-semibold flex-shrink-0">
                        {formatDistance(clinic.distance_m)}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

