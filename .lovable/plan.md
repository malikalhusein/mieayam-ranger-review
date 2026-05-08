## Analisis Bug Score "Mie Ayam & Bakso Bismillah"

**Hasil pengecekan database** (id `d5329a92...`):
- `price`: **10** ⚠️ (seharusnya `10000`)
- Semua skor rasa & fasilitas terisi normal (8–10)
- `service_durasi`: 3
- `overall_score`: **0**

### Penyebab utama
Kolom `overall_score` adalah kolom *generated* PostgreSQL dengan rumus:
```
divisor = price * 0.85 + (service_durasi - 8) * 100
IF divisor <= 0 THEN score = 0
```

Karena admin mengetik harga **`10`** (bukan `10000`), divisor menjadi:
`10 × 0.85 + (3 − 8) × 100 = 8,5 − 500 = −491,5` → kondisi `<= 0` terpicu → **score otomatis dipaksa jadi 0**.

Jadi error bukan di logika scoring, melainkan **input harga keliru** (kemungkinan admin mengetik dalam satuan ribuan, "10" = "10rb"). Tidak ada validasi minimum di form admin yang menangkap ini.

### Rencana perbaikan

**1. Perbaiki data entry yang sudah ada**
- Update record Bismillah: `price = 10000` agar `overall_score` ter-regenerate otomatis (kolom generated, langsung ikut update).

**2. Tambahkan validasi harga di form admin** (`src/pages/Admin.tsx`)
- Set `min={1000}` pada input price.
- Tambah validasi sebelum submit: jika `price < 1000`, tolak dengan toast "Harga minimal Rp 1.000 — pastikan input dalam Rupiah penuh, bukan ribuan".
- Tampilkan helper text di bawah field: *"Masukkan harga dalam Rupiah penuh (contoh: 12000, bukan 12)"*.

**3. Safety net di formula DB** (opsional, via migration)
- Ubah guard rumus dari `divisor <= 0` menjadi `price < 1000 OR divisor <= 0` agar entry dengan harga tidak masuk akal langsung terlihat sebagai data invalid (tetap 0), dan tambahkan `CHECK (price >= 1000)` constraint pada tabel `reviews` agar input ngawur ditolak di level database.

---

## Perbaikan Favicon

**Kondisi sekarang** (`index.html`):
```html
<link rel="icon" href="data:image/svg+xml,<svg ...chef-knife icon...>" />
```
- Pakai inline SVG data URI generic (ikon pisau koki), bukan brand Mie Ayam Ranger.
- File `public/favicon.ico` ada (7.6 KB) tapi tidak direferensikan → browser fallback ke `/favicon.ico` request default, namun karena `<link rel="icon">` sudah didefinisikan via data URI, beberapa browser (terutama Safari & saat di-share di sosmed) tidak menampilkan favicon dengan benar.
- File PNG di `public/icons/` ada lengkap (72–512), tapi tidak ada referensi `<link rel="icon" type="image/png">` di `<head>`.

### Rencana perbaikan favicon
Update `index.html` `<head>`:
- Hapus `<link rel="icon" href="data:image/svg+xml,...">`.
- Tambahkan referensi yang benar:
  ```html
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-72x72.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
  ```
- Pertahankan `apple-touch-icon` yang sudah ada.

Ini memastikan favicon brand muncul di tab browser, bookmark, PWA install, dan iOS home screen.

---

## Ringkasan file yang akan diubah
1. **DB update** (langsung via insert/migration) — fix harga record Bismillah jadi 10000.
2. **`src/pages/Admin.tsx`** — validasi harga minimum + helper text.
3. **Migration baru** (opsional tapi disarankan) — `CHECK (price >= 1000)` constraint.
4. **`index.html`** — replace block favicon link.

Setuju dijalankan?
