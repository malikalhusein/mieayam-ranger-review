import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
  'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating enhanced sitemap...');

    // Fetch all reviews with slugs and additional data for priority calculation
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('slug, updated_at, created_at, overall_score, view_count, editor_choice')
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    console.log(`Found ${reviews?.length || 0} reviews`);

    const baseUrl = 'https://mieayamranger.web.id';
    const today = new Date().toISOString().split('T')[0];

    // Calculate priority based on score and views
    const calculatePriority = (review: any): string => {
      let priority = 0.6;
      
      // Editor's choice gets highest priority
      if (review.editor_choice) {
        priority = 0.9;
      } else {
        // High score reviews get higher priority
        if (review.overall_score >= 8.5) priority = 0.85;
        else if (review.overall_score >= 7.5) priority = 0.8;
        else if (review.overall_score >= 6.5) priority = 0.75;
        else priority = 0.7;
        
        // Popular reviews get slight boost
        if (review.view_count > 100) priority = Math.min(0.9, priority + 0.05);
      }
      
      return priority.toFixed(1);
    };

    // Build sitemap XML with enhanced metadata
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${baseUrl}/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/compare</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/wishlist</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/donation</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

    // Add review URLs with calculated priority
    for (const review of reviews || []) {
      const lastmod = review.updated_at 
        ? new Date(review.updated_at).toISOString().split('T')[0] 
        : today;
      
      const priority = calculatePriority(review);
      
      // Determine changefreq based on how recent the review is
      const daysSinceUpdate = review.updated_at 
        ? Math.floor((Date.now() - new Date(review.updated_at).getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      
      const changefreq = daysSinceUpdate < 7 ? 'daily' 
        : daysSinceUpdate < 30 ? 'weekly' 
        : 'monthly';
      
      sitemap += `
  <url>
    <loc>${baseUrl}/reviews/${review.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }

    sitemap += `
</urlset>`;

    console.log('Enhanced sitemap generated successfully');

    return new Response(sitemap, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mieayamranger.web.id/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { headers: corsHeaders }
    );
  }
});
