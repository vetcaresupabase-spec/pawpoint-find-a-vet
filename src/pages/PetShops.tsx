import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { MapPin, Star, Clock, Navigation, Bookmark, ShoppingBag, Store, Map } from "lucide-react";
import { useGoogleShopSearch, GoogleShopPlace } from "@/hooks/useGoogleShopSearch";

const PetShops = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location") || "";
  const query = searchParams.get("query") || "";

  const { results, loading, error, searchGoogleShops } = useGoogleShopSearch();

  useEffect(() => {
    if (!location && !query) return;

    const params: any = {};
    if (query) params.query = query;
    if (location) {
      params.query = (params.query ? params.query + " " : "") + location;
    }

    searchGoogleShops(params);
  }, [location, query, searchGoogleShops]);

  const handleDirections = (shop: GoogleShopPlace) => {
    const url = shop.google_maps_uri
      || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name)}&query_place_id=${shop.google_place_id}`;
    window.open(url, "_blank");
  };

  const handleSave = (shop: GoogleShopPlace) => {
    toast({
      title: "Saved!",
      description: `${shop.name} added to your favourites (coming soon).`,
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
                : "fill-gray-200 text-gray-200"
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
              Pet Shops {location && `in ${location}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Searching for pet shops..."
                : error
                ? "Something went wrong"
                : `Found ${results.length} pet shops`}
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
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-semibold mb-1">Search failed</h2>
                <p className="text-sm text-muted-foreground">{error}</p>
              </Card>
            )}

            {/* Empty state */}
            {!loading && !error && results.length === 0 && (
              <Card className="p-8 text-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-semibold mb-1">No pet shops found</h2>
                <p className="text-sm text-muted-foreground">
                  Try a different location or search term.
                </p>
              </Card>
            )}

            {/* Shop cards */}
            {!loading &&
              results.map((shop) => (
                <Card key={shop.google_place_id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-2.5">
                    <h3 className="font-semibold text-base leading-tight">{shop.name}</h3>

                    {shop.address_line1 && (
                      <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span>{shop.address_line1}</span>
                      </div>
                    )}

                    {/* Rating */}
                    {shop.rating && (
                      <div className="flex items-center gap-2">
                        {renderStars(shop.rating)}
                        <span className="text-sm font-medium">{shop.rating.toFixed(1)}</span>
                        {shop.review_count && (
                          <span className="text-xs text-muted-foreground">
                            ({shop.review_count.toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {shop.is_open_now !== null && (
                        <Badge variant={shop.is_open_now ? "default" : "secondary"} className={`text-xs ${shop.is_open_now ? "bg-green-600" : ""}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {shop.is_open_now ? "Open now" : "Closed"}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Store className="h-3 w-3 mr-1" />
                        Pet Store
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => handleDirections(shop)}>
                        <Navigation className="h-3.5 w-3.5 mr-1.5" />
                        Directions
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSave(shop)}>
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

export default PetShops;
