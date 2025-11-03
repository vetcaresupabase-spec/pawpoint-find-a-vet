-- Migration: Create storage bucket for pet photos
-- Purpose: Allow pet owners to upload photos of their pets

-- Create the storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
CREATE POLICY "Pet owners can upload their pet photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-photos' AND
  (storage.foldername(name))[1] = 'pet-photos'
);

CREATE POLICY "Anyone can view pet photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pet-photos');

CREATE POLICY "Pet owners can update their pet photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pet-photos')
WITH CHECK (bucket_id = 'pet-photos');

CREATE POLICY "Pet owners can delete their pet photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pet-photos');

-- Add comment for documentation
COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';

