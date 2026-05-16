Buat akun admin baru `lycho.daves@gmail.com` dengan password `sijitekansepuluh`.

## Langkah

1. Update edge function `create-admin-batch/index.ts` — ganti accounts list dengan satu entry `{ email: "lycho.daves@gmail.com", password: "sijitekansepuluh" }`.
2. Deploy edge function.
3. Invoke function → membuat user di auth (email auto-confirmed) + insert row `user_roles` dengan role `admin`.
4. Verifikasi via query `SELECT` ke `auth.users` + `user_roles`.

Setelah selesai, user bisa login di `/login` lalu akses `/admin`.