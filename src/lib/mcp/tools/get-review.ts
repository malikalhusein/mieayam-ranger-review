import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_review",
  title: "Get review detail by slug",
  description:
    "Fetch full review detail for a single mie ayam outlet by its URL slug, including all scoring parameters (kuah, goreng, mie, ayam, fasilitas, service) and toppings.",
  inputSchema: {
    slug: z.string().min(1).describe("The review URL slug, e.g. 'mie-ayam-pak-saryono'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("reviews")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No review found for slug '${slug}'.` }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { review: data },
    };
  },
});
