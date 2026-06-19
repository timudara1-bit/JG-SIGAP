JG-SIGAP V3 ESIGN INLINE SAVE HOTFIX V9.0

Masalah:
Sheet 24_M_EMPLOYEE_ESIGN sudah muncul, tetapi tanda tangan belum tersimpan saat klik Simpan Tanda Tangan.

Root cause yang diperbaiki:
Pada versi sebelumnya tombol Buat/Ganti Tanda Tangan membuka modal baru di atas modal FPB.
Karena sistem modal aplikasi hanya satu, modal tanda tangan menggantikan modal FPB.
Akibatnya beberapa field FPB/e-sign hilang saat proses simpan atau saat update hasil simpan.

Perbaikan V9.0:
1. Canvas tanda tangan sekarang tampil inline di dalam form FPB, bukan membuka modal baru.
2. Saat klik Simpan Tanda Tangan:
   - employee_id tetap terbaca
   - canvas tetap berada di form FPB
   - hasil simpan langsung mengisi requester_esign_id dan requester_esign_url
3. Tanda tangan tetap tersimpan ke:
   - Google Drive
   - 24_M_EMPLOYEE_ESIGN
4. Tetap berlaku aturan:
   - 1 employee hanya punya 1 tanda tangan aktif
   - tanda tangan lama employee otomatis is_active = 0
   - tanda tangan terbaru is_active = 1
5. Ditambahkan test dummy:
   testEsignSaveDummyV90(employeeId)

File update:
- JS_app.html
- EsignService.js
- CSS_app.html

Setelah extract:
clasp push -f
Ctrl + F5

Test backend dulu:
1. Jalankan:
   testEsignMasterDirectV89()

2. Jalankan test simpan dummy:
   testEsignSaveDummyV90("EMP001")
   Ganti EMP001 dengan employee_id yang ada di 04_M_EMPLOYEE.

3. Cek 24_M_EMPLOYEE_ESIGN harus bertambah 1 baris.

Test frontend:
FPB -> Tambah FPB -> pilih requester -> Buat/Ganti Tanda Tangan -> gambar tanda tangan -> Simpan Tanda Tangan.
