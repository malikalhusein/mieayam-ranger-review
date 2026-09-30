# Hermes Agent → Mie Ayam Ranger (submit review via Telegram/WhatsApp)

## 1. Publish situs
Server MCP baru aktif setelah app di-publish. URL server:
`https://kqsqocrtaybbkpigvwjy.supabase.co/functions/v1/mcp`

## 2. Tambahkan server MCP di Hermes (`~/.hermes/config.yaml`)
```yaml
mcp_servers:
  mieayam:
    url: "https://kqsqocrtaybbkpigvwjy.supabase.co/functions/v1/mcp"
    auth: oauth
```
Jalankan `hermes` sekali; browser/URL login akan muncul. Login dengan **akun admin** Mie Ayam Ranger lalu klik Approve. Token tersimpan dan diperbarui otomatis oleh Hermes.
(Jika Hermes jalan di server tanpa layar: buka URL login yang dicetak di terminal dari laptop kamu.)

## 3. Hubungkan Telegram / WhatsApp
`hermes gateway setup` → pilih Telegram (token dari @BotFather) dan/atau WhatsApp.
Wajib isi allowlist user (ID Telegram / nomor WA kamu & kolaborator) supaya orang lain tidak bisa memakai bot.

## 4. Instruksi untuk Hermes (opsional, taruh di SOUL.md / skill)
> Jika user mengirim review mie ayam: panggil `get_review_template`, tanyakan nilai yang kurang, panggil `preview_score`, tampilkan skor & minta konfirmasi, lalu `create_review`. Foto yang dikirim → `attach_review_image`. Koreksi → `update_review`.

## Alat yang tersedia
| Alat | Fungsi |
|---|---|
| get_review_template | Daftar field + contoh pesan |
| preview_score | Hitung skor tanpa menyimpan |
| create_review | Simpan review baru (admin) |
| update_review | Ubah field review per slug (admin) |
| attach_review_image | Tambah foto galeri / menu (admin, maks 8 MB) |
| search_reviews, get_review | Cari & lihat review |
| list_wishlist, submit_wishlist, moderate_wishlist | Wishlist |

## Contoh pesan
"Mie Ayam Pak Kumis, Jl. Slamet Riyadi 10, Solo, 12rb, kuah. Mie 8, bumbu ayam 7.5, potongan 7, kental 7, seimbang 8, kaldu 8, aroma 7.5, jernih 7, bersih 7, alat makan 7, tempat 6. Saji 6 menit. Topping bakso, pangsit kering."
