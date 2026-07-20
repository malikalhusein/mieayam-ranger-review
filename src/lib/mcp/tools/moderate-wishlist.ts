import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "moderate_wishlist",
  title: "Approve or reject a wishlist entry (admin)",
  description:
    "Set the status of a wishlist entry to 'approved' or 'rejected'. Requires admin privileges; RLS will reject non-admin callers.",
  inputSchema: {
    id: z.string().uuid().describe("Wishlist entry ID."),
    status: z.enum(["approved", "rejected"]).describe("New status."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("wishlist_entries")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Wishlist entry ${id} set to '${status}'.` }],
      structuredContent: { entry: data },
    };
  },
});
