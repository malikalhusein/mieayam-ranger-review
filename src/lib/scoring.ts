/**
 * Mie Ayam Ranger Scoring Algorithm
 * Inspired by Coffee Value Assessment (SCA)
 * 
 * Formula:
 * - RASA_SCORE (80% weight)
 * - FASILITAS_SCORE (20% weight)
 * - BASE_SCORE = (RASA × 0.80) + (FASILITAS × 0.20)
 * - TIME_SCORE (bonus/penalty based on 8 min standard)
 * - VALUE_FACTOR = 17000 / price (clamped 0.85-1.15)
 * - FINAL_SCORE = (BASE_SCORE + TIME_SCORE) × VALUE_FACTOR
 */

export interface ReviewScores {
  // Common indicators
  mie_tekstur?: number;
  ayam_bumbu?: number;
  ayam_potongan?: number;
  
  // Kuah-specific indicators
  kuah_kekentalan?: number; // Body Kuah
  kuah_keseimbangan?: number; // Keseimbangan Rasa Kuah
  kuah_kaldu?: number; // Kaldu/Umami/Depth
  kuah_aroma?: number; // Aroma Kuah
  kuah_kejernihan?: number; // Kejernihan/Visual Kuah
  
  // Goreng-specific indicators
  goreng_keseimbangan_minyak?: number;
  goreng_bumbu_tumisan?: number;
  goreng_aroma_tumisan?: number;
  
  // Facilities
  fasilitas_kebersihan?: number;
  fasilitas_alat_makan?: number;
  fasilitas_tempat?: number;
  
  // Other factors
  service_durasi?: number; // in minutes
  
  // Topping availability (bonus points)
  topping_ceker?: boolean;
  topping_bakso?: boolean;
  topping_ekstra_ayam?: boolean;
  topping_ekstra_sawi?: boolean;
  topping_balungan?: boolean;
  topping_tetelan?: boolean;
  topping_mie_jumbo?: boolean;
  topping_jenis_mie?: boolean;
}

export interface ReviewData extends ReviewScores {
  product_type: "kuah" | "goreng";
  price: number;
}

export interface ScoringResult {
  rasa_score: number;
  fasilitas_score: number;
  base_score: number;
  time_score: number;
  value_factor: number;
  final_score_100: number;
  final_score_10: number;
  price_tier: string;
  note: string;
}

/**
 * Get price tier category for metadata
 */
export function getPriceTier(price: number): string {
  if (price < 8000) return "⭐ Murah Ga Masuk Akal";
  if (price <= 10000) return "⭐⭐ Murah";
  if (price <= 12000) return "⭐⭐⭐ Normal";
  if (price <= 15000) return "⭐⭐⭐⭐ Resto Menengah";
  if (price <= 20000) return "⭐⭐⭐⭐⭐ Cukup Mahal";
  return "⭐⭐⭐⭐⭐⭐ Mahal";
}

/**
 * Calculate RASA_SCORE based on product type
 */
function calculateRasaScore(review: ReviewData): number {
  const tekstur = review.mie_tekstur || 0;
  const bumbuAyam = review.ayam_bumbu || 0;
  const potonganAyam = review.ayam_potongan || 0;
  
  if (review.product_type === "kuah") {
    // For KUAH: average of 8 indicators
    const bodyKuah = review.kuah_kekentalan || 0;
    const keseimbanganKuah = review.kuah_keseimbangan || 0;
    const kaldu = review.kuah_kaldu || 0;
    const aromaKuah = review.kuah_aroma || 0;
    const kejernihan = review.kuah_kejernihan || 0;
    
    const sum = tekstur + bumbuAyam + potonganAyam + 
                bodyKuah + keseimbanganKuah + kaldu + aromaKuah + kejernihan;
    return sum / 8;
  } else {
    // For GORENG: average of 6 indicators
    const keseimbanganMinyak = review.goreng_keseimbangan_minyak || 0;
    const bumbuTumisan = review.goreng_bumbu_tumisan || 0;
    const aromaTumisan = review.goreng_aroma_tumisan || 0;
    
    const sum = tekstur + bumbuAyam + potonganAyam + 
                keseimbanganMinyak + bumbuTumisan + aromaTumisan;
    return sum / 6;
  }
}

/**
 * Calculate FASILITAS_SCORE
 */
function calculateFasilitasScore(review: ReviewData): number {
  const kebersihan = review.fasilitas_kebersihan || 0;
  const alatMakan = review.fasilitas_alat_makan || 0;
  const tempat = review.fasilitas_tempat || 0;
  
  return (kebersihan + alatMakan + tempat) / 3;
}

/**
 * Calculate TIME_SCORE (bonus/penalty)
 * Standard: 8 minutes
 * If <= 8: bonus = (8 - time) × 1.5
 * If > 8: penalty = (8 - time) × 2 (negative)
 */
function calculateTimeScore(serviceDuration: number): number {
  const standardTime = 8;
  const timeDiff = standardTime - serviceDuration;
  
  if (serviceDuration <= standardTime) {
    return timeDiff * 1.5; // bonus for fast service
  } else {
    return timeDiff * 2; // penalty for slow service (negative value)
  }
}

/**
 * Calculate TOPPING_BONUS
 * Each available topping adds 0.5 points (max 4 points for 8 toppings)
 */
function calculateToppingBonus(review: ReviewScores): number {
  const toppings = [
    review.topping_ceker,
    review.topping_bakso,
    review.topping_ekstra_ayam,
    review.topping_ekstra_sawi,
    review.topping_balungan,
    review.topping_tetelan,
    review.topping_mie_jumbo,
    review.topping_jenis_mie,
  ];
  
  const availableCount = toppings.filter(Boolean).length;
  return availableCount * 0.5; // 0.5 points per topping
}

/**
 * Calculate VALUE_FACTOR
 * Standard price: Rp 17,000
 * Factor = 17000 / price
 * Clamped between 0.85 and 1.15
 */
function calculateValueFactor(price: number): number {
  const standardPrice = 17000;
  const factor = standardPrice / price;
  
  // Clamp between 0.85 and 1.15
  return Math.max(0.85, Math.min(1.15, factor));
}

/**
 * Main scoring function
 * Returns complete scoring breakdown
 */
export function calculateScore(review: ReviewData): ScoringResult {
  // 1. Calculate RASA_SCORE
  const rasaScore = calculateRasaScore(review);
  
  // 2. Calculate FASILITAS_SCORE
  const fasilitasScore = calculateFasilitasScore(review);
  
  // 3. Calculate BASE_SCORE (weighted average)
  const baseScore = (rasaScore * 0.80) + (fasilitasScore * 0.20);
  
  // 4. Calculate TIME_SCORE
  const timeScore = review.service_durasi 
    ? calculateTimeScore(review.service_durasi)
    : 0;
  
  // 5. Calculate TOPPING_BONUS
  const toppingBonus = calculateToppingBonus(review);
  
  // 6. Calculate VALUE_FACTOR
  const valueFactor = calculateValueFactor(review.price);
  
  // 7. Calculate FINAL_SCORE (including topping bonus)
  let finalScore100 = (baseScore + timeScore + toppingBonus) * valueFactor;
  
  // Clamp between 0 and 100
  finalScore100 = Math.max(0, Math.min(100, finalScore100));
  
  // 7. Convert to 0-10 scale for UI and clamp to max 10
  const finalScore10 = Math.min(10, finalScore100 / 10);
  
  // 8. Get price tier
  const priceTier = getPriceTier(review.price);
  
  return {
    rasa_score: parseFloat(rasaScore.toFixed(2)),
    fasilitas_score: parseFloat(fasilitasScore.toFixed(2)),
    base_score: parseFloat(baseScore.toFixed(2)),
    time_score: parseFloat(timeScore.toFixed(2)),
    value_factor: parseFloat(valueFactor.toFixed(2)),
    final_score_100: parseFloat(finalScore100.toFixed(2)),
    final_score_10: parseFloat(finalScore10.toFixed(2)),
    price_tier: priceTier,
    note: "Kompleksitas rasa & profil rasa tidak mempengaruhi skor; hanya metadata."
  };
}

/**
 * Legacy scoring for backward compatibility
 * This matches the old formula for existing reviews
 */
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
