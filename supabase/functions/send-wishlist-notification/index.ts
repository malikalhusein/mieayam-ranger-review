import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WishlistNotificationRequest {
  place_name: string;
  location: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-wishlist-notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { place_name, location }: WishlistNotificationRequest = await req.json();

    console.log(`Sending approval notification for: ${place_name} at ${location}`);

    // Send email using Resend REST API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mie Ayam Ranger <onboarding@resend.dev>",
        to: ["Halo@mieayamranger.web.id"],
        subject: `Wishlist Approved: ${place_name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
              .highlight { background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍜 Wishlist Entry Approved!</h1>
              </div>
              <div class="content">
                <p>A new wishlist entry has been approved and is now visible on the public wishlist page.</p>
                
                <div class="highlight">
                  <p><strong>Place Name:</strong> ${place_name}</p>
                  <p><strong>Location:</strong> ${location}</p>
                </div>
                
                <p>This recommendation is now part of the community wishlist for places to review!</p>
                
                <p>Best regards,<br>Mie Ayam Ranger Team</p>
              </div>
              <div class="footer">
                <p>Mie Ayam Ranger - Panduan Mie Ayam Terpercaya</p>
                <p>Daerah Istimewa Yogyakarta</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-wishlist-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
