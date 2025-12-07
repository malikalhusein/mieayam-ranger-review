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

    // Fetch reviews data for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: reviews, error: dbError } = await supabase
      .from("reviews")
      .select("id, outlet_name, address, city, product_type, price, overall_score, notes, complexity, sweetness")
      .order("overall_score", { ascending: false })
      .limit(50);

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Build context from reviews with IDs for linking
    const reviewsContext = reviews?.map((r) => 
      `- [ID:${r.id}] ${r.outlet_name} (${r.city}): ${r.product_type}, Rp${r.price?.toLocaleString()}, Score: ${r.overall_score?.toFixed(1) || 'N/A'}, Complexity: ${r.complexity || 0}, Sweetness: ${r.sweetness || 0}${r.notes ? `, Notes: ${r.notes.substring(0, 100)}` : ''}`
    ).join("\n") || "Belum ada data review.";

    const systemPrompt = `Kamu adalah asisten AI untuk Mie Ayam Ranger, sebuah direktori review warung mie ayam Indonesia. 

TENTANG SISTEM PENILAIAN:
- Score menggunakan skala 0-10
- Complexity: -5 (Simple) hingga +5 (Complex) menunjukkan kerumitan rasa
- Sweetness: -5 (Salty) hingga +5 (Sweet) menunjukkan tingkat kemanisan

DATA REVIEW TERSEDIA:
${reviewsContext}

INSTRUKSI:
1. Bantu user menemukan warung mie ayam sesuai preferensi mereka
2. Berikan rekomendasi berdasarkan data yang ada
3. Jelaskan mengapa kamu merekomendasikan tempat tersebut
4. Gunakan bahasa Indonesia yang ramah dan santai
5. Jika user bertanya di luar topik mie ayam, arahkan kembali dengan sopan
6. Sebutkan score, lokasi, dan karakteristik rasa saat merekomendasikan
7. Jawab dengan singkat dan padat, maksimal 3-4 kalimat per poin
8. SANGAT PENTING: Saat merekomendasikan warung, SELALU sertakan link ke halaman review dengan format markdown: [Lihat Review](/review/ID_DISINI)
   - Contoh benar: [Lihat Review](/review/860970bc-d8e4-4a36-a965-b4142f83e400)
   - JANGAN gunakan format ID:xxx, gunakan langsung path /review/xxx

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
