JG-SIGAP FRAMEWORK CLEAN V5

Tujuan:
- Membersihkan struktur lama yang tumpang tindih.
- Semua route masuk lewat Index.html.
- Login/Register dimuat sebagai public partial.
- Dashboard dan page internal dimuat via getPage(page, token).
- Session pakai token per browser/perangkat di 94_T_USER_SESSION.
- URL DEV/EXEC terpusat di Config.js.
- Tidak memakai window.top, iframe docs.google.com, atau hardcode URL di banyak page.

File lama yang TIDAK dibutuhkan dan sebaiknya dihapus dari project Apps Script jika masih ada:
- Dummy.js
- AuthService_patch_instruction.txt
- README_PATCH_*.txt
- README_SESSION_*.txt
- README_FRAMEWORK_*.txt
- README_UPDATE_DATABASE_V2.txt
- README_URL_CONFIG_PATCH.txt
- .clasp.old.json
- Semua folder editor/config seperti .vscode, .cursor, .gemini, .codex, .zed, config

File legacy yang dikosongkan:
- Kode.js

File penting yang di-update:
- Config.js
- Router.js
- Index.html
- JS_core.js.html
- JS_app.js.html
- JS_login.js.html
- Page_Login.html
- PageService.js
- Code.js
- Kode.js

Cara pakai:
1. Backup project lokal.
2. Extract ZIP ini ke folder project JG-SIGAP dan replace semua file.
3. Hapus file lama yang tidak dibutuhkan sesuai daftar di atas.
4. Jalankan:
   clasp push
5. Buka:
   https://script.google.com/macros/s/AKfycbwjQmDqckJvpbZHf6JUd_9MibJ5OM71F_571h92mz8/dev?page=login

Catatan:
- Selama development CONFIG.APP.USE_DEV = true.
- Untuk production ubah CONFIG.APP.USE_DEV = false.
