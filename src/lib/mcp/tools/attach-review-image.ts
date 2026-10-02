import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import { notAuth, errText, requireAdmin } from "../review-fields";

const MAX = 8 * 1024 * 1024;
const TIMEOUT_MS = 15000;

function sniff(b: Uint8Array): { mime: string; ext: string } | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { mime: "image/png", ext: "png" };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { mime: "image/webp", ext: "webp" };
  return null;
}

function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h.includes(":")) return h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80") || h.startsWith("::ffff:");
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

type DenoDns = { resolveDns?: (h: string, t: "A" | "AAAA") => Promise<string[]> };
async function resolvesPrivate(host: string): Promise<boolean> {
  const deno = (globalThis as { Deno?: DenoDns }).Deno;
  if (!deno?.resolveDns || /^[\d.]+$/.test(host) || host.includes(":")) return false;
  for (const t of ["A", "AAAA"] as const) {
    try { if ((await deno.resolveDns(host, t)).some(isPrivateHost)) return true; } catch { /* no record */ }
  }
  return false;
}

async function download(url: string): Promise<Uint8Array | string> {
  let u: URL;
  try { u = new URL(url); } catch { return "image_url tidak valid."; }
  if (u.protocol !== "https:") return "image_url harus https.";
  if (isPrivateHost(u.hostname) || (await resolvesPrivate(u.hostname))) return "image_url menunjuk ke alamat internal; ditolak.";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(u, { signal: ctrl.signal, redirect: "error" });
    if (!res.ok || !res.body) return `Gagal unduh gambar: HTTP ${res.status}`;
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX) return "Gambar lebih dari 8 MB.";
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = []; let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX) { await reader.cancel(); return "Gambar lebih dari 8 MB."; }
      chunks.push(value);
    }
    const out = new Uint8Array(total); let o = 0;
    for (const c of chunks) { out.set(c, o); o += c.byteLength; }
    return out;
  } catch (e) {
    return (e as Error).name === "AbortError" ? "Unduhan gambar melebihi 15 detik." : `Gagal unduh gambar: ${(e as Error).message}`;
  } finally { clearTimeout(timer); }
}

export default defineTool({
  name: "attach_review_image",
  title: "Attach a photo to a review (admin)",
  description:
    "Add a photo to a review. For Telegram/WhatsApp photos, read the locally saved file and pass it as image_base64 (Telegram file URLs contain the bot token — never pass them). image_url only for public https images. JPEG/PNG/WebP, max 8 MB.",
  inputSchema: {
    slug: z.string().min(1),
    image_base64: z.string().max(12_000_000).optional().describe("Isi file gambar dalam base64 (boleh dengan prefix data:)."),
    image_url: z.string().url().optional().describe("URL https publik. Alamat internal ditolak."),
    as_menu: z.boolean().optional().describe("true = foto menu, bukan galeri."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  handler: async ({ slug, image_url, image_base64, as_menu }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuth;
    const sb = supabaseForUser(ctx);
    const denied = await requireAdmin(sb, ctx.getUserId());
    if (denied) return errText(denied);

    let bytes: Uint8Array;
    if (image_base64) {
      try {
        bytes = Uint8Array.from(atob(image_base64.replace(/^data:[^,]+,/, "").replace(/\s/g, "")), (c) => c.charCodeAt(0));
      } catch { return errText("image_base64 tidak valid."); }
      if (bytes.byteLength > MAX) return errText("Gambar lebih dari 8 MB.");
    } else if (image_url) {
      const r = await download(image_url);
      if (typeof r === "string") return errText(r);
      bytes = r;
    } else return errText("Berikan image_base64 atau image_url.");

    const kind = sniff(bytes);
    if (!kind) return errText("File bukan gambar JPEG/PNG/WebP yang valid.");

    const { data: review, error: rErr } = await sb.from("reviews").select("id, image_url, image_urls").eq("slug", slug).maybeSingle();
    if (rErr) return errText(rErr.message);
    if (!review) return errText(`Review '${slug}' tidak ditemukan.`);

    const path = `${review.id}/${Date.now()}.${kind.ext}`;
    const { error: upErr } = await sb.storage.from("review-images").upload(path, bytes, { contentType: kind.mime });
    if (upErr) return errText(`Upload gagal: ${upErr.message}`);
    const publicUrl = sb.storage.from("review-images").getPublicUrl(path).data.publicUrl;

    const patch = as_menu
      ? { menu_image_url: publicUrl }
      : { image_urls: [...(review.image_urls ?? []), publicUrl], image_url: review.image_url ?? publicUrl };
    const { error: uErr } = await sb.from("reviews").update(patch).eq("id", review.id);
    if (uErr) {
      await sb.storage.from("review-images").remove([path]);
      return errText(`Gagal menyimpan ke review (file dibersihkan): ${uErr.message}`);
    }
    return { content: [{ type: "text", text: `Foto ditambahkan: ${publicUrl}` }], structuredContent: { url: publicUrl } };
  },
});
