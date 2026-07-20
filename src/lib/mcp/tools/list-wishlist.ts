import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_wishlist",
  title: "List wishlist entries",
  description:
    "List community-submitted wishlist entries (mie ayam outlets pending review). Filter by status. Pending/rejected entries require admin privileges via RLS.",
  inputSchema: {
    status: z
      .enum(["pending", "approved", "rejected"])
      .default("approved")
      .describe("Wishlist status filter."),
    limit: z.number().int().min(1).max(50).default(20),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("wishlist_entries")
      .select("id, place_name, location, notes, status, created_at")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { entries: data ?? [] },
    };
  },
});
