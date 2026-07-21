
-- 1. Drop the old generated column (only uses kuah_* fields → wrong for goreng)
ALTER TABLE public.reviews DROP COLUMN IF EXISTS overall_score;

-- 2. Widen score columns to NUMERIC so decimals from admin form persist
ALTER TABLE public.reviews
  ALTER COLUMN mie_tekstur TYPE NUMERIC,
  ALTER COLUMN ayam_bumbu TYPE NUMERIC,
  ALTER COLUMN ayam_potongan TYPE NUMERIC,
  ALTER COLUMN kuah_kekentalan TYPE NUMERIC,
  ALTER COLUMN kuah_keseimbangan TYPE NUMERIC,
  ALTER COLUMN kuah_kaldu TYPE NUMERIC,
  ALTER COLUMN kuah_aroma TYPE NUMERIC,
  ALTER COLUMN kuah_kejernihan TYPE NUMERIC,
  ALTER COLUMN goreng_keseimbangan_minyak TYPE NUMERIC,
  ALTER COLUMN goreng_bumbu_tumisan TYPE NUMERIC,
  ALTER COLUMN goreng_aroma_tumisan TYPE NUMERIC,
  ALTER COLUMN fasilitas_kebersihan TYPE NUMERIC,
  ALTER COLUMN fasilitas_alat_makan TYPE NUMERIC,
  ALTER COLUMN fasilitas_tempat TYPE NUMERIC,
  ALTER COLUMN service_durasi TYPE NUMERIC;

-- 3. Recreate overall_score with correct formula for both kuah and goreng
ALTER TABLE public.reviews
ADD COLUMN overall_score NUMERIC GENERATED ALWAYS AS (
  CASE
    WHEN COALESCE(price, 0) <= 0 THEN 0
    ELSE LEAST(10, GREATEST(0,
      (
        (
          -- base = rasa * 0.8 + fasilitas * 0.2  (each on 0-10 scale)
          (
            CASE product_type
              WHEN 'kuah' THEN (
                COALESCE(mie_tekstur, 0)
                + COALESCE(ayam_bumbu, 0)
                + COALESCE(ayam_potongan, 0)
                + COALESCE(kuah_kekentalan, 0)
                + COALESCE(kuah_keseimbangan, 0)
                + COALESCE(kuah_kaldu, 0)
                + COALESCE(kuah_aroma, 0)
                + COALESCE(kuah_kejernihan, 0)
              )::numeric / 8
              WHEN 'goreng' THEN (
                COALESCE(mie_tekstur, 0)
                + COALESCE(ayam_bumbu, 0)
                + COALESCE(ayam_potongan, 0)
                + COALESCE(goreng_keseimbangan_minyak, 0)
                + COALESCE(goreng_bumbu_tumisan, 0)
                + COALESCE(goreng_aroma_tumisan, 0)
              )::numeric / 6
              ELSE 0
            END
          ) * 0.8
          + (
            (
              COALESCE(fasilitas_kebersihan, 0)
              + COALESCE(fasilitas_alat_makan, 0)
              + COALESCE(fasilitas_tempat, 0)
            )::numeric / 3
          ) * 0.2
          -- time score: +1.5/min faster than 8, -2/min slower
          + CASE
              WHEN COALESCE(service_durasi, 8) <= 8
                THEN (8 - COALESCE(service_durasi, 8)) * 1.5
              ELSE (8 - COALESCE(service_durasi, 8)) * 2
            END
          -- topping bonus: 0.5 per boolean topping selected
          + (
            (CASE WHEN topping_bakso THEN 1 ELSE 0 END)
            + (CASE WHEN topping_ceker THEN 1 ELSE 0 END)
            + (CASE WHEN topping_pangsit_basah THEN 1 ELSE 0 END)
            + (CASE WHEN topping_pangsit_kering THEN 1 ELSE 0 END)
            + (CASE WHEN topping_balungan THEN 1 ELSE 0 END)
            + (CASE WHEN topping_tetelan THEN 1 ELSE 0 END)
            + (CASE WHEN topping_dimsum THEN 1 ELSE 0 END)
            + (CASE WHEN topping_ekstra_ayam THEN 1 ELSE 0 END)
            + (CASE WHEN topping_ekstra_sawi THEN 1 ELSE 0 END)
            + (CASE WHEN topping_mie_jumbo THEN 1 ELSE 0 END)
            + (CASE WHEN topping_bawang_daun THEN 1 ELSE 0 END)
            + (CASE WHEN topping_variasi_bumbu THEN 1 ELSE 0 END)
            + (CASE WHEN topping_jamur THEN 1 ELSE 0 END)
            + (CASE WHEN topping_tauge THEN 1 ELSE 0 END)
            + (CASE WHEN topping_acar THEN 1 ELSE 0 END)
            + (CASE WHEN topping_kerupuk THEN 1 ELSE 0 END)
          ) * 0.5
        )
        -- value factor clamped to [0.85, 1.15]
        * LEAST(1.15::numeric, GREATEST(0.85::numeric, 17000.0 / GREATEST(price, 1)))
      )
    ))
  END
) STORED;
