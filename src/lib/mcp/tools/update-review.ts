import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { reviewFieldShape, toReviewRow, reviewLink, notAuth, errText } from "../review-fields";

const partial = Object.fromEntries(
  Object.entries(reviewFieldShape).map(([k, v]) => [k, (v as z.ZodTypeAny).optional()]),
) as { [K in keyof typeof reviewFieldShape]: z.ZodOptional<(typeof reviewFieldShape)[K]> };

export default defineTool({
  name: "update_review",
  title: "Update a review (admin)",
  description: "Update selected fields of an existing review by slug. Only provided fields change. If toppings is given it replaces the whole topping list.",
  inputSchema: { slug: z.string().min(1).describe("Slug review."), ...partial },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug, ...fields }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuth;
    const row = toReviewRow(fields, false);
    if (!Object.keys(row).length) return errText("Tidak ada field yang diubah.");
    const { data, error } = await supabaseForUser(ctx)
      .from("reviews").update(row as never).eq("slug", slug)
      .select("id, slug, outlet_name, overall_score").maybeSingle();
    if (error) return errText(error.message);
    if (!data) return errText(`Review '${slug}' tidak ditemukan atau akun bukan admin.`);
    return {
      content: [{ type: "text", text: `Review "${data.outlet_name}" diperbarui. Skor sekarang: ${Number(data.overall_score).toFixed(2)}/10.` }],
      structuredContent: { id: data.id, slug: data.slug, overall_score: Number(data.overall_score), url: reviewLink(data.slug) },
    };
  },
});
