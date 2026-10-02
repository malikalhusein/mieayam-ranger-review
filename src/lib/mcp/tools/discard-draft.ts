import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { notAuth, errText, requireAdmin } from "../review-fields";

export default defineTool({
  name: "discard_draft",
  title: "Discard an unpublished draft (admin)",
  description: "Delete a review draft that was never published, plus its uploaded photos. Published reviews are never deleted by this tool.",
  inputSchema: { slug: z.string().min(1) },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuth;
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(sb, ctx.getUserId());
    if (denied) return errText(denied);
    const { data: review } = await sb.from("reviews").select("id, is_published").eq("slug", slug).maybeSingle();
    if (!review) return errText(`Review '${slug}' tidak ditemukan.`);
    if (review.is_published) return errText("Ditolak: review ini sudah tayang. discard_draft hanya untuk draft.");
    const { data: files } = await sb.storage.from("review-images").list(review.id);
    if (files?.length) await sb.storage.from("review-images").remove(files.map((f) => `${review.id}/${f.name}`));
    const { error } = await sb.from("reviews").delete().eq("id", review.id).eq("is_published", false);
    if (error) return errText(error.message);
    return { content: [{ type: "text", text: `Draft '${slug}' dibatalkan dan dihapus.` }] };
  },
});
