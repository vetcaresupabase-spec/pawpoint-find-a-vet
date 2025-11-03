-- Migration: Update pets table with comprehensive pet details
-- Purpose: Add fields for pet type, sex, neutered status, photo, and owner name

-- Add new columns to pets table
ALTER TABLE public.pets 
  ADD COLUMN IF NOT EXISTS pet_type TEXT NOT NULL DEFAULT 'Dog' CHECK (pet_type IN ('Dog', 'Cat', 'Ferret', 'Other')),
  ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'Unknown' CHECK (sex IN ('Male', 'Female', 'Unknown')),
  ADD COLUMN IF NOT EXISTS neutered_spayed TEXT DEFAULT 'Unknown' CHECK (neutered_spayed IN ('Yes', 'No', 'Unknown')),
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT NOT NULL DEFAULT '';

-- Rename species to breed for clarity (species is now pet_type)
ALTER TABLE public.pets RENAME COLUMN species TO old_species;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS breed TEXT NOT NULL DEFAULT '';

-- Update existing data: migrate species to breed
UPDATE public.pets SET breed = old_species WHERE breed = '';

-- Drop old column
ALTER TABLE public.pets DROP COLUMN IF EXISTS old_species;

-- Make name not required (recommended instead of mandatory)
ALTER TABLE public.pets ALTER COLUMN name DROP NOT NULL;

-- Update RLS policies to remain the same (already correct)
-- Users can only access their own pets

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS pets_owner_id_idx ON public.pets(owner_id);
CREATE INDEX IF NOT EXISTS pets_pet_type_idx ON public.pets(pet_type);

-- Add comment for documentation
COMMENT ON TABLE public.pets IS 'Stores pet information for pet owners';
COMMENT ON COLUMN public.pets.owner_name IS 'Name of the pet owner (mandatory)';
COMMENT ON COLUMN public.pets.pet_type IS 'Type of pet: Dog, Cat, Ferret, or Other (mandatory)';
COMMENT ON COLUMN public.pets.breed IS 'Breed of the pet (mandatory)';
COMMENT ON COLUMN public.pets.name IS 'Name of the pet (recommended)';
COMMENT ON COLUMN public.pets.date_of_birth IS 'Date of birth for age calculation (recommended)';
COMMENT ON COLUMN public.pets.sex IS 'Sex of the pet: Male, Female, or Unknown';
COMMENT ON COLUMN public.pets.neutered_spayed IS 'Neutered/Spayed status: Yes, No, or Unknown';
COMMENT ON COLUMN public.pets.photo_url IS 'URL to pet photo (square portrait)';

