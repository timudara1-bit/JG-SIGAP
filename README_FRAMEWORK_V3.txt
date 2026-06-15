JG-SIGAP FRAMEWORK V3 PATCH

Tujuan:
1. Satu sumber konfigurasi URL aplikasi di CONFIG.APP.
2. Satu frontend core: JS_core.js.html.
3. Login tidak lagi tergantung window.top atau URL iframe googleusercontent.
4. Token dikirim via URL saat redirect pertama lalu disimpan ulang ke localStorage pada origin halaman dashboard.
5. JS_app hanya punya satu bootloader DOMContentLoaded.
6. Router menjadi thin router: hanya render login/register/index dan mengirim initialData + appConfig.

File yang direplace:
- Config.js
- Router.js
- Index.html
- Page_Login.html
- JS_core.js.html (file baru)
- JS_login.js.html
- JS_app.js.html
- AuthService.js
- SessionService.js
- Code.js
- Kode.js

Langkah pakai:
1. Extract ZIP ini.
2. Copy/replace semua file ke folder project JG-SIGAP.
3. Jalankan: clasp push
4. Buka: /dev?page=login
5. Clear localStorage jika perlu.
6. Login.

Catatan penting:
- Untuk DEV, ubah hanya CONFIG.APP.DEV_URL di Config.js.
- Untuk PROD, ubah CONFIG.APP.ENV = "PROD" dan pastikan EXEC_URL benar.
- Jangan pakai window.top.location.replace lagi.
- Jangan hardcode URL di page lain.
