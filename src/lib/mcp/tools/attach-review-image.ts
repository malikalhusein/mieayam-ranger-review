import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { notAuth, errText } from "../review-fields";

const MAX = 8 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

export default defineTool({
  name: "attach_review_image",
  title: "Attach a photo to a review (admin)",
  description: "Upload a photo (public image URL or base64) and add it to a review's gallery. Set as_menu=true for a menu photo. Max 8 MB, jpeg/png/webp.",
  inputSchema: {
    slug: z.string().min(1),
    image_url: z.string().url().optional().describe("URL gambar yang bisa diunduh."),
    image_base64: z.string().optional().describe("Isi gambar base64 (tanpa prefix data:)."),
    mime_type: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]).optional().describe("Wajib jika memakai base64."),
    as_menu: z.boolean().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  handler: async ({ slug, image_url, image_base64, mime_type, as_menu }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuth;
    let bytes: Uint8Array; let mime: string;
    if (image_url) {
      const res = await fetch(image_url, { signal: ctx.signal });
      if (!res.ok) return errText(`Gagal unduh gambar: ${res.status}`);
      mime = (res.headers.get("content-type") ?? "").split(";")[0];
      bytes = new Uint8Array(await res.arrayBuffer());
    } else if (image_base64 && mime_type) {
      mime = mime_type;
      bytes = Uint8Array.from(atob(image_base64.replace(/^data:[^,]+,/, "")), (c) => c.charCodeAt(0));
    } else return errText("Berikan image_url, atau image_base64 + mime_type.");
    if (!EXT[mime]) return errText(`Tipe file tidak didukung: ${mime || "unknown"}`);
    if (bytes.byteLength > MAX) return errText("Gambar lebih dari 8 MB.");

    const sb = supabaseForUser(ctx);
    const { data: review, error: rErr } = await sb.from("reviews").select("id, image_url, image_urls").eq("slug", slug).maybeSingle();
    if (rErr) return errText(rErr.message);
    if (!review) return errText(`Review '${slug}' tidak ditemukan.`);

    const path = `${review.id}/${Date.now()}.${EXT[mime]}`;
    const { error: upErr } = await sb.storage.from("review-images").upload(path, bytes, { contentType: mime });
    if (upErr) return errText(`Upload gagal (akun admin?): ${upErr.message}`);
    const publicUrl = sb.storage.from("review-images").getPublicUrl(path).data.publicUrl;

    const patch = as_menu
      ? { menu_image_url: publicUrl }
      : { image_urls: [...(review.image_urls ?? []), publicUrl], image_url: review.image_url ?? publicUrl };
    const { error: uErr } = await sb.from("reviews").update(patch).eq("id", review.id);
    if (uErr) return errText(uErr.message);
    return { content: [{ type: "text", text: `Foto ditambahkan: ${publicUrl}` }], structuredContent: { url: publicUrl } };
  },
});
