-- Drop and recreate the overall_score column with the updated formula
ALTER TABLE public.reviews DROP COLUMN overall_score;

-- Add overall_score back as a generated column with updated formula
-- Formula: (total_score / (price + (service_durasi * 100))) * 1000
-- This penalizes both higher prices and longer service times (service_durasi in minutes)
ALTER TABLE public.reviews ADD COLUMN overall_score numeric GENERATED ALWAYS AS (
  CASE
    WHEN product_type = 'kuah' THEN
      (
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
        ) / NULLIF(price + (COALESCE(service_durasi, 0) * 100), 0)
      ) * 1000
    WHEN product_type = 'goreng' THEN
      (
        (
          COALESCE(mie_tekstur, 0) +
          COALESCE(ayam_bumbu, 0) +
          COALESCE(ayam_potongan, 0) +
          COALESCE(fasilitas_kebersihan, 0) +
          COALESCE(fasilitas_alat_makan, 0) +
          COALESCE(fasilitas_tempat, 0)
        ) / NULLIF(price + (COALESCE(service_durasi, 0) * 100), 0)
      ) * 1000
    ELSE NULL
  END
) STORED;