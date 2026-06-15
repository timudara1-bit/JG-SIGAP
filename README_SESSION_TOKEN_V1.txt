JG-SIGAP SESSION TOKEN V1 PATCH

Tujuan:
- Memperbaiki session agar multi user beda akun bisa login bersamaan di perangkat berbeda.
- Tidak memakai PropertiesService untuk session aplikasi.
- Token disimpan di localStorage browser dan tabel 94_T_USER_SESSION.

File yang diganti:
- SessionService.js
- AuthService.js
- Router.js
- PageService.js
- JS_login.js.html
- JS_app.js.html
- RoleMenuService.js
- Code.js
- Kode.js

Langkah:
1. Replace file di project lokal.
2. Pastikan header 94_T_USER_SESSION minimal punya:
   session_id | user_id | token | login_time | logout_time | expired_at | device_info | role_code | status
   Jika belum lengkap, SessionService.ensureSessionColumns_() akan menambah kolom saat login.
3. clasp push
4. Deploy versi baru.
5. Test:
   - Browser A login akun 1
   - Browser/incognito/device B login akun 2
   - Keduanya harus aktif bersamaan.
6. Jika masih diarahkan ke login, clear localStorage:
   localStorage.removeItem("JG_SIGAP_TOKEN")
   localStorage.removeItem("JG_SIGAP_USER")
   localStorage.removeItem("JG_SIGAP_ROLE")

Catatan penting:
- doGet tidak lagi validasi SessionService.getSession() karena server tidak bisa membaca localStorage.
- Validasi session dilakukan oleh JS_app.js.html setelah halaman dashboard/shell terbuka.
