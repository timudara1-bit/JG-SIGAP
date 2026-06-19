
JG-SIGAP V3 ESIGN FILE URL FIX V9.7

Masalah:
Data e-sign sudah tersimpan ke database, tetapi:
- file_url kosong
- file_id kosong
- klik Buka file sign membuka about:blank

Perbaikan V9.7:
1. Backend save e-sign sekarang mencoba membuat file PNG ke Google Drive.
2. Jika Drive berhasil:
   file_url = URL file Drive
   file_id = ID file Drive
   save_status = DRIVE_AND_DB
3. Jika Drive gagal:
   file_url = data:image/png;base64...
   file_id = esign_id
   file_data_url tetap terisi
   save_status = DB_DATA_URL
4. Link Buka file sign tidak lagi langsung href kosong.
5. Jika file_url berupa data URL, sistem membuka tab baru dan menampilkan gambar tanda tangan.
6. ApiController saveEmployeeEsignV95 diarahkan ke saveEmployeeEsignDirectV97.

File update:
- EsignDirectV94.js
- ApiController.js
- JS_app.html

Setelah extract:
clasp push -f
Ctrl + F5

Tes backend:
testEsignSaveDummyV97("EMP282")

Cek sheet 24_M_EMPLOYEE_ESIGN:
- file_url harus terisi
- file_id harus terisi
- save_status DRIVE_AND_DB atau DB_DATA_URL

Tes frontend:
FPB -> Tambah FPB -> pilih requester -> Buat/Ganti Tanda Tangan -> Simpan Tanda Tangan -> Buka file sign.
