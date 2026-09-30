import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { reviewFieldShape, toReviewRow, scoreRpcArgs, missingScoreFields, notAuth, errText } from "../review-fields";

const { outlet_name, address, city, ...scoreShape } = reviewFieldShape;
void outlet_name; void address; void city;

export default defineTool({
  name: "preview_score",
  title: "Preview review score",
  description: "Calculate the Scoring v2 overall score for review inputs without saving anything. Use before create_review to confirm with the user.",
  inputSchema: scoreShape,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuth;
    const row = toReviewRow(input, true);
    const missing = missingScoreFields(row, input.product_type);
    const { data, error } = await supabaseForUser(ctx).rpc("calculate_review_overall_score_v2", scoreRpcArgs(row));
    if (error) return errText(error.message);
    const score = Math.round(Number(data) * 100) / 100;
    const warn = missing.length ? ` Nilai belum lengkap (dihitung 0): ${missing.join(", ")}.` : "";
    return {
      content: [{ type: "text", text: `Perkiraan skor akhir: ${score}/10.${warn}` }],
      structuredContent: { score, missing_fields: missing },
    };
  },
});
