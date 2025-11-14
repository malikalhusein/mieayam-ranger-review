-- Fix overall_score calculation by using proper decimal division
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
      )::numeric / (price + (COALESCE(service_durasi, 0) * 100))::numeric
    ) * 1000
  END
) STORED;