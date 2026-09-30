# Jembatan Hermes Agent ke Mie Ayam Ranger (submit review via Telegram/WhatsApp)

## Jawaban singkat
Bisa. Situs ini sudah punya "pintu" untuk agen AI (server MCP) dengan 5 alat: cari review, lihat review, lihat wishlist, usulkan wishlist, moderasi wishlist. Hermes Agent bisa terhubung ke pintu itu. Yang belum ada: alat untuk **membuat/mengubah review** dan **mengunggah foto**. Itu yang akan ditambahkan.

## Alur yang dituju
```text
Kamu (Telegram / WhatsApp)
      |  "Mie Ayam Pak X, Solo, 12rb, kuah, mie 8, kaldu 7.5, ... + foto"
      v
Hermes Agent (di server kamu)  -- memahami pesan, menanyakan nilai yang kurang
      |  memanggil alat MCP
      v
Mie Ayam Ranger (server MCP)  -- validasi, simpan review, hitung skor v2
      |
      v
Balasan ke chat: skor akhir + link review
```

## Yang akan dibangun di sini
1. **Alat baru `create_review`** — isi semua field review (nama outlet, alamat, kota, tanggal, harga, kuah/goreng, semua nilai rasa & fasilitas, durasi, topping, catatan, link Google Maps). Validasi sama seperti panel admin (harga minimal Rp 1.000, nilai 0–10, field wajib sesuai tipe kuah/goreng). Mengembalikan skor akhir dan link review.
2. **Alat `preview_score`** — hitung skor tanpa menyimpan, agar kamu bisa cek dulu sebelum publish.
3. **Alat `update_review`** — ubah sebagian field review berdasarkan slug (misal koreksi harga).
4. **Alat `attach_review_image`** — terima foto (URL atau base64 dari Hermes), kompres ke WebP, simpan ke penyimpanan foto review, tambahkan ke galeri review.
5. **Alat `get_review_template`** — mengembalikan daftar field + contoh, supaya Hermes tahu apa yang harus ditanyakan.
6. **Akses admin tanpa login browser** — Hermes jalan di server tanpa layar, jadi login OAuth biasa merepotkan. Opsi: kunci akses khusus bot (disimpan aman di backend), hanya berlaku untuk alat admin, bisa dicabut kapan saja. Alat baca tetap publik seperti sekarang.
7. Semua alat tulis tetap dibatasi hanya untuk admin.

## Yang kamu lakukan di server Hermes
1. Publish situs dulu (server MCP baru aktif setelah publish).
2. Di konfigurasi Hermes, tambahkan server MCP dengan URL situs + kunci akses bot.
3. Hubungkan gateway Telegram dan/atau WhatsApp di Hermes (`hermes gateway setup`).
4. Batasi Hermes agar hanya menerima perintah dari nomor/akun Telegram kamu dan kolaborator (allowlist di Hermes).
5. (Opsional) Beri Hermes instruksi/skill: "Kalau user kirim review mie ayam, tanyakan field yang kurang, panggil preview_score, minta konfirmasi, lalu create_review."

Saya akan menyertakan panduan setup langkah demi langkah + contoh konfigurasi Hermes di dokumentasi proyek.

## Catatan teknis
- Tambah tool di `src/lib/mcp/tools/` (create-review, update-review, preview-score, attach-review-image, get-review-template), daftarkan di `src/lib/mcp/index.ts`, deploy ulang function `mcp`.
- Skor dihitung oleh kolom generated `overall_score` (fungsi `calculate_review_overall_score_v2`), jadi tidak ada duplikasi logika; `preview_score` memanggil fungsi RPC yang sama.
- Auth bot: secret `MCP_BOT_TOKEN` (generate), dicek di function `mcp` via header `Authorization: Bearer`; bila cocok, operasi tulis memakai service role dengan audit (log siapa/kapan). Jika token tidak ada, jalur OAuth tetap berlaku (admin via RLS `is_admin`).
- Validasi input dengan Zod, selaras dengan skema di `Admin.tsx`. Slug otomatis via trigger yang sudah ada.
- Upload foto: batas ukuran (mis. 8 MB), tipe image/*, simpan di bucket `review-images`, append ke `image_urls`.
- Dokumentasi: `HERMES_SETUP.md` berisi contoh `config.yaml` Hermes (`mcp_servers`) dan contoh pesan.

## Pertanyaan terbuka (bisa dijawab saat approve)
- Pakai kunci akses bot (disarankan, paling mudah untuk server) atau tetap OAuth?
- Review dari chat langsung tayang, atau disimpan sebagai draft dulu untuk dicek di panel admin?
