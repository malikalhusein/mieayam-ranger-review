
-- Scoring v2: price tier expectation with soft ceiling
-- Non-destructive: rebuilds only the overall_score generated column.

CREATE OR REPLACE FUNCTION public.calculate_review_overall_score_v2(
  p_product_type text,
  p_price numeric,
  p_mie_tekstur numeric,
  p_ayam_bumbu numeric,
  p_ayam_potongan numeric,
  p_kuah_kekentalan numeric,
  p_kuah_keseimbangan numeric,
  p_kuah_kaldu numeric,
  p_kuah_aroma numeric,
  p_kuah_kejernihan numeric,
  p_goreng_keseimbangan_minyak numeric,
  p_goreng_bumbu_tumisan numeric,
  p_goreng_aroma_tumisan numeric,
  p_fasilitas_kebersihan numeric,
  p_fasilitas_alat_makan numeric,
  p_fasilitas_tempat numeric,
  p_service_durasi numeric,
  p_topping_ceker boolean,
  p_topping_bakso boolean,
  p_topping_ekstra_ayam boolean,
  p_topping_ekstra_sawi boolean,
  p_topping_balungan boolean,
  p_topping_tetelan boolean,
  p_topping_mie_jumbo boolean,
  p_topping_jenis_mie boolean,
  p_topping_pangsit_basah boolean,
  p_topping_pangsit_kering boolean,
  p_topping_dimsum boolean,
  p_topping_variasi_bumbu boolean,
  p_topping_bawang_daun boolean,
  p_topping_jamur boolean,
  p_topping_tauge boolean,
  p_topping_acar boolean,
  p_topping_kerupuk boolean
) RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  WITH scores AS (
    SELECT
      CASE
        WHEN p_product_type = 'kuah' THEN (
          COALESCE(p_mie_tekstur,0) + COALESCE(p_ayam_bumbu,0) + COALESCE(p_ayam_potongan,0)
          + COALESCE(p_kuah_kekentalan,0) + COALESCE(p_kuah_keseimbangan,0)
          + COALESCE(p_kuah_kaldu,0) + COALESCE(p_kuah_aroma,0) + COALESCE(p_kuah_kejernihan,0)
        ) / 8.0
        WHEN p_product_type = 'goreng' THEN (
          COALESCE(p_mie_tekstur,0) + COALESCE(p_ayam_bumbu,0) + COALESCE(p_ayam_potongan,0)
          + COALESCE(p_goreng_keseimbangan_minyak,0) + COALESCE(p_goreng_bumbu_tumisan,0)
          + COALESCE(p_goreng_aroma_tumisan,0)
        ) / 6.0
        ELSE 0
      END AS rasa,
      (
        COALESCE(p_fasilitas_kebersihan,0) + COALESCE(p_fasilitas_alat_makan,0) + COALESCE(p_fasilitas_tempat,0)
      ) / 3.0 AS fasilitas,
      CASE
        WHEN p_price < 8000  THEN 5.8
        WHEN p_price <= 10000 THEN 6.2
        WHEN p_price <= 12000 THEN 6.8
        WHEN p_price <= 17999 THEN 7.3
        WHEN p_price <= 20000 THEN 8.0
        ELSE 8.5
      END AS expected_rasa,
      CASE
        WHEN p_price < 8000  THEN 3.5
        WHEN p_price <= 10000 THEN 4.2
        WHEN p_price <= 12000 THEN 5.0
        WHEN p_price <= 17999 THEN 6.2
        WHEN p_price <= 20000 THEN 7.2
        ELSE 8.0
      END AS expected_fas,
      CASE
        WHEN p_price < 8000  THEN 0.45
        WHEN p_price <= 10000 THEN 0.30
        WHEN p_price <= 12000 THEN 0.10
        WHEN p_price <= 17999 THEN 0.00
        WHEN p_price <= 20000 THEN -0.20
        ELSE -0.40
      END AS base_adj,
      (
        (CASE WHEN p_topping_ceker THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_bakso THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_ekstra_ayam THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_ekstra_sawi THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_balungan THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_tetelan THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_mie_jumbo THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_jenis_mie THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_pangsit_basah THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_pangsit_kering THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_dimsum THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_variasi_bumbu THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_bawang_daun THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_jamur THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_tauge THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_acar THEN 1 ELSE 0 END) +
        (CASE WHEN p_topping_kerupuk THEN 1 ELSE 0 END)
      ) AS topping_count
  ),
  calc AS (
    SELECT
      rasa, fasilitas, expected_rasa, expected_fas, base_adj, topping_count,
      (rasa * 0.82 + fasilitas * 0.18) AS base_quality,
      GREATEST(-0.90, LEAST(0.90,
        base_adj + (rasa - expected_rasa) * 0.22 + (fasilitas - expected_fas) * 0.12
      )) AS price_adj,
      CASE
        WHEN p_service_durasi IS NULL THEN 0
        WHEN p_service_durasi <= 8 THEN LEAST((8 - p_service_durasi) * 0.15, 0.45)
        ELSE GREATEST((8 - p_service_durasi) * 0.20, -0.80)
      END AS time_score,
      LEAST(topping_count * 0.12, 0.60) AS topping_bonus
    FROM scores
  ),
  raw_calc AS (
    SELECT (base_quality + price_adj + time_score + topping_bonus) AS raw_final
    FROM calc
  )
  SELECT GREATEST(0, LEAST(10,
    CASE
      WHEN raw_final <= 9.2 THEN raw_final
      ELSE 9.2 + (raw_final - 9.2) * 0.45
    END
  ))
  FROM raw_calc;
$$;

ALTER TABLE public.reviews DROP COLUMN IF EXISTS overall_score;

ALTER TABLE public.reviews
ADD COLUMN overall_score numeric GENERATED ALWAYS AS (
  public.calculate_review_overall_score_v2(
    product_type,
    price::numeric,
    mie_tekstur, ayam_bumbu, ayam_potongan,
    kuah_kekentalan, kuah_keseimbangan, kuah_kaldu, kuah_aroma, kuah_kejernihan,
    goreng_keseimbangan_minyak, goreng_bumbu_tumisan, goreng_aroma_tumisan,
    fasilitas_kebersihan, fasilitas_alat_makan, fasilitas_tempat,
    service_durasi,
    topping_ceker, topping_bakso, topping_ekstra_ayam, topping_ekstra_sawi,
    topping_balungan, topping_tetelan, topping_mie_jumbo, topping_jenis_mie,
    topping_pangsit_basah, topping_pangsit_kering, topping_dimsum,
    topping_variasi_bumbu, topping_bawang_daun, topping_jamur, topping_tauge,
    topping_acar, topping_kerupuk
  )
) STORED;
