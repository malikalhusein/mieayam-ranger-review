import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch reviews data for context with ALL scoring parameters
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: reviews, error: dbError } = await supabase
      .from("reviews")
      .select(`
        id, slug, outlet_name, address, city, product_type, price, overall_score, notes, complexity, sweetness,
        kuah_kekentalan, kuah_kaldu, kuah_keseimbangan, kuah_aroma, kuah_kejernihan,
        goreng_keseimbangan_minyak, goreng_bumbu_tumisan, goreng_aroma_tumisan,
        mie_tekstur, ayam_bumbu, ayam_potongan,
        fasilitas_kebersihan, fasilitas_alat_makan, fasilitas_tempat, service_durasi,
        topping_ceker, topping_bakso, topping_ekstra_ayam, topping_ekstra_sawi, topping_balungan,
        topping_tetelan, topping_mie_jumbo, topping_jenis_mie, topping_pangsit_basah, topping_pangsit_kering,
        topping_dimsum, topping_variasi_bumbu, topping_bawang_daun
      `)
      .order("overall_score", { ascending: false })
      .limit(100);

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Build comprehensive context from reviews with all scoring parameters
    const reviewsContext = reviews?.map((r) => {
      const toppings = [];
      if (r.topping_ceker) toppings.push("Ceker");
      if (r.topping_bakso) toppings.push("Bakso");
      if (r.topping_ekstra_ayam) toppings.push("Ekstra Ayam");
      if (r.topping_ekstra_sawi) toppings.push("Ekstra Sawi");
      if (r.topping_balungan) toppings.push("Balungan");
      if (r.topping_tetelan) toppings.push("Tetelan");
      if (r.topping_mie_jumbo) toppings.push("Mie Jumbo");
      if (r.topping_jenis_mie) toppings.push("Pilihan Jenis Mie");
      if (r.topping_pangsit_basah) toppings.push("Pangsit Basah");
      if (r.topping_pangsit_kering) toppings.push("Pangsit Kering");
      if (r.topping_dimsum) toppings.push("Dimsum");
      if (r.topping_variasi_bumbu) toppings.push("Variasi Bumbu");
      if (r.topping_bawang_daun) toppings.push("Bawang Daun");

      let context = `- [SLUG:${r.slug || r.id}] ${r.outlet_name} (${r.city}): ${r.product_type}, Rp${r.price?.toLocaleString()}, Score: ${r.overall_score?.toFixed(1) || 'N/A'}`;
      
      // Add flavor profile
      context += `, Complexity: ${r.complexity ?? 0}, Sweetness: ${r.sweetness ?? 0}`;
      
      // Add specific scores based on product type
      if (r.product_type === 'kuah') {
        context += `, Kuah(Kekentalan:${r.kuah_kekentalan ?? '-'}, Kaldu:${r.kuah_kaldu ?? '-'}, Keseimbangan:${r.kuah_keseimbangan ?? '-'}, Aroma:${r.kuah_aroma ?? '-'}, Kejernihan:${r.kuah_kejernihan ?? '-'})`;
      } else {
        context += `, Goreng(Minyak:${r.goreng_keseimbangan_minyak ?? '-'}, Bumbu:${r.goreng_bumbu_tumisan ?? '-'}, Aroma:${r.goreng_aroma_tumisan ?? '-'})`;
      }
      
      // Add common scores
      context += `, Mie(Tekstur:${r.mie_tekstur ?? '-'}), Ayam(Bumbu:${r.ayam_bumbu ?? '-'}, Potongan:${r.ayam_potongan ?? '-'})`;
      
      // Add facility scores
      context += `, Fasilitas(Kebersihan:${r.fasilitas_kebersihan ?? '-'}, AlatMakan:${r.fasilitas_alat_makan ?? '-'}, Tempat:${r.fasilitas_tempat ?? '-'})`;
      
      // Add serving time
      if (r.service_durasi) context += `, WaktuSaji:${r.service_durasi}menit`;
      
      // Add toppings
      if (toppings.length > 0) context += `, Topping:[${toppings.join(', ')}]`;
      
      // Add notes
      if (r.notes) context += `, Catatan: ${r.notes.substring(0, 150)}`;
      
      return context;
    }).join("\n") || "Belum ada data review.";

    const systemPrompt = `Kamu adalah asisten AI untuk Mie Ayam Ranger, sebuah direktori review warung mie ayam Indonesia. 

TENTANG SISTEM PENILAIAN (skala 0-10):
- Score Keseluruhan: Nilai total dari semua aspek
- Complexity: -5 (Simple) hingga +5 (Complex) menunjukkan kerumitan rasa
- Sweetness: -5 (Asin) hingga +5 (Manis) menunjukkan tingkat kemanisan

PARAMETER PENILAIAN KUAH:
- Kekentalan: seberapa kental kuahnya (0=encer, 10=sangat kental)
- Kaldu: kualitas kaldu (0=hambar, 10=sangat gurih)
- Keseimbangan: harmoni rasa kuah
- Aroma: wangi kuah
- Kejernihan: kejernihan kuah

PARAMETER PENILAIAN GORENG:
- Keseimbangan Minyak: tidak terlalu berminyak
- Bumbu Tumisan: kualitas bumbu
- Aroma Tumisan: wangi tumisan

PARAMETER UMUM:
- Mie Tekstur: kekenyalan dan tekstur mie (0=lembek, 10=kenyal sempurna)
- Ayam Bumbu: kualitas bumbu ayam
- Ayam Potongan: ukuran dan kualitas potongan ayam

PARAMETER FASILITAS:
- Kebersihan: kebersihan tempat dan penyajian (0=kotor, 10=sangat bersih)
- Alat Makan: kualitas dan kebersihan alat makan
- Tempat: kenyamanan tempat makan

TOPPING YANG TERSEDIA:
Ceker, Bakso, Ekstra Ayam, Ekstra Sawi, Balungan, Tetelan, Mie Jumbo, Pilihan Jenis Mie, Pangsit Basah, Pangsit Kering, Dimsum, Variasi Bumbu, Bawang Daun

DATA REVIEW TERSEDIA:
${reviewsContext}

INSTRUKSI:
1. Bantu user menemukan warung mie ayam sesuai preferensi mereka
2. Berikan rekomendasi berdasarkan data SPESIFIK yang ada
3. Jelaskan MENGAPA kamu merekomendasikan berdasarkan parameter yang ditanya user
4. Gunakan bahasa Indonesia yang ramah dan santai
5. Jika user bertanya di luar topik mie ayam, arahkan kembali dengan sopan
6. Sebutkan score, lokasi, dan karakteristik saat merekomendasikan
7. Jawab dengan singkat dan padat, maksimal 3-4 kalimat per poin
8. SANGAT PENTING: Saat merekomendasikan warung, SELALU sertakan link ke halaman review dengan format markdown: [Lihat Review](/reviews/SLUG_DISINI)
   - Contoh benar: [Lihat Review](/reviews/mie-ayam-pak-saryono)
   - Gunakan SLUG yang ada di data, bukan ID
   - JANGAN gunakan format ID:xxx atau UUID

CONTOH PENGGUNAAN PARAMETER:
- Jika user tanya "mie ayam yang bersih" -> rekomendasikan berdasarkan skor fasilitas_kebersihan tertinggi
- Jika user tanya "kuah yang gurih" -> rekomendasikan berdasarkan skor kuah_kaldu tertinggi
- Jika user tanya "porsi ayam besar" -> rekomendasikan berdasarkan skor ayam_potongan tertinggi
- Jika user tanya "mie yang kenyal" -> rekomendasikan berdasarkan skor mie_tekstur tertinggi
- Jika user tanya "tempat nyaman" -> rekomendasikan berdasarkan skor fasilitas_tempat tertinggi
- Jika user tanya "ada bakso" -> cari yang punya topping bakso
- Jika user tanya "penyajian cepat" -> cari yang service_durasi rendah

Jangan pernah mengaku-ngaku atau membuat data yang tidak ada dalam database.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Silakan coba lagi nanti." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Kredit AI habis. Silakan hubungi admin." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
