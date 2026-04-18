import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { MapPin, Star, Clock, Navigation, Bookmark, TreePine, Dog, Map } from "lucide-react";
import { useGoogleParkSearch, GoogleParkPlace } from "@/hooks/useGoogleParkSearch";

const PetParks = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") || "";
  const query = searchParams.get("query") || "";

  const { results, loading, error, searchGoogleParks } = useGoogleParkSearch();

  useEffect(() => {
    if (!location && !query) return;

    const params: any = {};
    if (query) params.query = query;
    if (location) {
      params.query = (params.query ? params.query + " " : "") + location;
    }

    searchGoogleParks(params);
  }, [location, query, searchGoogleParks]);

  const handleDirections = (park: GoogleParkPlace) => {
    const url = park.google_maps_uri
      || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(park.name)}&query_place_id=${park.google_place_id}`;
    window.open(url, "_blank");
  };

  const handleSave = (park: GoogleParkPlace) => {
    toast({
      title: "Saved!",
      description: `${park.name} added to your favourites (coming soon).`,
    });
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Left side — scrollable card list */}
        <div className="w-full md:w-[480px] md:flex-shrink-0 border-r overflow-y-auto">
          <div className="p-4 sm:p-6 border-b bg-muted/30">
            <h1 className="text-xl font-bold mb-1">
              Pet Parks {location && `in ${location}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Searching for parks..."
                : error
                ? "Something went wrong"
                : `Found ${results.length} parks`}
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Loading skeletons */}
            {loading && (
              <>
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-9 w-28" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* Error state */}
            {!loading && error && (
              <Card className="p-8 text-center">
                <TreePine className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-semibold mb-1">Search failed</h2>
                <p className="text-sm text-muted-foreground">{error}</p>
              </Card>
            )}

            {/* Empty state */}
            {!loading && !error && results.length === 0 && (
              <Card className="p-8 text-center">
                <TreePine className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-semibold mb-1">No parks found</h2>
                <p className="text-sm text-muted-foreground">
                  Try a different location or search term.
                </p>
              </Card>
            )}

            {/* Park cards */}
            {!loading &&
              results.map((park) => (
                <Card key={park.google_place_id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-2.5">
                    <h3 className="font-semibold text-base leading-tight">{park.name}</h3>

                    {park.address_line1 && (
                      <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span>{park.address_line1}</span>
                      </div>
                    )}

                    {/* Rating */}
                    {park.rating && (
                      <div className="flex items-center gap-2">
                        {renderStars(park.rating)}
                        <span className="text-sm font-medium">{park.rating.toFixed(1)}</span>
                        {park.review_count && (
                          <span className="text-xs text-muted-foreground">
                            ({park.review_count.toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {park.is_open_now !== null && (
                        <Badge variant={park.is_open_now ? "default" : "secondary"} className={`text-xs ${park.is_open_now ? "bg-primary" : ""}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {park.is_open_now ? "Open now" : "Closed"}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Dog className="h-3 w-3 mr-1" />
                        Dog-friendly
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => handleDirections(park)}>
                        <Navigation className="h-3.5 w-3.5 mr-1.5" />
                        Directions
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSave(park)}>
                        <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                        Save
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* Right side — map placeholder */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-muted/20">
          <div className="text-center space-y-3">
            <Map className="h-16 w-16 text-muted-foreground/40 mx-auto" />
            <p className="text-lg font-medium text-muted-foreground/60">Map coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetParks;
