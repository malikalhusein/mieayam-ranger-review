# Hermes Agent → Mie Ayam Ranger (review lewat Telegram/WhatsApp)

## Batasan nyata
- Situs publik tetap self-host di https://mieayamranger.web.id. Link review dari tool selalu memakai domain itu.
- Server MCP berjalan di backend Lovable Cloud: `https://kqsqocrtaybbkpigvwjy.supabase.co/functions/v1/mcp`. Versi baru server MCP hanya terpasang lewat tombol Publish di Lovable (tidak memindahkan situs utama).
- Login OAuth bisa membuka halaman persetujuan di alamat preview/hosting Lovable (`.../oauth/consent`), bukan di mieayamranger.web.id, selama domain belum dihubungkan di Project Settings → Domains. Login dengan akun admin di halaman itu.
- Semua operasi tulis ditolak untuk akun non-admin (dicek di tool dan oleh RLS database).

## Konfigurasi Hermes (`~/.hermes/config.yaml`)
```yaml
mcp_servers:
  mieayam:
    url: "https://kqsqocrtaybbkpigvwjy.supabase.co/functions/v1/mcp"
    auth: oauth
```
Gateway: `hermes gateway setup` → Telegram/WhatsApp, wajib isi allowlist pengguna.

## Alur review dari chat (12 tool)
1. `get_review_template` → tanyakan field yang kurang.
2. `preview_score` → tampilkan perkiraan skor.
3. `create_review` dengan `request_id` unik (mis. UUID per review). Hasilnya **draft**, belum tayang. Retry dengan `request_id` sama tidak membuat duplikat.
4. Tampilkan ringkasan, minta persetujuan eksplisit ("ya, publish").
5. `publish_review` (`confirm: true`). Batal → `discard_draft` (hanya bisa menghapus draft, tidak pernah review yang sudah tayang).
6. Koreksi → `update_review`.

## Foto dari Telegram
Hermes menyimpan foto Telegram ke cache lokal dan menyerahkan path file ke agen (perilaku ini perlu kamu cek di versi Hermes-mu). Instruksikan agen: baca file itu, kirim sebagai `image_base64` ke `attach_review_image`.
**Jangan** kirim URL `api.telegram.org/file/bot<TOKEN>/...` — URL itu berisi token bot.
`image_url` hanya untuk gambar https publik; alamat internal/privat ditolak, batas 15 detik dan 8 MB, isi file dicek harus JPEG/PNG/WebP. Jika menyimpan ke review gagal, file yang sudah terunggah dihapus lagi.

## Instruksi untuk Hermes (SOUL.md / skill)
> Review mie ayam dari user: get_review_template → tanyakan field kurang → preview_score → create_review (request_id baru per review, sama saat retry) → tampilkan ringkasan → hanya setelah user bilang setuju panggil publish_review. Foto: baca file lokal, kirim base64 ke attach_review_image. Jangan pernah meneruskan URL file Telegram.

## Tes tanpa menulis data
1. Dari Telegram kirim: "cari mie ayam kuah di Kulon Progo" → harus memanggil `search_reviews` dan membalas daftar.
2. Kirim: "berapa skor kalau kuah 12rb, semua nilai 7?" → `preview_score` (tidak menyimpan).
3. Kirim: "tampilkan template review" → `get_review_template`.
Jika ingin menguji tulis: buat draft lalu langsung `discard_draft` — tidak ada yang tayang.
