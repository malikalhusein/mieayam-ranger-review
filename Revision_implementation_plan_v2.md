Saya akan buat file baru `Revision_implementation_plan_v2.md` di root project, dengan revisi algoritma berbasis kategori harga sekaligus kalibrasi agar score tidak mudah mentok `10/10`.

Sudah saya buat file baru:

```text

# Revision Implementation Plan v2 — Price Tier Expectation Scoring

## Ringkasan Masalah

Setelah perbaikan formula scoring sebelumnya, masalah utama Mie Ayam Goreng mulai teratasi: field `goreng_*` sudah masuk perhitungan dan bug pembagian skala `0–10` sudah diperbaiki. Namun muncul masalah baru:

> Terlalu banyak mie ayam mendapatkan score `10/10`.

Ini terjadi karena formula saat ini masih terlalu mudah mencapai plafon `10`, terutama saat beberapa faktor bonus digabung:

- `baseScore` sudah tinggi,
- `timeScore` bisa memberi bonus cukup besar,
- `toppingBonus` bisa akumulatif besar,
- kompensasi harga murah dapat menaikkan score terlalu agresif,
- final score hanya di-`clamp` ke `10`, sehingga banyak hasil bagus terkumpul di angka maksimum.

Selain itu, kategori harga belum dipakai sebagai **basis ekspektasi**. Filosofi scoring yang diinginkan adalah:

> Semakin mahal mie ayam, semakin tinggi value yang bisa dituntut. Sebaliknya, semakin murah mie ayam, semakin sedikit hal yang perlu diekspektasikan. Mie ayam Rp8.000 tidak adil dibandingkan langsung dengan mie ayam Rp15.000, baik dari rasa maupun fasilitas.

Maka scoring v2 harus menilai performa relatif terhadap kelas harga, bukan sekadar memberi multiplier murah/mahal.

---

## Tujuan Scoring v2

1. Mie Ayam Goreng dan Kuah tetap dihitung dengan indikator masing-masing.
2. Harga menjadi konteks ekspektasi, bukan sekadar boost/penalty kasar.
3. Score `10/10` menjadi sangat langka, hanya untuk review yang luar biasa pada kelas harganya.
4. Topping dan waktu penyajian menjadi bonus kecil, bukan faktor utama yang membuat score mentok.
5. Frontend preview, DB generated `overall_score`, dan scorecard function harus konsisten.
6. `complexity` dan `sweetness` tetap metadata perceptual mapping, tidak mempengaruhi score.
7. Existing data tidak dihapus.

---

## Kategori Harga

Kategori harga yang digunakan:

| Harga | Kategori | Label |
|---:|---|---|
| `< Rp8.000` | Murah Ga Masuk Akal | ⭐ |
| `Rp8.000 - Rp10.000` | Murah | ⭐⭐ |
| `Rp11.000 - Rp12.000` | Normal | ⭐⭐⭐ |
| `Rp13.000 - Rp15.000` | Resto Menengah | ⭐⭐⭐⭐ |
| `Rp18.000 - Rp20.000` | Cukup Mahal | ⭐⭐⭐⭐⭐ |
| `> Rp20.000` | Mahal | ⭐⭐⭐⭐⭐⭐ |

Catatan gap harga:

- `Rp15.001 - Rp17.999` tidak disebut eksplisit.
- Untuk implementasi stabil, masukkan ke kategori transisi `Resto Menengah+` atau gabungkan ke `Resto Menengah`.
- Rekomendasi implementasi sederhana:

```text
13.000 - 17.999 = Resto Menengah ⭐⭐⭐⭐
18.000 - 20.000 = Cukup Mahal ⭐⭐⭐⭐⭐
> 20.000       = Mahal ⭐⭐⭐⭐⭐⭐
```

---

## Konsep Utama v2

Scoring v2 memakai pendekatan:

```text
Final Score = Quality Score + Price Tier Adjustment + Small Bonuses/Penalties
```

Bukan:

```text
Final Score = Quality Score × price multiplier besar
```

Harga dipakai untuk menentukan standar ekspektasi.

Contoh:

- Mie ayam Rp8.000 dengan rasa `7.2` dan fasilitas `4.5` bisa dianggap sangat value.
- Mie ayam Rp22.000 dengan rasa `7.2` dan fasilitas `4.5` harus dinilai kurang memenuhi ekspektasi.
- Tapi mie ayam Rp22.000 dengan rasa `9.0` dan fasilitas `8.5` tetap bisa score tinggi.

---

## Formula Scoring v2

### 1. Rasa Score

#### Kuah

```text
RASA_KUAH =
(
  mie_tekstur +
  ayam_bumbu +
  ayam_potongan +
  kuah_kekentalan +
  kuah_keseimbangan +
  kuah_kaldu +
  kuah_aroma +
  kuah_kejernihan
) / 8
```

#### Goreng

```text
RASA_GORENG =
(
  mie_tekstur +
  ayam_bumbu +
  ayam_potongan +
  goreng_keseimbangan_minyak +
  goreng_bumbu_tumisan +
  goreng_aroma_tumisan
) / 6
```

### 2. Fasilitas Score

```text
FASILITAS_SCORE =
(
  fasilitas_kebersihan +
  fasilitas_alat_makan +
  fasilitas_tempat
) / 3
```

### 3. Base Quality Score

Rasa tetap dominan.

```text
BASE_QUALITY = (RASA_SCORE × 0.82) + (FASILITAS_SCORE × 0.18)
```

Kenapa fasilitas hanya `18%`?

- Mie ayam murah jangan terlalu jatuh hanya karena fasilitas sederhana.
- Untuk harga mahal, fasilitas tetap dituntut lewat price tier expectation.

---

## Price Tier Expectation

Setiap kategori harga punya ekspektasi minimum.

| Tier | Range | Expected Rasa | Expected Fasilitas | Base Adjustment |
|---|---:|---:|---:|---:|
| `super_cheap` | `< 8.000` | `5.8` | `3.5` | `+0.45` |
| `cheap` | `8.000 - 10.000` | `6.2` | `4.2` | `+0.30` |
| `normal` | `11.000 - 12.000` | `6.8` | `5.0` | `+0.10` |
| `mid` | `13.000 - 17.999` | `7.3` | `6.2` | `0.00` |
| `expensive` | `18.000 - 20.000` | `8.0` | `7.2` | `-0.20` |
| `premium` | `> 20.000` | `8.5` | `8.0` | `-0.40` |

Catatan penting:

- Base adjustment sengaja lebih kecil daripada usulan awal agar score tidak terlalu mudah mentok `10`.
- Murah tetap dapat kompensasi, tapi bukan auto-win.
- Mahal tetap kena tuntutan, tapi bukan auto-punishment.

---

## Price Adjustment Formula

```text
EXPECTATION_DELTA =
  ((RASA_SCORE - EXPECTED_RASA) × 0.22)
  +
  ((FASILITAS_SCORE - EXPECTED_FASILITAS) × 0.12)
```

```text
PRICE_ADJUSTMENT = BASE_ADJUSTMENT + EXPECTATION_DELTA
```

Lalu dibatasi:

```text
PRICE_ADJUSTMENT = clamp(PRICE_ADJUSTMENT, -0.90, +0.90)
```

Kenapa limit `±0.90`?

- Agar harga menjadi konteks, bukan faktor yang mendominasi.
- Mengurangi risiko terlalu banyak `10/10`.
- Score 10 harus datang dari kualitas rasa/fasilitas yang memang sangat tinggi, bukan dari kompensasi harga saja.

---

## Time Score v2

Formula lama bisa terlalu agresif. Waktu penyajian harus jadi faktor pengalaman, bukan pembalik hasil utama.

```text
Jika service_durasi kosong:
  TIME_SCORE = 0

Jika service_durasi <= 8:
  TIME_SCORE = min((8 - service_durasi) × 0.15, 0.45)

Jika service_durasi > 8:
  TIME_SCORE = max((8 - service_durasi) × 0.20, -0.80)
```

Contoh:

| Durasi | Time Score |
|---:|---:|
| 5 menit | `+0.45` |
| 8 menit | `0` |
| 12 menit | `-0.80` |
| 20 menit | `-0.80` cap |

Alasan:

- Service cepat boleh diapresiasi, tapi tidak boleh membuat makanan biasa jadi `10/10`.
- Service lambat perlu terasa, tapi jangan menghancurkan seluruh score jika rasanya sangat bagus.

---

## Topping Bonus v2

Formula lama `+0.5 per topping` terlalu besar. Dengan banyak topping, score mudah mentok.

Gunakan diminishing return.

```text
TOPPING_COUNT = jumlah topping true
TOPPING_BONUS = min(TOPPING_COUNT × 0.12, 0.60)
```

Artinya:

| Jumlah Topping | Bonus |
|---:|---:|
| 1 | `+0.12` |
| 3 | `+0.36` |
| 5+ | `+0.60` cap |

Topping yang dihitung:

- `topping_ceker`
- `topping_bakso`
- `topping_ekstra_ayam`
- `topping_ekstra_sawi`
- `topping_balungan`
- `topping_tetelan`
- `topping_mie_jumbo`
- `topping_jenis_mie`
- `topping_pangsit_basah`
- `topping_pangsit_kering`
- `topping_dimsum`
- `topping_variasi_bumbu`
- `topping_bawang_daun`
- `topping_jamur`
- `topping_tauge`
- `topping_acar`
- `topping_kerupuk`

---

## Anti-Inflation / Anti-10 Rule

Untuk mencegah terlalu banyak `10/10`, tambahkan soft ceiling.

### Final Score Before Ceiling

```text
RAW_FINAL = BASE_QUALITY + PRICE_ADJUSTMENT + TIME_SCORE + TOPPING_BONUS
```

### Soft Ceiling

Jika `RAW_FINAL <= 9.2`:

```text
FINAL_SCORE = RAW_FINAL
```

Jika `RAW_FINAL > 9.2`:

```text
FINAL_SCORE = 9.2 + ((RAW_FINAL - 9.2) × 0.45)
```

Lalu tetap clamp:

```text
FINAL_SCORE = clamp(FINAL_SCORE, 0, 10)
```

Efeknya:

- Score bagus tetap bagus.
- Score sangat tinggi naik lebih pelan.
- `10/10` hanya mungkin jika raw score benar-benar luar biasa jauh di atas ekspektasi.

Contoh:

| Raw Final | Setelah Soft Ceiling |
|---:|---:|
| `9.0` | `9.0` |
| `9.5` | `9.34` |
| `10.0` | `9.56` |
| `11.0` | `10.0` cap |

---

## Final Formula v2

```text
BASE_QUALITY = (RASA_SCORE × 0.82) + (FASILITAS_SCORE × 0.18)

PRICE_ADJUSTMENT = clamp(
  BASE_PRICE_TIER_ADJUSTMENT
  + ((RASA_SCORE - EXPECTED_RASA) × 0.22)
  + ((FASILITAS_SCORE - EXPECTED_FASILITAS) × 0.12),
  -0.90,
  +0.90
)

TIME_SCORE = capped small bonus/penalty

TOPPING_BONUS = min(TOPPING_COUNT × 0.12, 0.60)

RAW_FINAL = BASE_QUALITY + PRICE_ADJUSTMENT + TIME_SCORE + TOPPING_BONUS

FINAL_SCORE = applySoftCeiling(RAW_FINAL)
FINAL_SCORE = clamp(FINAL_SCORE, 0, 10)
```

---

## Simulasi Expected Behavior

### Case A — Mie Ayam Murah, Bagus untuk Harga

```text
price = 8.000
rasa = 7.4
fasilitas = 4.5
service = 8 menit
topping = 1
```

Ekspektasi murah:

```text
expected rasa = 6.2
expected fasilitas = 4.2
```

Hasil kira-kira:

```text
score = 7.6 - 8.1
```

Bukan otomatis `10`, tapi terlihat sangat bagus untuk kelas harga.

### Case B — Mie Ayam 15rb, Kualitas Sama

```text
price = 15.000
rasa = 7.4
fasilitas = 4.5
service = 8 menit
topping = 1
```

Ekspektasi resto menengah lebih tinggi.

Hasil kira-kira:

```text
score = 6.9 - 7.4
```

### Case C — Mie Ayam Mahal, Kualitas Standar

```text
price = 22.000
rasa = 7.4
fasilitas = 4.5
service = 8 menit
topping = 1
```

Ekspektasi mahal jauh lebih tinggi.

Hasil kira-kira:

```text
score = 6.2 - 6.8
```

### Case D — Mie Ayam Mahal, Memang Premium

```text
price = 22.000
rasa = 9.2
fasilitas = 8.8
service = 6 menit
topping = 4
```

Hasil kira-kira:

```text
score = 9.0 - 9.6
```

Masih tidak gampang `10/10`, tapi jelas masuk top tier.

---

## Perubahan Code yang Dibutuhkan

### 1. `src/lib/scoring.ts`

Tambahkan tipe dan config:

```ts
export type PriceTierKey =
  | "super_cheap"
  | "cheap"
  | "normal"
  | "mid"
  | "expensive"
  | "premium";

export interface PriceTierConfig {
  key: PriceTierKey;
  minPrice: number;
  maxPrice: number;
  label: string;
  stars: string;
  expectedRasa: number;
  expectedFasilitas: number;
  baseAdjustment: number;
}
```

Implementasikan:

```ts
export function getPriceTierConfig(price: number): PriceTierConfig;
function calculatePriceAdjustment(price: number, rasaScore: number, fasilitasScore: number): number;
function calculateTimeScoreV2(serviceDuration?: number): number;
function calculateToppingBonusV2(review: ReviewScores): number;
function applySoftCeiling(score: number): number;
```

Update `ScoringResult` agar lebih transparan:

```ts
export interface ScoringResult {
  rasa_score: number;
  fasilitas_score: number;
  base_score: number;
  time_score: number;
  topping_bonus: number;
  price_adjustment: number;
  raw_final_score: number;
  final_score_100: number;
  final_score_10: number;
  price_tier: string;
  price_tier_key: PriceTierKey;
  expected_rasa: number;
  expected_fasilitas: number;
  note: string;
}
```

Remove/replace old `value_factor` from result. If backward compatibility is needed, keep it as `1` or mark deprecated.

### 2. `src/pages/Admin.tsx`

Update preview display:

- Show `final_score_10`.
- Show `price_tier`.
- Show `price_adjustment`.
- Show `topping_bonus`.
- Show `time_score`.

Suggested preview text:

```text
Preview Overall Score: 8.24 / 10
Kategori Harga: Murah ⭐⭐
Kompensasi Harga: +0.42
Bonus Topping: +0.24
Time Score: 0.00
```

Ensure all toppings are passed to `calculateScore()`.

### 3. `src/pages/Home.tsx`

Ensure fallback/calculated score uses v2 fields.

Important:

- Sorting and hall of fame should still use `overall_score` from DB if available.
- If fallback is used, it must use `calculateScore()` v2.

### 4. `supabase/functions/generate-scorecard/index.ts`

Sync formula with `src/lib/scoring.ts`.

Options:

- Best: duplicate v2 helper functions inside Edge Function.
- Better long-term: move scoring logic into a shared file if build/deploy supports it.

Scorecard should:

- Prefer `review.overall_score` from DB.
- Fallback to v2 calculation if DB score missing.
- Display price tier if possible.

### 5. `supabase/migrations/<timestamp>_scoring_v2_price_tier_expectation.sql`

Create new migration after the existing scoring fix migration.

Migration must:

1. Drop generated `overall_score`.
2. Ensure score columns are `NUMERIC`.
3. Ensure score constraints are `0–10`.
4. Recreate generated `overall_score` using scoring v2.
5. Avoid destructive operations.

Forbidden:

```sql
DROP TABLE public.reviews;
TRUNCATE public.reviews;
DELETE FROM public.reviews;
```

Allowed:

```sql
ALTER TABLE public.reviews DROP COLUMN IF EXISTS overall_score;
ALTER TABLE public.reviews ALTER COLUMN ... TYPE NUMERIC;
ALTER TABLE public.reviews ADD COLUMN overall_score NUMERIC GENERATED ALWAYS AS (...) STORED;
```

---

## SQL Formula Notes

The generated column should implement:

1. `rasa_score`
2. `fasilitas_score`
3. `base_quality`
4. `price_tier expected values`
5. `price_adjustment`
6. `time_score`
7. `topping_bonus`
8. `raw_final`
9. `soft_ceiling`
10. final clamp `0–10`

Because generated columns cannot easily reuse aliases inside the same expression, prefer a SQL helper function if Supabase/Postgres allows it safely.

### Recommended DB Approach

Instead of giant generated expression, create immutable SQL function:

```sql
CREATE OR REPLACE FUNCTION public.calculate_review_overall_score_v2(...)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  ...
$$;
```

Then generated column:

```sql
overall_score NUMERIC GENERATED ALWAYS AS (
  public.calculate_review_overall_score_v2(...)
) STORED
```

This is more maintainable than a huge inline generated expression.

Important:

- Function must be `IMMUTABLE` to be used in generated column.
- It must only depend on input arguments, not table lookups.

---

## Perceptual Mapping

No scoring impact.

Rules:

- `complexity` range: `-5` to `+5`.
- `sweetness` range: `-5` to `+5`.
- If one value missing, default that axis to `0` for map display.
- Show map when:

```text
complexity != null OR sweetness != null
```

Do not hide perceptual mapping because score is `0`, `null`, or unavailable.

---

## About Page Update

Update `src/pages/About.tsx` to explain scoring v2:

```text
Score Mie Ayam Ranger v2 menilai performa relatif terhadap kelas harga.
Mie ayam murah tidak dituntut punya fasilitas seperti resto mahal, tetapi tetap harus enak.
Mie ayam mahal harus memberikan rasa, fasilitas, dan pengalaman yang sesuai ekspektasi harganya.
```

Suggested formula display:

```text
Final Score = Quality Score + Price Tier Adjustment + Small Bonuses
```

Where:

```text
Quality Score = Rasa 82% + Fasilitas 18%
Price Tier Adjustment = performa dibanding ekspektasi kategori harga
Small Bonuses = waktu penyajian + variasi topping, dengan batas maksimum
```

---

## Validation Plan

### 1. Build Validation

Run:

```bash
npm install
node node_modules/typescript/bin/tsc -b
npm run build
```

Expected:

```text
Typecheck passed
Build passed
```

### 2. Manual Score Simulations

#### Goreng Normal

```text
price = 17.000
rasa = 8
fasilitas = 8
service = 8
toppings = 0
```

Expected:

```text
score around 8.0, not 10
```

#### Murah Good Value

```text
price = 8.000
rasa = 7.5
fasilitas = 4.5
service = 8
toppings = 1
```

Expected:

```text
score around 7.7 - 8.2
```

#### Mahal Average Quality

```text
price = 22.000
rasa = 7.5
fasilitas = 5.5
service = 8
toppings = 1
```

Expected:

```text
score around 6.4 - 7.0
```

#### Mahal Premium Quality

```text
price = 22.000
rasa = 9.2
fasilitas = 8.8
service = 6
toppings = 4
```

Expected:

```text
score around 9.0 - 9.6
```

#### Perfect-ish Cheap Stall

```text
price = 8.000
rasa = 9.5
fasilitas = 7.0
service = 5
toppings = 5
```

Expected:

```text
score high, around 9.3 - 9.8, but not automatically 10
```

---

## Acceptance Criteria

- [ ] Mie Ayam Goreng uses `goreng_*` fields in frontend and DB.
- [ ] Score no longer divides by `10` twice.
- [ ] Price tier is used as expectation context.
- [ ] Topping bonus capped at `0.60`.
- [ ] Time score capped between `-0.80` and `+0.45`.
- [ ] Price adjustment capped between `-0.90` and `+0.90`.
- [ ] Soft ceiling prevents score inflation above `9.2`.
- [ ] `10/10` becomes rare.
- [ ] Perceptual mapping remains independent from score.
- [ ] Admin preview explains score components.
- [ ] About page explains v2 scoring.
- [ ] Edge function scorecard matches DB/frontend.
- [ ] Existing review rows are not deleted.
- [ ] Lovable deploy succeeds.

---

## Prompt for Lovable Execution

Use this prompt in Lovable:

```text
Please implement Scoring Algorithm v2 for Mie Ayam Ranger based on price tier expectation.

Context:
The previous scoring fix solved the Mie Ayam Goreng missing goreng_* fields and removed the incorrect /10 scaling. However, too many reviews now get 10/10. We need calibrated scoring where price category defines expectations.

Requirements:
1. Keep product_type-specific rasa calculation:
   - kuah uses mie_tekstur, ayam_bumbu, ayam_potongan, kuah_kekentalan, kuah_keseimbangan, kuah_kaldu, kuah_aroma, kuah_kejernihan.
   - goreng uses mie_tekstur, ayam_bumbu, ayam_potongan, goreng_keseimbangan_minyak, goreng_bumbu_tumisan, goreng_aroma_tumisan.
2. Use BASE_QUALITY = rasa * 0.82 + fasilitas * 0.18.
3. Replace old VALUE_FACTOR with price tier expectation adjustment.
4. Price tiers:
   - < 8000 = Murah Ga Masuk Akal ⭐, expected rasa 5.8, expected fasilitas 3.5, base adjustment +0.45
   - 8000-10000 = Murah ⭐⭐, expected rasa 6.2, expected fasilitas 4.2, base adjustment +0.30
   - 11000-12000 = Normal ⭐⭐⭐, expected rasa 6.8, expected fasilitas 5.0, base adjustment +0.10
   - 13000-17999 = Resto Menengah ⭐⭐⭐⭐, expected rasa 7.3, expected fasilitas 6.2, base adjustment 0
   - 18000-20000 = Cukup Mahal ⭐⭐⭐⭐⭐, expected rasa 8.0, expected fasilitas 7.2, base adjustment -0.20
   - > 20000 = Mahal ⭐⭐⭐⭐⭐⭐, expected rasa 8.5, expected fasilitas 8.0, base adjustment -0.40
5. PRICE_ADJUSTMENT = clamp(baseAdjustment + (rasa - expectedRasa) * 0.22 + (fasilitas - expectedFasilitas) * 0.12, -0.90, +0.90).
6. TIME_SCORE must be small and capped:
   - missing service_durasi = 0
   - <= 8 minutes: min((8 - service_durasi) * 0.15, 0.45)
   - > 8 minutes: max((8 - service_durasi) * 0.20, -0.80)
7. TOPPING_BONUS = min(numberOfTrueToppings * 0.12, 0.60).
8. RAW_FINAL = BASE_QUALITY + PRICE_ADJUSTMENT + TIME_SCORE + TOPPING_BONUS.
9. Apply soft ceiling:
   - if RAW_FINAL <= 9.2, use RAW_FINAL
   - if RAW_FINAL > 9.2, use 9.2 + ((RAW_FINAL - 9.2) * 0.45)
   - final clamp to 0-10.
10. Update src/lib/scoring.ts, Admin preview, Home fallback score, generate-scorecard function, and database migration so all formulas match.
11. Add score breakdown fields: price_tier, price_adjustment, topping_bonus, raw_final_score, expected_rasa, expected_fasilitas.
12. Keep complexity and sweetness only for perceptual mapping; they must not affect score.
13. Update About page to explain scoring v2.
14. Do not delete, truncate, reset, or wipe existing data.
15. Preserve existing MCP/OAuth/PWA changes.

Validation:
- Build must pass.
- Goreng with price 17000, all rasa/fasilitas 8, service 8, no toppings should score around 8, not 10.
- Cheap good-value stall should score higher than mid-price with same quality, but not automatically 10.
- Expensive average stall should be penalized relative to its higher expectation.
- 10/10 should be rare.
```

---

## Final Recommendation

Implement v2 as a new migration and algorithm revision, not as a tiny patch on top of the previous formula. The previous fix was necessary to make scoring correct; v2 is necessary to make scoring calibrated and meaningful.


```

Isinya sudah menyesuaikan masukan kamu:

- Kategori harga dipakai sebagai **ekspektasi**, bukan sekadar multiplier.
- Formula baru menghindari terlalu banyak score `10/10`.
- Topping bonus dibuat kecil dan capped.
- Time score dibuat kecil dan capped.
- Price adjustment dibatasi.
- Ditambahkan **soft ceiling** di atas `9.2` supaya score tinggi naik lebih pelan.
- Ada prompt siap pakai untuk Lovable.
- Ada acceptance criteria dan simulasi expected score.

Poin penting dari revisi v2:

```text
BASE_QUALITY = Rasa 82% + Fasilitas 18%

PRICE_ADJUSTMENT = kompensasi berdasarkan performa relatif terhadap kategori harga

TOPPING_BONUS = min(jumlah topping × 0.12, 0.60)

TIME_SCORE = capped antara -0.80 sampai +0.45

RAW_FINAL = BASE_QUALITY + PRICE_ADJUSTMENT + TIME_SCORE + TOPPING_BONUS

Jika RAW_FINAL > 9.2:
FINAL_SCORE = 9.2 + ((RAW_FINAL - 9.2) × 0.45)
```

Tujuannya: `10/10` hanya muncul kalau benar-benar luar biasa, bukan karena bonus murah/topping/time numpuk.
