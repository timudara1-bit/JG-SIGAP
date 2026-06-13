JG-SIGAP PATCH V4 - LOGIN FAST
==============================

Masalah:
- Login sangat lama.
- Dashboard baru masuk setelah refresh manual.

Root cause utama:
- SecurityService.hashPassword() versi lama memakai 100000 iterasi SHA-256.
- Di Apps Script ini sangat berat, sehingga callback login lama selesai.

File yang direplace:
1. SecurityService.js
2. JS_login.js.html

Langkah setelah replace:
1. clasp push
2. Buka Apps Script Editor.
3. Jalankan fungsi berikut untuk akun testing lama:
   resetUserPasswordFast("email_user_anda", "password_baru");
4. Test login lagi dari URL /exec.

Catatan penting:
- Akun lama yang password_hash-nya dibuat dengan 100000 iterasi perlu reset password.
- Akun baru/register setelah patch otomatis memakai hash cepat.
