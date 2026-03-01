import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, Star, Clock, ExternalLink } from "lucide-react";
import { GoogleVetClinic } from "@/hooks/useGoogleVetSearch";

interface GoogleVetCardProps {
  clinic: GoogleVetClinic;
}

export function GoogleVetCard({ clinic }: GoogleVetCardProps) {
  const renderStars = (rating: number | null) => {
    if (!rating) return null;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-200 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2">
              {clinic.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-3 h-3 mr-1 inline-block"
                />
                Google
              </Badge>
              {clinic.business_status === "OPERATIONAL" && (
                <Badge variant="outline" className="text-xs">
                  Operational
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Rating */}
        {clinic.rating && (
          <div className="flex items-center justify-between">
            {renderStars(clinic.rating)}
            {clinic.review_count && (
              <span className="text-sm text-muted-foreground">
                ({clinic.review_count.toLocaleString()} reviews)
              </span>
            )}
          </div>
        )}

        {/* Address */}
        {clinic.address_line1 && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{clinic.address_line1}</span>
          </div>
        )}

        {/* Open/Closed Status */}
        {clinic.is_open_now !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span
              className={
                clinic.is_open_now ? "text-green-600 font-medium" : "text-red-600"
              }
            >
              {clinic.is_open_now ? "Open now" : "Closed"}
            </span>
          </div>
        )}

        {/* Phone */}
        {clinic.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a
              href={`tel:${clinic.phone}`}
              className="text-primary hover:underline"
            >
              {clinic.phone}
            </a>
          </div>
        )}

        {/* Website */}
        {clinic.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a
              href={clinic.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate"
            >
              Visit website
            </a>
          </div>
        )}

        {/* Not on PawPoint Notice */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground italic mb-3">
            Not yet on PawPoint — booking not available
          </p>

          {/* View on Google Maps Button */}
          {clinic.google_maps_uri && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              asChild
            >
              <a
                href={clinic.google_maps_uri}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Google Maps
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
