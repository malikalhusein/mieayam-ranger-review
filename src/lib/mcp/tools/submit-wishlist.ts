import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "submit_wishlist",
  title: "Submit a mie ayam outlet to the wishlist",
  description:
    "Submit a new mie ayam outlet recommendation to the wishlist. Entry starts with status 'pending' and needs admin approval before appearing publicly.",
  inputSchema: {
    place_name: z.string().min(1).describe("Name of the mie ayam outlet."),
    location: z.string().min(1).describe("City / address / area of the outlet."),
    notes: z.string().optional().describe("Why this outlet is worth reviewing (optional)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ place_name, location, notes }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("wishlist_entries")
      .insert({ place_name, location, notes: notes ?? null, status: "pending" })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Wishlist entry submitted (pending review). ID: ${data.id}` }],
      structuredContent: { entry: data },
    };
  },
});
