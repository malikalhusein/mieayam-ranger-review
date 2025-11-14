-- Ensure service_durasi has a default value for existing records
UPDATE public.reviews
SET service_durasi = 0
WHERE service_durasi IS NULL;

-- Make service_durasi NOT NULL with a default
ALTER TABLE public.reviews
ALTER COLUMN service_durasi SET DEFAULT 0,
ALTER COLUMN service_durasi SET NOT NULL;

-- Drop and recreate the overall_score column to force recalculation
ALTER TABLE public.reviews
DROP COLUMN IF EXISTS overall_score;

ALTER TABLE public.reviews
ADD COLUMN overall_score NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN price + (COALESCE(service_durasi, 0) * 100) = 0 THEN 0
    ELSE (
      (
        COALESCE(kuah_kekentalan, 0) + 
        COALESCE(kuah_kaldu, 0) + 
        COALESCE(kuah_keseimbangan, 0) + 
        COALESCE(kuah_aroma, 0) + 
        COALESCE(mie_tekstur, 0) + 
        COALESCE(ayam_bumbu, 0) + 
        COALESCE(ayam_potongan, 0) + 
        COALESCE(fasilitas_kebersihan, 0) + 
        COALESCE(fasilitas_alat_makan, 0) + 
        COALESCE(fasilitas_tempat, 0)
      ) / (price + (COALESCE(service_durasi, 0) * 100))
    ) * 1000
  END
) STORED;