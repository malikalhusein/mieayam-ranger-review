import { z } from "zod";

const score = z.number().min(0).max(10);

export const reviewFieldShape = {
  outlet_name: z.string().trim().min(2).max(200).describe("Nama warung/outlet."),
  address: z.string().trim().min(3).max(500).describe("Alamat lengkap."),
  city: z.string().trim().min(2).max(100).describe("Kota."),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Tanggal kunjungan YYYY-MM-DD (default: hari ini)."),
  price: z.number().int().min(1000).max(1000000).describe("Harga dalam Rupiah, minimal 1000 (mis. 12000, bukan 12)."),
  product_type: z.enum(["kuah", "goreng"]).describe("kuah atau goreng."),
  google_map_url: z.string().url().max(2048).optional(),
  mie_tipe: z.string().max(100).optional().describe("Jenis mie, mis. 'mie kecil', 'mie pipih'."),
  mie_tekstur: score.optional(),
  ayam_bumbu: score.optional(),
  ayam_potongan: score.optional(),
  kuah_kekentalan: score.optional().describe("Wajib untuk kuah."),
  kuah_keseimbangan: score.optional().describe("Wajib untuk kuah."),
  kuah_kaldu: score.optional().describe("Wajib untuk kuah."),
  kuah_aroma: score.optional().describe("Wajib untuk kuah."),
  kuah_kejernihan: score.optional().describe("Wajib untuk kuah."),
  goreng_keseimbangan_minyak: score.optional().describe("Wajib untuk goreng."),
  goreng_bumbu_tumisan: score.optional().describe("Wajib untuk goreng."),
  goreng_aroma_tumisan: score.optional().describe("Wajib untuk goreng."),
  fasilitas_kebersihan: score.optional(),
  fasilitas_alat_makan: score.optional(),
  fasilitas_tempat: score.optional(),
  service_durasi: z.number().min(0).max(120).optional().describe("Lama penyajian dalam menit."),
  complexity: z.number().int().min(-5).max(5).optional().describe("Kompleksitas rasa -5..+5."),
  sweetness: z.number().int().min(-5).max(5).optional().describe("Asin(-5) .. manis(+5)."),
  notes: z.string().max(10000).optional().describe("Catatan review (markdown)."),
  toppings: z
    .array(
      z.enum([
        "ceker", "bakso", "ekstra_ayam", "ekstra_sawi", "balungan", "tetelan", "mie_jumbo", "jenis_mie",
        "pangsit_basah", "pangsit_kering", "dimsum", "variasi_bumbu", "bawang_daun", "jamur", "tauge", "acar", "kerupuk",
      ]),
    )
    .optional()
    .describe("Daftar topping yang tersedia."),
};

export const TOPPINGS = [
  "ceker", "bakso", "ekstra_ayam", "ekstra_sawi", "balungan", "tetelan", "mie_jumbo", "jenis_mie",
  "pangsit_basah", "pangsit_kering", "dimsum", "variasi_bumbu", "bawang_daun", "jamur", "tauge", "acar", "kerupuk",
] as const;

const REQUIRED_COMMON = ["mie_tekstur", "ayam_bumbu", "ayam_potongan", "fasilitas_kebersihan", "fasilitas_alat_makan", "fasilitas_tempat"];
const REQUIRED_KUAH = ["kuah_kekentalan", "kuah_keseimbangan", "kuah_kaldu", "kuah_aroma", "kuah_kejernihan"];
const REQUIRED_GORENG = ["goreng_keseimbangan_minyak", "goreng_bumbu_tumisan", "goreng_aroma_tumisan"];

export function missingScoreFields(input: Record<string, unknown>, type: "kuah" | "goreng"): string[] {
  const req = [...REQUIRED_COMMON, ...(type === "kuah" ? REQUIRED_KUAH : REQUIRED_GORENG)];
  return req.filter((k) => typeof input[k] !== "number");
}

/** Convert tool input to a DB row (toppings array -> boolean columns). */
export function toReviewRow(input: Record<string, unknown>, allToppings: boolean) {
  const { toppings, ...rest } = input as { toppings?: string[] } & Record<string, unknown>;
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) if (v !== undefined) row[k] = v;
  if (toppings !== undefined || allToppings) {
    const set = new Set(toppings ?? []);
    for (const t of TOPPINGS) row[`topping_${t}`] = set.has(t);
  }
  return row;
}

export function scoreRpcArgs(r: Record<string, unknown>) {
  const n = (k: string) => (typeof r[k] === "number" ? (r[k] as number) : 0);
  const b = (t: string) => r[`topping_${t}`] === true;
  return {
    p_product_type: String(r.product_type), p_price: n("price"),
    p_mie_tekstur: n("mie_tekstur"), p_ayam_bumbu: n("ayam_bumbu"), p_ayam_potongan: n("ayam_potongan"),
    p_kuah_kekentalan: n("kuah_kekentalan"), p_kuah_keseimbangan: n("kuah_keseimbangan"), p_kuah_kaldu: n("kuah_kaldu"),
    p_kuah_aroma: n("kuah_aroma"), p_kuah_kejernihan: n("kuah_kejernihan"),
    p_goreng_keseimbangan_minyak: n("goreng_keseimbangan_minyak"), p_goreng_bumbu_tumisan: n("goreng_bumbu_tumisan"),
    p_goreng_aroma_tumisan: n("goreng_aroma_tumisan"),
    p_fasilitas_kebersihan: n("fasilitas_kebersihan"), p_fasilitas_alat_makan: n("fasilitas_alat_makan"),
    p_fasilitas_tempat: n("fasilitas_tempat"), p_service_durasi: n("service_durasi"),
    p_topping_ceker: b("ceker"), p_topping_bakso: b("bakso"), p_topping_ekstra_ayam: b("ekstra_ayam"),
    p_topping_ekstra_sawi: b("ekstra_sawi"), p_topping_balungan: b("balungan"), p_topping_tetelan: b("tetelan"),
    p_topping_mie_jumbo: b("mie_jumbo"), p_topping_jenis_mie: b("jenis_mie"), p_topping_pangsit_basah: b("pangsit_basah"),
    p_topping_pangsit_kering: b("pangsit_kering"), p_topping_dimsum: b("dimsum"), p_topping_variasi_bumbu: b("variasi_bumbu"),
    p_topping_bawang_daun: b("bawang_daun"), p_topping_jamur: b("jamur"), p_topping_tauge: b("tauge"),
    p_topping_acar: b("acar"), p_topping_kerupuk: b("kerupuk"),
  };
}

export const SITE_URL = "https://mieayamranger.web.id";
export const reviewLink = (slug: string | null) => (slug ? `${SITE_URL}/reviews/${slug}` : null);

export const notAuth = { content: [{ type: "text" as const, text: "Not authenticated" }], isError: true };
export const errText = (text: string) => ({ content: [{ type: "text" as const, text }], isError: true });

/** Explicit admin check so callers get a clear permission error (RLS still enforces it). */
export async function requireAdmin(sb: { rpc: (fn: "is_admin", args: { _user_id: string }) => PromiseLike<{ data: unknown; error: { message: string } | null }> }, userId: string | undefined) {
  if (!userId) return "Tidak terautentikasi.";
  const { data, error } = await sb.rpc("is_admin", { _user_id: userId });
  if (error) return `Gagal cek izin admin: ${error.message}`;
  return data === true ? null : "Izin ditolak: akun ini bukan admin Mie Ayam Ranger.";
}
