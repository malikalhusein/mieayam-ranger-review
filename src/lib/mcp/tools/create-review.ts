import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";
import { reviewFieldShape, toReviewRow, missingScoreFields, reviewLink, notAuth, errText } from "../review-fields";

export default defineTool({
  name: "create_review",
  title: "Create a mie ayam review (admin)",
  description: "Publish a new mie ayam review. Admin only. All flavor/facility scores for the chosen product type are required. Returns the final score and review link.",
  inputSchema: reviewFieldShape,
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuth;
    const row = toReviewRow(input, true);
    const missing = missingScoreFields(row, input.product_type);
    if (missing.length) return errText(`Nilai wajib belum diisi: ${missing.join(", ")}. Tanyakan ke user lalu coba lagi.`);
    if (!row.visit_date) row.visit_date = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabaseForUser(ctx)
      .from("reviews")
      .insert(row as never)
      .select("id, slug, outlet_name, overall_score")
      .single();
    if (error) return errText(`Gagal menyimpan (pastikan akun admin): ${error.message}`);
    const link = reviewLink(data.slug);
    return {
      content: [{ type: "text", text: `Review "${data.outlet_name}" tersimpan. Skor: ${Number(data.overall_score).toFixed(2)}/10. Slug: ${data.slug}. ${link ?? ""}` }],
      structuredContent: { id: data.id, slug: data.slug, overall_score: Number(data.overall_score), url: link },
    };
  },
});
