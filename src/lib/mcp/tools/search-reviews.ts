import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_reviews",
  title: "Search mie ayam reviews",
  description:
    "Search reviews of mie ayam outlets on Mie Ayam Ranger. Filter by city, product type (kuah/goreng), and minimum overall score. Returns compact list ordered by score.",
  inputSchema: {
    city: z.string().optional().describe("Filter by city (partial, case-insensitive match)."),
    product_type: z
      .enum(["kuah", "goreng"])
      .optional()
      .describe("Filter by product type: kuah (soup) or goreng (fried)."),
    min_score: z.number().min(0).max(10).optional().describe("Minimum overall_score (0-10)."),
    max_price: z.number().int().positive().optional().describe("Maximum price in IDR."),
    limit: z.number().int().min(1).max(50).default(10).describe("Max number of results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ city, product_type, min_score, max_price, limit }, ctx) => {
    let q = supabaseForUser(ctx)
      .from("reviews")
      .select("slug, outlet_name, city, address, product_type, price, overall_score, notes")
      .order("overall_score", { ascending: false })
      .limit(limit);
    if (city) q = q.ilike("city", `%${city}%`);
    if (product_type) q = q.eq("product_type", product_type);
    if (typeof min_score === "number") q = q.gte("overall_score", min_score);
    if (typeof max_price === "number") q = q.lte("price", max_price);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { results: data ?? [] },
    };
  },
});
