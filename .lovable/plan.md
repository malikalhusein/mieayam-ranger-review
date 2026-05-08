## Plan: Set ginanjar@mieayamranger.web.id as admin

User `ginanjar@mieayamranger.web.id` (id: `a7e92988-2cf0-4da2-9bc1-61e900ed747a`) sudah ada di sistem auth tapi belum punya role admin.

### Action
Insert satu baris ke tabel `user_roles`:
- `user_id`: `a7e92988-2cf0-4da2-9bc1-61e900ed747a`
- `role`: `admin`

Setelah itu user bisa login lewat `/login` dan akses panel `/admin`.