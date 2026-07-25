import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Scoring v2 — must stay in sync with src/lib/scoring.ts
interface ReviewData {
  product_type: "kuah" | "goreng";
  price: number;
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
  overall_score?: number;
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

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function getPriceTierConfig(price: number) {
  if (price < 8000)  return { label: "Murah Ga Masuk Akal", stars: "⭐", expectedRasa: 5.8, expectedFas: 3.5, base: 0.45 };
  if (price <= 10000) return { label: "Murah", stars: "⭐⭐", expectedRasa: 6.2, expectedFas: 4.2, base: 0.30 };
  if (price <= 12000) return { label: "Normal", stars: "⭐⭐⭐", expectedRasa: 6.8, expectedFas: 5.0, base: 0.10 };
  if (price <= 17999) return { label: "Resto Menengah", stars: "⭐⭐⭐⭐", expectedRasa: 7.3, expectedFas: 6.2, base: 0.0 };
  if (price <= 20000) return { label: "Cukup Mahal", stars: "⭐⭐⭐⭐⭐", expectedRasa: 8.0, expectedFas: 7.2, base: -0.20 };
  return { label: "Mahal", stars: "⭐⭐⭐⭐⭐⭐", expectedRasa: 8.5, expectedFas: 8.0, base: -0.40 };
}

function rasaScore(r: ReviewData): number {
  const t = r.mie_tekstur || 0, ab = r.ayam_bumbu || 0, ap = r.ayam_potongan || 0;
  if (r.product_type === "kuah") {
    return (t + ab + ap + (r.kuah_kekentalan||0) + (r.kuah_keseimbangan||0) +
            (r.kuah_kaldu||0) + (r.kuah_aroma||0) + (r.kuah_kejernihan||0)) / 8;
  }
  return (t + ab + ap + (r.goreng_keseimbangan_minyak||0) +
          (r.goreng_bumbu_tumisan||0) + (r.goreng_aroma_tumisan||0)) / 6;
}

function fasilitasScore(r: ReviewData): number {
  return ((r.fasilitas_kebersihan||0) + (r.fasilitas_alat_makan||0) + (r.fasilitas_tempat||0)) / 3;
}

function timeScoreV2(d?: number): number {
  if (d == null) return 0;
  const diff = 8 - d;
  return d <= 8 ? Math.min(diff * 0.15, 0.45) : Math.max(diff * 0.20, -0.80);
}

function toppingBonusV2(r: ReviewData): number {
  const arr = [r.topping_ceker, r.topping_bakso, r.topping_ekstra_ayam, r.topping_ekstra_sawi,
    r.topping_balungan, r.topping_tetelan, r.topping_mie_jumbo, r.topping_jenis_mie,
    r.topping_pangsit_basah, r.topping_pangsit_kering, r.topping_dimsum, r.topping_variasi_bumbu,
    r.topping_bawang_daun, r.topping_jamur, r.topping_tauge, r.topping_acar, r.topping_kerupuk];
  return Math.min(arr.filter(Boolean).length * 0.12, 0.60);
}

function softCeiling(v: number): number {
  return v <= 9.2 ? v : 9.2 + (v - 9.2) * 0.45;
}

function calculateScoreV2(r: ReviewData) {
  const tier = getPriceTierConfig(r.price);
  const rasa = rasaScore(r);
  const fas = fasilitasScore(r);
  const baseQuality = rasa * 0.82 + fas * 0.18;
  const priceAdj = clamp(tier.base + (rasa - tier.expectedRasa) * 0.22 + (fas - tier.expectedFas) * 0.12, -0.90, 0.90);
  const timeS = timeScoreV2(r.service_durasi);
  const topBonus = toppingBonusV2(r);
  const raw = baseQuality + priceAdj + timeS + topBonus;
  const finalScore10 = clamp(softCeiling(raw), 0, 10);
  return { finalScore10, rasa, fas, tier };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { review } = await req.json();
    console.log('Generating scorecard for review:', review.outlet_name);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY not configured');

    const { finalScore10, rasa, fas, tier } = calculateScoreV2(review as ReviewData);

    const displayScore = review.overall_score != null
      ? Math.min(10, parseFloat(review.overall_score)).toFixed(1)
      : finalScore10.toFixed(1);

    console.log('Scorecard scores:', { finalScore10, rasa, fas, tier: tier.label, displayScore });

    const isKuah = review.product_type === "kuah";
    const scoreBreakdown = isKuah
      ? `- Rasa (Mie + Ayam + Kuah): ${rasa.toFixed(1)}/10\n- Fasilitas: ${fas.toFixed(1)}/10`
      : `- Rasa (Mie + Ayam + Goreng): ${rasa.toFixed(1)}/10\n- Fasilitas: ${fas.toFixed(1)}/10`;

    const prompt = `Create a professional PORTRAIT Instagram story scorecard (1080x1920px, 9:16 aspect ratio) for a Mie Ayam (Indonesian chicken noodle) restaurant review with these specifications:

**Restaurant:** ${review.outlet_name}
**Location:** ${review.city}
**Type:** ${isKuah ? "Kuah (Soup)" : "Goreng (Fried)"}
**Price:** Rp ${review.price.toLocaleString('id-ID')} — ${tier.stars} ${tier.label}
**Visit Date:** ${new Date(review.visit_date).toLocaleDateString('id-ID')}

**Overall Score: ${displayScore}/10**

**Score Breakdown:**
${scoreBreakdown}

**Design Requirements:**
- PORTRAIT orientation (9:16 aspect ratio, 1080x1920px) optimized for Instagram Stories
- Warm, appetizing color scheme (oranges, yellows, warm reds)
- "MIE AYAM RANGER" branding at the top with noodle bowl logo
- Vertical layout with content stacked from top to bottom
- Clean, modern design with good readability
- Use gradient backgrounds (warm orange to yellow)
- Include food-related decorative elements (noodle illustrations, bowl icons, steam effects)
- Display the overall score PROMINENTLY in a large circular badge showing "${displayScore}/10" in the center
- Professional typography with clear hierarchy
- Add star rating visual (filled stars based on score)
- Include a decorative border or frame
- Space elements vertically to use the full portrait canvas

Make it look appetizing, professional, and share-worthy for Instagram Stories! The score "${displayScore}/10" must be clearly visible and prominent. This is a VERTICAL/PORTRAIT image.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image generated in response');
    }

    return new Response(
      JSON.stringify({ imageUrl, calculatedScore: displayScore, priceTier: `${tier.stars} ${tier.label}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in generate-scorecard function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
