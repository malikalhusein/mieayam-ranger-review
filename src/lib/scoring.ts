/**
 * Mie Ayam Ranger Scoring Algorithm v2 — Price Tier Expectation
 *
 * FINAL_SCORE = softCeiling( BASE_QUALITY + PRICE_ADJUSTMENT + TIME_SCORE + TOPPING_BONUS )
 *
 * - BASE_QUALITY = Rasa × 0.82 + Fasilitas × 0.18
 * - PRICE_ADJUSTMENT = baseAdj(tier) + (rasa - expectedRasa) × 0.22 + (fas - expectedFas) × 0.12
 *   clamped to ±0.90
 * - TIME_SCORE capped between −0.80 and +0.45
 * - TOPPING_BONUS = min(count × 0.12, 0.60)
 * - Soft ceiling above 9.2 → 9.2 + (raw − 9.2) × 0.45, final clamp 0–10
 *
 * complexity & sweetness are metadata only (perceptual mapping), not scored.
 */

export interface ReviewScores {
  mie_tekstur?: number;
  ayam_bumbu?: number;
  ayam_potongan?: number;

  kuah_kekentalan?: number;
  kuah_keseimbangan?: number;
  kuah_kaldu?: number;
  kuah_aroma?: number;
  kuah_kejernihan?: number;

  goreng_keseimbangan_minyak?: number;
  goreng_bumbu_tumisan?: number;
  goreng_aroma_tumisan?: number;

  fasilitas_kebersihan?: number;
  fasilitas_alat_makan?: number;
  fasilitas_tempat?: number;

  service_durasi?: number;

  topping_ceker?: boolean;
  topping_bakso?: boolean;
  topping_ekstra_ayam?: boolean;
  topping_ekstra_sawi?: boolean;
  topping_balungan?: boolean;
  topping_tetelan?: boolean;
  topping_mie_jumbo?: boolean;
  topping_jenis_mie?: boolean;
  topping_pangsit_basah?: boolean;
  topping_pangsit_kering?: boolean;
  topping_dimsum?: boolean;
  topping_variasi_bumbu?: boolean;
  topping_bawang_daun?: boolean;
  topping_jamur?: boolean;
  topping_tauge?: boolean;
  topping_acar?: boolean;
  topping_kerupuk?: boolean;
}

export interface ReviewData extends ReviewScores {
  product_type: "kuah" | "goreng";
  price: number;
}

export type PriceTierKey =
  | "super_cheap"
  | "cheap"
  | "normal"
  | "mid"
  | "expensive"
  | "premium";

export interface PriceTierConfig {
  key: PriceTierKey;
  label: string;
  stars: string;
  expectedRasa: number;
  expectedFasilitas: number;
  baseAdjustment: number;
}

export interface ScoringResult {
  rasa_score: number;
  fasilitas_score: number;
  base_score: number;
  time_score: number;
  topping_bonus: number;
  price_adjustment: number;
  raw_final_score: number;
  value_factor: number; // deprecated, kept for backward compat = 1
  final_score_100: number;
  final_score_10: number;
  price_tier: string;
  price_tier_key: PriceTierKey;
  expected_rasa: number;
  expected_fasilitas: number;
  note: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function getPriceTierConfig(price: number): PriceTierConfig {
  if (price < 8000)
    return { key: "super_cheap", label: "Murah Ga Masuk Akal", stars: "⭐", expectedRasa: 5.8, expectedFasilitas: 3.5, baseAdjustment: 0.45 };
  if (price <= 10000)
    return { key: "cheap", label: "Murah", stars: "⭐⭐", expectedRasa: 6.2, expectedFasilitas: 4.2, baseAdjustment: 0.30 };
  if (price <= 12000)
    return { key: "normal", label: "Normal", stars: "⭐⭐⭐", expectedRasa: 6.8, expectedFasilitas: 5.0, baseAdjustment: 0.10 };
  if (price <= 17999)
    return { key: "mid", label: "Resto Menengah", stars: "⭐⭐⭐⭐", expectedRasa: 7.3, expectedFasilitas: 6.2, baseAdjustment: 0.0 };
  if (price <= 20000)
    return { key: "expensive", label: "Cukup Mahal", stars: "⭐⭐⭐⭐⭐", expectedRasa: 8.0, expectedFasilitas: 7.2, baseAdjustment: -0.20 };
  return { key: "premium", label: "Mahal", stars: "⭐⭐⭐⭐⭐⭐", expectedRasa: 8.5, expectedFasilitas: 8.0, baseAdjustment: -0.40 };
}

export function getPriceTier(price: number): string {
  const t = getPriceTierConfig(price);
  return `${t.stars} ${t.label}`;
}

function calculateRasaScore(review: ReviewData): number {
  const tekstur = review.mie_tekstur || 0;
  const bumbuAyam = review.ayam_bumbu || 0;
  const potonganAyam = review.ayam_potongan || 0;

  if (review.product_type === "kuah") {
    const sum =
      tekstur + bumbuAyam + potonganAyam +
      (review.kuah_kekentalan || 0) + (review.kuah_keseimbangan || 0) +
      (review.kuah_kaldu || 0) + (review.kuah_aroma || 0) + (review.kuah_kejernihan || 0);
    return sum / 8;
  }
  const sum =
    tekstur + bumbuAyam + potonganAyam +
    (review.goreng_keseimbangan_minyak || 0) +
    (review.goreng_bumbu_tumisan || 0) +
    (review.goreng_aroma_tumisan || 0);
  return sum / 6;
}

function calculateFasilitasScore(review: ReviewData): number {
  return (
    (review.fasilitas_kebersihan || 0) +
    (review.fasilitas_alat_makan || 0) +
    (review.fasilitas_tempat || 0)
  ) / 3;
}

function calculatePriceAdjustment(price: number, rasa: number, fasilitas: number, tier: PriceTierConfig): number {
  const delta =
    tier.baseAdjustment +
    (rasa - tier.expectedRasa) * 0.22 +
    (fasilitas - tier.expectedFasilitas) * 0.12;
  return clamp(delta, -0.90, 0.90);
}

function calculateTimeScoreV2(serviceDuration?: number): number {
  if (serviceDuration == null) return 0;
  const diff = 8 - serviceDuration;
  if (serviceDuration <= 8) return Math.min(diff * 0.15, 0.45);
  return Math.max(diff * 0.20, -0.80);
}

function calculateToppingBonusV2(review: ReviewScores): number {
  const toppings = [
    review.topping_ceker, review.topping_bakso, review.topping_ekstra_ayam,
    review.topping_ekstra_sawi, review.topping_balungan, review.topping_tetelan,
    review.topping_mie_jumbo, review.topping_jenis_mie, review.topping_pangsit_basah,
    review.topping_pangsit_kering, review.topping_dimsum, review.topping_variasi_bumbu,
    review.topping_bawang_daun, review.topping_jamur, review.topping_tauge,
    review.topping_acar, review.topping_kerupuk,
  ];
  const count = toppings.filter(Boolean).length;
  return Math.min(count * 0.12, 0.60);
}

function applySoftCeiling(raw: number): number {
  if (raw <= 9.2) return raw;
  return 9.2 + (raw - 9.2) * 0.45;
}

export function calculateScore(review: ReviewData): ScoringResult {
  const tier = getPriceTierConfig(review.price);
  const rasa = calculateRasaScore(review);
  const fasilitas = calculateFasilitasScore(review);
  const baseQuality = rasa * 0.82 + fasilitas * 0.18;
  const priceAdjustment = calculatePriceAdjustment(review.price, rasa, fasilitas, tier);
  const timeScore = calculateTimeScoreV2(review.service_durasi);
  const toppingBonus = calculateToppingBonusV2(review);

  const rawFinal = baseQuality + priceAdjustment + timeScore + toppingBonus;
  const finalScore10 = clamp(applySoftCeiling(rawFinal), 0, 10);

  return {
    rasa_score: parseFloat(rasa.toFixed(2)),
    fasilitas_score: parseFloat(fasilitas.toFixed(2)),
    base_score: parseFloat(baseQuality.toFixed(2)),
    time_score: parseFloat(timeScore.toFixed(2)),
    topping_bonus: parseFloat(toppingBonus.toFixed(2)),
    price_adjustment: parseFloat(priceAdjustment.toFixed(2)),
    raw_final_score: parseFloat(rawFinal.toFixed(2)),
    value_factor: 1,
    final_score_100: parseFloat((finalScore10 * 10).toFixed(2)),
    final_score_10: parseFloat(finalScore10.toFixed(2)),
    price_tier: `${tier.stars} ${tier.label}`,
    price_tier_key: tier.key,
    expected_rasa: tier.expectedRasa,
    expected_fasilitas: tier.expectedFasilitas,
    note: "Score v2: dikalibrasi terhadap ekspektasi kategori harga. Complexity & sweetness hanya metadata.",
  };
}

/** Legacy fallback for very old rows without new fields. */
export function calculateLegacyScore(review: ReviewData): number {
  const kuahScore = review.product_type === "kuah"
    ? ((review.kuah_kekentalan || 0) + (review.kuah_kaldu || 0) +
       (review.kuah_keseimbangan || 0) + (review.kuah_aroma || 0)) / 4
    : 0;
  const mieScore = review.mie_tekstur || 0;
  const ayamScore = ((review.ayam_bumbu || 0) + (review.ayam_potongan || 0)) / 2;
  const fasilitasScore = ((review.fasilitas_kebersihan || 0) +
                          (review.fasilitas_alat_makan || 0) +
                          (review.fasilitas_tempat || 0)) / 3;
  const avgRasa = (kuahScore + mieScore + ayamScore) / 3;
  return ((avgRasa + fasilitasScore) / review.price) * 1000;
}
