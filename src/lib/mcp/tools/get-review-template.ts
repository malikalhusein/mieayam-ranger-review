import { defineTool } from "@lovable.dev/mcp-js";

const TEMPLATE = `Template review Mie Ayam Ranger (nilai 0-10, boleh desimal):
WAJIB: outlet_name, address, city, price (Rupiah penuh, mis. 12000), product_type (kuah/goreng)
Semua tipe: mie_tekstur, ayam_bumbu, ayam_potongan, fasilitas_kebersihan, fasilitas_alat_makan, fasilitas_tempat
Kuah: kuah_kekentalan, kuah_keseimbangan, kuah_kaldu, kuah_aroma, kuah_kejernihan
Goreng: goreng_keseimbangan_minyak, goreng_bumbu_tumisan, goreng_aroma_tumisan
Opsional: visit_date (YYYY-MM-DD), service_durasi (menit), mie_tipe, google_map_url, complexity (-5..5), sweetness (-5..5), notes, toppings
Topping: ceker, bakso, ekstra_ayam, ekstra_sawi, balungan, tetelan, mie_jumbo, jenis_mie, pangsit_basah, pangsit_kering, dimsum, variasi_bumbu, bawang_daun, jamur, tauge, acar, kerupuk

Alur: kumpulkan nilai -> preview_score -> create_review (draft, request_id unik) -> tampilkan ringkasan -> user setuju -> publish_review. Batal -> discard_draft. Foto chat -> attach_review_image dengan image_base64.

Contoh pesan: "Mie Ayam Pak Kumis, Jl. Slamet Riyadi 10, Solo, 12rb, kuah. Mie 8, bumbu ayam 7.5, potongan 7, kental 7, seimbang 8, kaldu 8, aroma 7.5, jernih 7, bersih 7, alat makan 7, tempat 6. Saji 6 menit. Topping bakso, pangsit kering."`;

export default defineTool({
  name: "get_review_template",
  title: "Get review input template",
  description: "Return the list of review fields, which are required per product type, available toppings, and an example message.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({ content: [{ type: "text", text: TEMPLATE }] }),
});
