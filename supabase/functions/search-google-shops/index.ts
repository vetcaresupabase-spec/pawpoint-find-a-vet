import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  businessStatus?: string;
  googleMapsUri?: string;
  photos?: Array<{ name: string }>;
}

interface TransformedShop {
  id: string;
  google_place_id: string;
  name: string;
  address_line1: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  review_count: number | null;
  phone: string | null;
  website: string | null;
  is_open_now: boolean | null;
  opening_hours: string[] | null;
  photo_name: string | null;
  google_maps_uri: string | null;
  business_status: string | null;
  source: "google";
}

function generateCacheKey(params: SearchParams): string {
  const normalizedQuery = (params.query || "").toLowerCase().trim();
  const roundedLat = params.latitude ? params.latitude.toFixed(3) : "null";
  const roundedLng = params.longitude ? params.longitude.toFixed(3) : "null";
  const radius = params.radius || 10000;

  return `shops:${normalizedQuery}|${roundedLat}|${roundedLng}|${radius}`;
}

function transformGooglePlace(place: GooglePlace): TransformedShop {
  const addressParts = place.formattedAddress?.split(",") || [];
  const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : null;

  return {
    id: place.id,
    google_place_id: place.id,
    name: place.displayName?.text || "Unnamed Pet Shop",
    address_line1: place.formattedAddress || null,
    city,
    latitude: place.location?.latitude || null,
    longitude: place.location?.longitude || null,
    rating: place.rating || null,
    review_count: place.userRatingCount || null,
    phone: place.internationalPhoneNumber || null,
    website: place.websiteUri || null,
    is_open_now: place.regularOpeningHours?.openNow ?? null,
    opening_hours: place.regularOpeningHours?.weekdayDescriptions || null,
    photo_name: place.photos?.[0]?.name || null,
    google_maps_uri: place.googleMapsUri || null,
    business_status: place.businessStatus || null,
    source: "google",
  };
}

async function searchGooglePlaces(
  params: SearchParams,
  apiKey: string
): Promise<TransformedShop[]> {
  const textQuery = params.query
    ? `pet shop ${params.query}`
    : "pet shop";

  const requestBody: any = {
    textQuery,
    includedType: "pet_store",
    languageCode: "en",
    maxResultCount: 20,
  };

  if (params.latitude && params.longitude) {
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: params.latitude,
          longitude: params.longitude,
        },
        radius: params.radius || 10000,
      },
    };
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.businessStatus,places.googleMapsUri,places.photos",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Places API error: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  const places: GooglePlace[] = data.places || [];

  return places.map(transformGooglePlace);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");

    if (!googleApiKey) {
      throw new Error(
        "GOOGLE_PLACES_API_KEY not configured. Please set it using: supabase secrets set GOOGLE_PLACES_API_KEY=<your-key>"
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const params: SearchParams = await req.json();

    const cacheKey = generateCacheKey(params);

    const { data: cachedData, error: cacheError } = await supabase
      .from("google_shops_cache")
      .select("*")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cacheError && cacheError.code !== "PGRST116") {
      console.error("Shops cache lookup error:", cacheError);
    }

    if (cachedData) {
      console.log("Shops cache HIT for key:", cacheKey);

      await supabase
        .from("google_shops_cache")
        .update({
          hit_count: (cachedData.hit_count || 0) + 1,
          last_hit_at: new Date().toISOString(),
        })
        .eq("id", cachedData.id);

      return new Response(
        JSON.stringify({
          success: true,
          results: cachedData.results,
          result_count: cachedData.result_count,
          source: "cache",
          cached_at: cachedData.created_at,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log("Shops cache MISS for key:", cacheKey);

    const results = await searchGooglePlaces(params, googleApiKey);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error: insertError } = await supabase
      .from("google_shops_cache")
      .upsert({
        cache_key: cacheKey,
        query: params.query || "",
        latitude: params.latitude || null,
        longitude: params.longitude || null,
        radius_m: params.radius || 10000,
        results: results,
        result_count: results.length,
        expires_at: expiresAt.toISOString(),
        hit_count: 0,
      });

    if (insertError) {
      console.error("Shops cache insert error:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        result_count: results.length,
        source: "google",
        cached_until: expiresAt.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error in search-google-shops:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
