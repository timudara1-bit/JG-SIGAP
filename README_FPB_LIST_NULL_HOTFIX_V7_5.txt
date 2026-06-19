JG-SIGAP V3 FPB LIST NULL HOTFIX V7.5

Masalah:
Setelah FPB berhasil submit, page FPB error:
Error load FPB: Cannot read properties of null (reading 'success')

Penyebab:
Core.api("listFPB") mengembalikan null, biasanya karena action listFPB belum terbaca di ApiController
atau response server tidak dikembalikan sebagai object.

Perbaikan:
1. ApiController.js dipastikan punya action:
   - getFPBInit
   - listFPB
   - createFPB
   - searchFPBRequester
   - previewFPBNo

2. FPBService.list dibuat safe dan selalu return object:
   { success, data, total }

3. JS_app.html loadFPB dibuat tahan null:
   - jika listFPB null, fallback ke getFPBInit
   - jika masih gagal, pesan error ditampilkan di tabel

Setelah extract:
clasp push -f
Ctrl + F5

Tes:
FPB -> Refresh.
Data FPB yang baru submit harus muncul di tabel.
