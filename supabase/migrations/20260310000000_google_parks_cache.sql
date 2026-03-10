-- Migration: Google Parks Cache Table
-- Description: Cache Google Places API park results to reduce API calls and improve performance
-- Created: 2026-03-10

CREATE TABLE IF NOT EXISTS public.google_parks_cache (
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

CREATE INDEX IF NOT EXISTS idx_google_parks_cache_key ON public.google_parks_cache(cache_key);

CREATE INDEX IF NOT EXISTS idx_google_parks_cache_expires ON public.google_parks_cache(expires_at);

ALTER TABLE public.google_parks_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read Google Parks cache"
  ON public.google_parks_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage parks cache"
  ON public.google_parks_cache
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.cleanup_expired_parks_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.google_parks_cache
  WHERE expires_at < now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_expired_parks_cache() TO authenticated;
