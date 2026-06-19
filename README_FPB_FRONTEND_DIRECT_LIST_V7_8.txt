JG-SIGAP V3 FPB FRONTEND DIRECT LIST V7.8

Hasil test server:
FPBService.list berhasil return:
success true
total 1
data FPB muncul

Artinya backend sudah benar. Masalah tersisa ada di frontend router Core.api yang masih return null.

Perbaikan V7.8:
1. JS_app.html loadFPB sekarang langsung memanggil:
   google.script.run.listFPB(payload)

2. Core.api("listFPB") hanya jadi fallback, bukan jalur utama.

3. Karena fungsi global listFPB sudah ada dari V7.6/V7.7, page FPB tidak bergantung lagi pada ApiController route lama.

Setelah extract:
clasp push -f
Ctrl + F5

Test:
FPB -> Refresh

Data berikut harus tampil:
01/ASSET/JG/XII/2025
