import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GoogleParkPlace {
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

export interface GoogleParkSearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface GoogleParkSearchResponse {
  success: boolean;
  results: GoogleParkPlace[];
  result_count: number;
  source: "cache" | "google";
  cached_at?: string;
  cached_until?: string;
  error?: string;
}

export function useGoogleParkSearch() {
  const [results, setResults] = useState<GoogleParkPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"cache" | "google" | null>(null);

  const searchGoogleParks = useCallback(async (params: GoogleParkSearchParams) => {
    setLoading(true);
    setError(null);
    setDataSource(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout - Google park search took too long")), 10000)
      );

      const invokePromise = supabase.functions.invoke<GoogleParkSearchResponse>(
        "search-google-parks",
        {
          body: params,
        }
      );

      const { data, error: invokeError } = await Promise.race([
        invokePromise,
        timeoutPromise,
      ]) as any;

      if (invokeError) {
        throw new Error(invokeError.message || "Failed to search Google parks");
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Unknown error occurred");
      }

      if (import.meta.env.DEV) {
        console.log(`[useGoogleParkSearch] source: ${data.source}, results: ${data.result_count}`);
      }

      setResults(data.results || []);
      setDataSource(data.source);
      setLoading(false);

      return data.results || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search Google parks";
      console.warn("Google Parks search failed:", errorMessage);
      setError(errorMessage);
      setResults([]);
      setDataSource(null);
      setLoading(false);
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
    searchGoogleParks,
    clearResults,
  };
}
