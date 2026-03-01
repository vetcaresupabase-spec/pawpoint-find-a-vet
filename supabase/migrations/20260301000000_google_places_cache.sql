-- Migration: Google Places Cache Table
-- Description: Cache Google Places API results to reduce API calls and improve performance
-- Created: 2026-03-01

-- Create google_places_cache table
CREATE TABLE IF NOT EXISTS public.google_places_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  query TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_m INTEGER,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  result_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  hit_count INTEGER NOT NULL DEFAULT 0,
  last_hit_at TIMESTAMPTZ
);

-- Add index on cache_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_google_places_cache_key ON public.google_places_cache(cache_key);

-- Add index on expires_at for cleanup operations
CREATE INDEX IF NOT EXISTS idx_google_places_cache_expires ON public.google_places_cache(expires_at);

-- Add index on created_at for analytics
CREATE INDEX IF NOT EXISTS idx_google_places_cache_created ON public.google_places_cache(created_at);

-- Enable RLS
ALTER TABLE public.google_places_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow everyone to SELECT (read) cached results
CREATE POLICY "Public can read Google Places cache"
  ON public.google_places_cache
  FOR SELECT
  USING (true);

-- RLS Policy: Only service role can INSERT/UPDATE cache entries
-- (This will be done by the Edge Function using service role key)
CREATE POLICY "Service role can manage cache"
  ON public.google_places_cache
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Function: Cleanup expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_google_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.google_places_cache
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Comment on function
COMMENT ON FUNCTION public.cleanup_expired_google_cache() IS 
  'Deletes expired Google Places cache entries. Returns the number of deleted rows. Should be called periodically via cron job.';

-- Grant execute permission to authenticated users (for manual cleanup if needed)
GRANT EXECUTE ON FUNCTION public.cleanup_expired_google_cache() TO authenticated;

-- Comment on table
COMMENT ON TABLE public.google_places_cache IS 
  'Caches Google Places API search results for 24 hours to reduce API costs and improve performance. Includes hit tracking for analytics.';

-- Add comments on columns
COMMENT ON COLUMN public.google_places_cache.cache_key IS 'Deterministic key: hash of normalized query + rounded coordinates';
COMMENT ON COLUMN public.google_places_cache.query IS 'Original search query text';
COMMENT ON COLUMN public.google_places_cache.latitude IS 'Search center latitude (if location-based)';
COMMENT ON COLUMN public.google_places_cache.longitude IS 'Search center longitude (if location-based)';
COMMENT ON COLUMN public.google_places_cache.radius_m IS 'Search radius in meters';
COMMENT ON COLUMN public.google_places_cache.results IS 'Array of transformed Google Places results';
COMMENT ON COLUMN public.google_places_cache.result_count IS 'Number of results in the cache (for quick stats)';
COMMENT ON COLUMN public.google_places_cache.expires_at IS 'Cache expiration timestamp (24 hours from creation)';
COMMENT ON COLUMN public.google_places_cache.hit_count IS 'Number of times this cache entry has been accessed';
COMMENT ON COLUMN public.google_places_cache.last_hit_at IS 'Timestamp of the most recent cache hit';
