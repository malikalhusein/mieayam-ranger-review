# Scoring Algorithm v2 — Price Tier Expectation

Implementasi sesuai `Revision_implementation_plan_v2.md` yang sudah kamu tulis. Fokus: score kalibrasi berbasis ekspektasi harga, `10/10` jadi langka, konsistensi frontend ↔ DB ↔ scorecard function.

## Perubahan

### 1. `src/lib/scoring.ts` — rewrite core
- Tambah tipe `PriceTierKey` dan `PriceTierConfig`.
- Tambah `getPriceTierConfig(price)` dengan 6 tier (super_cheap / cheap / normal / mid / expensive / premium), termasuk transisi `13k–17.999` masuk `mid`.
- Helper baru:
  - `calculatePriceAdjustment(price, rasa, fasilitas)` → clamp ±0.90
  - `calculateTimeScoreV2(durasi)` → capped +0.45 / −0.80
  - `calculateToppingBonusV2(review)` → `min(count × 0.12, 0.60)`
  - `applySoftCeiling(raw)` → di atas 9.2 dikompresi ×0.45
- `calculateScore()`:
  - `BASE_QUALITY = rasa × 0.82 + fasilitas × 0.18`
  - `RAW_FINAL = BASE_QUALITY + PRICE_ADJUSTMENT + TIME_SCORE + TOPPING_BONUS`
  - `FINAL = clamp(applySoftCeiling(RAW_FINAL), 0, 10)`
- `ScoringResult` diperluas: `price_adjustment`, `topping_bonus`, `raw_final_score`, `price_tier_key`, `expected_rasa`, `expected_fasilitas`. `value_factor` di-set `1` untuk backward compat.
- `calculateLegacyScore` dibiarkan.

### 2. Migration baru — `supabase/migrations/<ts>_scoring_v2_price_tier_expectation.sql`
Non-destruktif:
- `CREATE OR REPLACE FUNCTION public.calculate_review_overall_score_v2(...)` `LANGUAGE sql IMMUTABLE`, argumen: semua field rasa (kuah + goreng), fasilitas, price, product_type, service_durasi, plus 17 boolean topping. Function berisi seluruh formula (rasa per product_type, base quality, tier expectation, price adjustment clamp, time score capped, topping bonus capped, soft ceiling, final clamp).
- `ALTER TABLE public.reviews DROP COLUMN IF EXISTS overall_score;`
- `ALTER TABLE public.reviews ADD COLUMN overall_score numeric GENERATED ALWAYS AS (public.calculate_review_overall_score_v2(...)) STORED;`
- Tidak menyentuh baris data, tidak DROP TABLE / TRUNCATE / DELETE.

### 3. `supabase/functions/generate-scorecard/index.ts`
- Duplikasi helper v2 (tier config, price adjustment, time v2, topping v2, soft ceiling) supaya sinkron dengan `src/lib/scoring.ts`.
- Prefer `review.overall_score` dari DB; fallback ke kalkulasi v2.
- Tambah `price_tier` di prompt scorecard.
- Deploy ulang function.

### 4. `src/pages/Admin.tsx`
- Preview skor pakai `calculateScore()` v2 (otomatis dari #1).
- Panel preview tampilkan: Final score, Kategori harga + bintang, Kompensasi harga, Bonus topping, Time score, Expected rasa/fasilitas.
- Pastikan semua 17 topping + `service_durasi` + `goreng_*` masuk payload preview.

### 5. `src/pages/Home.tsx`
- Sorting/Hall of Fame tetap pakai `overall_score` dari DB.
- Fallback score (jika DB null) pakai `calculateScore()` v2.
- Perceptual mapping guard tetap: tampil jika `complexity != null || sweetness != null`.

### 6. `src/pages/About.tsx`
- Tambahkan section "Scoring v2" menjelaskan:
  - Quality = Rasa 82% + Fasilitas 18%
  - Price tier sebagai ekspektasi (tabel 6 tier)
  - Bonus kecil (topping cap 0.60, time cap +0.45/−0.80)
  - Soft ceiling → `10/10` langka

### 7. Validasi
- `bun run build` lulus (typecheck + build).
- Query DB spot-check beberapa review existing setelah migration: pastikan `overall_score` recompute wajar (misal goreng score sebelumnya ~8.9 tidak melonjak ke 10).
- Simulasi manual sesuai acceptance criteria di doc:
  - Goreng 17k, rasa/fasilitas 8, service 8, 0 topping → ~8, bukan 10.
  - Murah value bagus → 7.7–8.2.
  - Mahal average → 6.4–7.0.
  - Mahal premium → 9.0–9.6.

## Yang TIDAK diubah
- MCP/OAuth (`/.lovable/oauth/consent`, edge function `mcp`, tools).
- PWA (manifest, SW, `vite.config.ts`).
- Data existing (migration hanya recompute generated column).
- Auto-generated: `src/integrations/supabase/{client,types}.ts`, `.env`, `supabase/config.toml`.
- Perceptual mapping semantik (`complexity` & `sweetness` tetap metadata).

## Catatan
- File `Revision_implementation_plan_v2.md` sudah ada di root — dibiarkan sebagai referensi dokumen.
- GitHub sync otomatis (Lovable) — tidak ada langkah `git push` manual.
