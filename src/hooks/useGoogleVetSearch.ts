import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GoogleVetClinic {
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

export interface GoogleVetSearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface GoogleVetSearchResponse {
  success: boolean;
  results: GoogleVetClinic[];
  result_count: number;
  source: "cache" | "google";
  cached_at?: string;
  cached_until?: string;
  error?: string;
}

export function useGoogleVetSearch() {
  const [results, setResults] = useState<GoogleVetClinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"cache" | "google" | null>(null);

  const searchGoogleVets = useCallback(async (params: GoogleVetSearchParams) => {
    setLoading(true);
    setError(null);
    setDataSource(null);

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - Google search took too long')), 10000)
      );

      const invokePromise = supabase.functions.invoke<GoogleVetSearchResponse>(
        "search-google-vets",
        {
          body: params,
        }
      );

      const { data, error: invokeError } = await Promise.race([
        invokePromise,
        timeoutPromise
      ]) as any;

      if (invokeError) {
        throw new Error(invokeError.message || "Failed to search Google vets");
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Unknown error occurred");
      }

      setResults(data.results || []);
      setDataSource(data.source);
      setLoading(false);

      return data.results || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search Google vets";
      console.warn("Google Vets search failed:", errorMessage);
      setError(errorMessage);
      setResults([]);
      setDataSource(null);
      setLoading(false);
      // Don't throw - just return empty array to not break the UI
      return [];
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setDataSource(null);
  }, []);

  return {
    results,
    loading,
    error,
    dataSource,
    searchGoogleVets,
    clearResults,
  };
}
