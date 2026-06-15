JG-SIGAP FRAMEWORK V4 URL CONFIG PATCH

File yang disesuaikan dengan URL Anda:
1. Config.js
2. JS_core.js.html
3. Router.js
4. Index.html

DEV URL:
https://script.google.com/macros/s/AKfycbwjQmDqckJvpbZHf6JUd_9MibJ5OM71F_571h92mz8/dev

EXEC URL:
https://script.google.com/macros/s/AKfycbxsqk2okOPyREabWs0GstRlNWZd1rIm8j9JPSP8_Z93vVFGc0zEWdUzCj-tVySgQVgG/exec

Cara pakai:
1. Replace file ke project JG-SIGAP.
2. Jalankan:
   clasp push
3. Buka:
   https://script.google.com/macros/s/AKfycbwjQmDqckJvpbZHf6JUd_9MibJ5OM71F_571h92mz8/dev?page=login

Catatan:
- Selama development, CONFIG.APP.USE_DEV = true.
- Saat production, ubah CONFIG.APP.USE_DEV = false.
- Semua redirect gunakan AppCore.navigate(page), tidak hardcode URL di page lain.
