JG-SIGAP PATCH V3 LOGIN
=======================

Masalah:
- Logout sudah normal.
- Login sukses membuat session, tetapi halaman tidak langsung pindah ke dashboard.
- Penyebab paling mungkin: JS_login masih melakukan nested google.script.run.getAppUrl() setelah login, sehingga redirect tertahan.

Perbaikan:
- Replace file JS_login.js.html dengan file ini.
- Setelah loginUser() success, browser langsung redirect ke URL web app yang sama: ?page=dashboard&t=timestamp.
- Timestamp dipakai agar browser tidak memakai cache lama.

Langkah:
1. Backup JS_login.js.html lama.
2. Replace dengan file patch ini.
3. Jalankan clasp push.
4. Deploy ulang web app bila perlu.
5. Test dari URL /exec, bukan /dev jika ingin test production.
