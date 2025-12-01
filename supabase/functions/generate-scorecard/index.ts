import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Scoring algorithm (matches src/lib/scoring.ts)
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
}

function calculateRasaScore(review: ReviewData): number {
  const tekstur = review.mie_tekstur || 0;
  const bumbuAyam = review.ayam_bumbu || 0;
  const potonganAyam = review.ayam_potongan || 0;
  
  if (review.product_type === "kuah") {
    const bodyKuah = review.kuah_kekentalan || 0;
    const keseimbanganKuah = review.kuah_keseimbangan || 0;
    const kaldu = review.kuah_kaldu || 0;
    const aromaKuah = review.kuah_aroma || 0;
    const kejernihan = review.kuah_kejernihan || 0;
    
    return (tekstur + bumbuAyam + potonganAyam + bodyKuah + keseimbanganKuah + kaldu + aromaKuah + kejernihan) / 8;
  } else {
    const keseimbanganMinyak = review.goreng_keseimbangan_minyak || 0;
    const bumbuTumisan = review.goreng_bumbu_tumisan || 0;
    const aromaTumisan = review.goreng_aroma_tumisan || 0;
    
    return (tekstur + bumbuAyam + potonganAyam + keseimbanganMinyak + bumbuTumisan + aromaTumisan) / 6;
  }
}

function calculateFasilitasScore(review: ReviewData): number {
  const kebersihan = review.fasilitas_kebersihan || 0;
  const alatMakan = review.fasilitas_alat_makan || 0;
  const tempat = review.fasilitas_tempat || 0;
  return (kebersihan + alatMakan + tempat) / 3;
}

function calculateTimeScore(serviceDuration: number): number {
  const standardTime = 8;
  const timeDiff = standardTime - serviceDuration;
  return serviceDuration <= standardTime ? timeDiff * 1.5 : timeDiff * 2;
}

function calculateValueFactor(price: number): number {
  const standardPrice = 17000;
  const factor = standardPrice / price;
  return Math.max(0.85, Math.min(1.15, factor));
}

function calculateScore(review: ReviewData): number {
  const rasaScore = calculateRasaScore(review);
  const fasilitasScore = calculateFasilitasScore(review);
  const baseScore = (rasaScore * 0.80) + (fasilitasScore * 0.20);
  const timeScore = review.service_durasi ? calculateTimeScore(review.service_durasi) : 0;
  const valueFactor = calculateValueFactor(review.price);
  
  let finalScore100 = (baseScore + timeScore) * valueFactor;
  finalScore100 = Math.max(0, Math.min(100, finalScore100));
  
  return finalScore100 / 10;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { review } = await req.json();
    console.log('Generating scorecard for review:', review.outlet_name);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Calculate score using new algorithm
    const reviewData: ReviewData = {
      product_type: review.product_type,
      price: review.price,
      mie_tekstur: review.mie_tekstur,
      ayam_bumbu: review.ayam_bumbu,
      ayam_potongan: review.ayam_potongan,
      kuah_kekentalan: review.kuah_kekentalan,
      kuah_keseimbangan: review.kuah_keseimbangan,
      kuah_kaldu: review.kuah_kaldu,
      kuah_aroma: review.kuah_aroma,
      kuah_kejernihan: review.kuah_kejernihan,
      goreng_keseimbangan_minyak: review.goreng_keseimbangan_minyak,
      goreng_bumbu_tumisan: review.goreng_bumbu_tumisan,
      goreng_aroma_tumisan: review.goreng_aroma_tumisan,
      fasilitas_kebersihan: review.fasilitas_kebersihan,
      fasilitas_alat_makan: review.fasilitas_alat_makan,
      fasilitas_tempat: review.fasilitas_tempat,
      service_durasi: review.service_durasi,
    };

    const finalScore = calculateScore(reviewData);
    const rasaScore = calculateRasaScore(reviewData);
    const fasilitasScore = calculateFasilitasScore(reviewData);

    // Create detailed prompt for scorecard
    const isKuah = review.product_type === "kuah";
    const scoreBreakdown = isKuah
      ? `- Rasa (Mie + Ayam + Kuah): ${rasaScore.toFixed(1)}/10\n- Fasilitas: ${fasilitasScore.toFixed(1)}/10`
      : `- Rasa (Mie + Ayam + Goreng): ${rasaScore.toFixed(1)}/10\n- Fasilitas: ${fasilitasScore.toFixed(1)}/10`;

    const prompt = `Create a professional Instagram story scorecard (1920x1080px landscape) for a Mie Ayam (Indonesian chicken noodle) restaurant review with these specifications:

**Restaurant:** ${review.outlet_name}
**Location:** ${review.city}
**Type:** ${isKuah ? "Kuah (Soup)" : "Goreng (Fried)"}
**Price:** Rp ${review.price.toLocaleString('id-ID')}
**Visit Date:** ${new Date(review.visit_date).toLocaleDateString('id-ID')}

**Overall Score: ${finalScore.toFixed(1)}/10**

**Score Breakdown:**
${scoreBreakdown}

**Design Requirements:**
- Warm, appetizing color scheme (oranges, yellows, warm reds)
- "MIE AYAM RANGER" branding at the top
- Clean, modern layout with good readability
- Use gradient backgrounds
- Include food-related decorative elements (noodle illustrations, bowl icons)
- Display the overall score prominently with visual indicators
- Professional typography
- Instagram story optimized format (1920x1080px landscape)

Make it look appetizing, professional, and share-worthy for social media!`;

    console.log('Sending request to Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from AI Gateway');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image generated in response');
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in generate-scorecard function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
