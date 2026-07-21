
## Konteks

File `.md` yang di-upload berisi hasil investigasi sesi sebelumnya (RTK-Caveman) tentang bug scoring Mie Ayam Ranger. Saya sudah verifikasi bahwa **bug-bug tersebut masih ada di codebase saat ini**:

1. **DB `overall_score` generated column salah formula** (`supabase/migrations/20251115175626_...sql`) — hanya memakai field `kuah_*`, tidak ada `goreng_*`. Akibatnya semua review `product_type='goreng'` selalu dapat skor 0 atau ngaco.
2. **`src/lib/scoring.ts` membagi hasil dengan 10 lagi** (`finalScore100 / 10`) padahal `baseScore + timeScore` sudah di skala 0–10. Skor jadi ~10× lebih kecil.
3. **`supabase/functions/generate-scorecard/index.ts` punya bug yang sama** (`finalScore100 / 10`) → scorecard image tidak konsisten dengan tampilan.
4. **Perceptual mapping** — Home & ReviewDetail sudah render, tapi karena `overall_score` goreng = 0/null, banyak flow yang skip data goreng. Perlu dipastikan tampil selama `complexity` atau `sweetness` ada (bukan bergantung ke skor).
5. Beberapa kolom skor kemungkinan masih `INTEGER` sehingga tidak bisa nyimpen desimal dari form admin.

Soal "push ke GitHub": tidak perlu langkah manual — Lovable auto-sync ke repo GitHub yang terhubung tiap kali file berubah. Setelah plan ini di-approve dan di-execute, commit langsung muncul di GitHub.

## Perubahan

### 1. `src/lib/scoring.ts`
- Hapus pembagian `/10`. Formula baru:
  ```
  finalScore10 = clamp((baseScore + timeScore + toppingBonus) * valueFactor, 0, 10)
  finalScore100 = finalScore10 * 10
  ```
- Formula RASA per `product_type` sudah benar, biarkan.
- `complexity` & `sweetness` tetap hanya metadata (tidak dipakai di skor).

### 2. `supabase/functions/generate-scorecard/index.ts`
- Samakan `calculateScore` internal dengan `src/lib/scoring.ts` (tanpa `/10`, ikutkan `toppingBonus`, cabang `kuah`/`goreng`).
- Prefer `overall_score` dari DB kalau ada, fallback ke hasil hitung.
- Deploy ulang function.

### 3. Migration baru — `supabase/migrations/<timestamp>_fix_goreng_overall_score.sql`
Aman, non-destruktif (tanpa DROP TABLE/TRUNCATE/DELETE):
- `DROP COLUMN IF EXISTS overall_score`.
- `ALTER COLUMN ... TYPE NUMERIC` untuk semua kolom skor (`mie_tekstur`, `ayam_*`, `kuah_*`, `goreng_*`, `fasilitas_*`, `service_durasi`) supaya nerima desimal.
- Recreate CHECK constraint 0–10 untuk field skor.
- Recreate `overall_score` sebagai `GENERATED ALWAYS AS ... STORED` dengan formula:
  ```
  rasa = CASE product_type
    WHEN 'kuah'   THEN (mie_tekstur + ayam_bumbu + ayam_potongan
                        + kuah_kekentalan + kuah_keseimbangan
                        + kuah_kaldu + kuah_aroma + kuah_kejernihan) / 8
    WHEN 'goreng' THEN (mie_tekstur + ayam_bumbu + ayam_potongan
                        + goreng_keseimbangan_minyak
                        + goreng_bumbu_tumisan
                        + goreng_aroma_tumisan) / 6
  END
  fasilitas = (fasilitas_kebersihan + fasilitas_alat_makan + fasilitas_tempat) / 3
  base = rasa * 0.8 + fasilitas * 0.2
  time_score = CASE WHEN service_durasi <= 8 THEN (8 - service_durasi) * 1.5
                    ELSE (8 - service_durasi) * 2 END
  topping_bonus = jumlah topping true * 0.5
  value_factor = LEAST(1.15, GREATEST(0.85, 17000.0 / price))
  overall_score = LEAST(10, GREATEST(0, (base + time_score + topping_bonus) * value_factor))
  ```
- Semua `COALESCE(..., 0)` supaya null-safe.

### 4. `src/pages/Home.tsx` & `src/pages/ReviewDetail.tsx`
- Perceptual mapping: tampilkan selama `complexity != null || sweetness != null` (default nilai kosong ke 0). Tidak boleh disembunyikan karena skor 0.
- Pastikan payload ke `calculateScore()` membawa field `goreng_*` + semua topping baru + `service_durasi`.

### 5. `src/pages/Admin.tsx`
- Payload `handleCreate` & `handleUpdate` sudah kirim `goreng_*`, tapi verifikasi ulang bahwa `complexity`/`sweetness` dan semua 17 topping ikut disimpan (termasuk `jamur`, `tauge`, `acar`, `kerupuk`).
- Preview skor pakai `calculateScore()` versi baru (otomatis setelah perbaikan #1).

### 6. Validasi
- `bun run build` harus lulus (typecheck + build).
- Manual test lewat admin: buat review `goreng` dengan semua skor 8, harga 17.000, durasi 8 → `overall_score` DB harus 8.0.
- Regresi `kuah` dengan input sama → 8.0.
- Review dengan `complexity=2, sweetness=-1` muncul di perceptual map Home & ReviewDetail.
- Cek `/functions/v1/generate-scorecard` menghasilkan skor sama.

## Yang TIDAK diubah
- MCP/OAuth route `/.lovable/oauth/consent`.
- PWA service worker & manifest.
- Data existing (migration hanya rebuild generated column & tipe kolom, tidak menghapus baris).
- File `src/integrations/supabase/*` auto-generated.

## Catatan GitHub
Tidak ada langkah `git push` manual — repo GitHub yang terhubung ke project ini auto-sync tiap file berubah dari sisi Lovable.
