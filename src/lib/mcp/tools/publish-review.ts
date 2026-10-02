import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { reviewLink, notAuth, errText, requireAdmin } from "../review-fields";

export default defineTool({
  name: "publish_review",
  title: "Publish a review draft (admin)",
  description: "Make a draft review public. Only call after the user explicitly approved the summary. Requires confirm=true.",
  inputSchema: {
    slug: z.string().min(1),
    confirm: z.literal(true).describe("Harus true, tanda user sudah menyetujui."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuth;
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(sb, ctx.getUserId());
    if (denied) return errText(denied);
    const { data, error } = await sb.from("reviews").update({ is_published: true } as never)
      .eq("slug", slug).select("slug, outlet_name, overall_score").maybeSingle();
    if (error) return errText(error.message);
    if (!data) return errText(`Review '${slug}' tidak ditemukan.`);
    const url = reviewLink(data.slug);
    return {
      content: [{ type: "text", text: `"${data.outlet_name}" sudah tayang. Skor ${Number(data.overall_score).toFixed(2)}/10. ${url}` }],
      structuredContent: { slug: data.slug, url, overall_score: Number(data.overall_score) },
    };
  },
});
