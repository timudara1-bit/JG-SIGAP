JG-SIGAP V3 ESIGN DB FALLBACK SAVE V9.1

Masalah:
Sheet 24_M_EMPLOYEE_ESIGN sudah muncul, tetapi setelah test dummy tabel masih kosong.

Perbaikan V9.1:
1. Save tanda tangan sekarang tetap menulis ke database walaupun DriveApp gagal.
2. Ditambahkan kolom file_data_url agar tanda tangan benar-benar tersimpan di database.
3. Jika Drive berhasil:
   save_status = DRIVE_AND_DB
   file_url dan file_id terisi
4. Jika Drive gagal:
   save_status = DB_ONLY
   file_data_url tetap terisi
   tanda tangan tetap bisa digunakan ulang
5. Header sheet 24_M_EMPLOYEE_ESIGN otomatis ditambah tanpa menghapus data lama:
   file_data_url
   save_status
   error_message
6. Tetap berlaku:
   1 employee_id hanya boleh punya 1 tanda tangan aktif.
   Tanda tangan lama otomatis is_active = 0.

File update:
- EsignService.js
- JS_app.html

Setelah extract:
clasp push -f

Jalankan:
testEsignMasterDirectV91()

Lalu jalankan test tanpa parameter dulu:
testEsignSaveDummyV91()

Cek sheet:
24_M_EMPLOYEE_ESIGN

Jika masih kosong, buka Executions dan lihat return/log dari testEsignSaveDummyV91().
