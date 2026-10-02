import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { reviewFieldShape, toReviewRow, missingScoreFields, reviewLink, notAuth, errText, requireAdmin } from "../review-fields";

export default defineTool({
  name: "create_review",
  title: "Create a review draft (admin)",
  description:
    "Save a new mie ayam review as an unpublished DRAFT. Admin only. Pass a unique request_id per review so retries never create duplicates. Show the returned summary to the user and call publish_review only after explicit approval.",
  inputSchema: {
    request_id: z.string().trim().min(8).max(100).describe("ID unik per review (mis. UUID). Ulangi nilai yang sama saat retry."),
    ...reviewFieldShape,
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ request_id, ...input }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuth;
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(sb, ctx.getUserId());
    if (denied) return errText(denied);

    const { data: existing } = await sb
      .from("reviews").select("id, slug, outlet_name, overall_score, is_published")
      .eq("client_request_id", request_id).maybeSingle();
    if (existing) {
      return {
        content: [{ type: "text", text: `Request ini sudah pernah disimpan: "${existing.outlet_name}" (slug ${existing.slug}, ${existing.is_published ? "sudah tayang" : "draft"}, skor ${Number(existing.overall_score).toFixed(2)}). Tidak dibuat ulang.` }],
        structuredContent: { id: existing.id, slug: existing.slug, overall_score: Number(existing.overall_score), is_published: existing.is_published, duplicate: true },
      };
    }

    const row = toReviewRow(input, true);
    const missing = missingScoreFields(row, input.product_type);
    if (missing.length) return errText(`Field wajib belum diisi: ${missing.join(", ")}. Tanyakan ke user lalu coba lagi.`);
    if (!row.visit_date) row.visit_date = new Date().toISOString().slice(0, 10);
    row.is_published = false;
    row.client_request_id = request_id;

    const { data, error } = await sb.from("reviews").insert(row as never)
      .select("id, slug, outlet_name, city, price, product_type, overall_score").single();
    if (error) return errText(`Gagal menyimpan draft: ${error.message}${error.details ? ` (${error.details})` : ""}`);
    const summary = `DRAFT tersimpan (belum tayang): "${data.outlet_name}", ${data.city}, Rp${data.price}, ${data.product_type}. Skor: ${Number(data.overall_score).toFixed(2)}/10. Slug: ${data.slug}. Minta persetujuan user, lalu panggil publish_review dengan slug ini; atau discard_draft untuk membatalkan.`;
    return {
      content: [{ type: "text", text: summary }],
      structuredContent: { id: data.id, slug: data.slug, overall_score: Number(data.overall_score), is_published: false, preview_url: reviewLink(data.slug) },
    };
  },
});
