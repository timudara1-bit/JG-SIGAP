
JG-SIGAP V3 ESIGN FRONTEND SAVE FORCE V9.3

Masalah:
Row dummy backend sudah bisa bertambah, tetapi klik Simpan Tanda Tangan dari page belum menambah data.

Perbaikan V9.3:
1. Frontend save tanda tangan sekarang memanggil function khusus:
   saveEmployeeEsignDirectV93
2. Data canvas dibaca SEBELUM box e-sign diubah menjadi loading.
3. Data canvas dikompres/resize menjadi ukuran lebih kecil agar google.script.run tidak gagal kirim payload base64.
4. Status proses simpan ditampilkan di box e-sign:
   - Employee ID
   - ukuran data URL
   - pesan error backend jika gagal
5. Upload PNG juga diarahkan ke saveEmployeeEsignDirectV93.
6. Ditambahkan test:
   testEsignSaveDummyV93(employeeId)

File update:
- JS_app.html
- EsignService.js

Setelah extract:
clasp push -f
Ctrl + F5

Test backend:
testEsignSaveDummyV93()

Test frontend:
FPB -> Tambah FPB -> pilih requester -> Buat/Ganti Tanda Tangan -> gambar tanda tangan -> Simpan Tanda Tangan.

Jika gagal, pesan error backend akan tampil di box e-sign dan alert.
