JG-SIGAP V3 FPB API CONTROLLER FORCE FIX V7.6

Masalah:
Page FPB masih menampilkan:
API listFPB mengembalikan response null.

Artinya request dari frontend belum masuk ke action listFPB di ApiController,
walaupun FPBService sudah ada.

Perbaikan V7.6:
1. ApiController.js ditambahkan force handler:
   __handleFPBActionsV76(action, payload, user)

2. Action FPB yang dipaksa aktif:
   - getFPBInit
   - listFPB
   - createFPB
   - searchFPBRequester
   - previewFPBNo

3. FPBService.js ditambahkan global fallback function:
   - listFPB(payload)
   - getFPBInit(payload)
   - createFPB(payload)
   - searchFPBRequester(payload)
   - previewFPBNo(payload)

4. JS_app.html loadFPB ditambah fallback langsung:
   google.script.run.listFPB(payload)

Setelah extract:
clasp push -f
Ctrl + F5

Test manual di Apps Script editor:
Jalankan fungsi:
apiFPBTestV76

Jika return success true, berarti server list FPB sudah hidup.
