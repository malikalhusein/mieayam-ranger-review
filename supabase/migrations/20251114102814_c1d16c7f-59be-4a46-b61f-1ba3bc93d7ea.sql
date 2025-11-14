-- Update overall_score formula with 8-minute tolerance threshold
-- Faster than 8 minutes = bonus (reduces effective cost)
-- Slower than 8 minutes = penalty (increases effective cost)
ALTER TABLE public.reviews
DROP COLUMN IF EXISTS overall_score;

ALTER TABLE public.reviews
ADD COLUMN overall_score NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN price + ((COALESCE(service_durasi, 8) - 8) * 100) <= 0 THEN 0
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
      )::numeric / (price + ((COALESCE(service_durasi, 8) - 8) * 100))::numeric
    ) * 1000
  END
) STORED;