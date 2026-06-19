
JG-SIGAP V3 ESIGN DIRECT APPEND V9.4

Masalah:
Frontend berhenti di tulisan:
Menyimpan tanda tangan...
Employee ID: EMP282
Ukuran data: 13098 karakter

Artinya tombol sudah membaca employee_id dan canvas, tetapi proses google.script.run sebelumnya tidak kembali sukses/gagal.

Perbaikan V9.4:
1. Dibuat file baru EsignDirectV94.js.
2. Save tanda tangan memakai function global baru:
   saveEmployeeEsignDirectV94(payload)
3. Function ini:
   - tidak memakai DriveApp
   - tidak memakai Repository
   - langsung appendRow ke 24_M_EMPLOYEE_ESIGN
   - validasi employee_id ke 04_M_EMPLOYEE
   - otomatis is_active=0 untuk sign lama employee yang sama
   - sign baru is_active=1
4. Frontend sekarang memanggil:
   saveEmployeeEsignServerV94()
5. Ditambahkan timeout 25 detik agar tidak menggantung terus.

File update:
- EsignDirectV94.js
- JS_app.html

Setelah extract:
clasp push -f
Ctrl + F5

Test backend:
testEsignSaveDummyV94("EMP282")

Cek:
24_M_EMPLOYEE_ESIGN

Test frontend:
FPB -> Tambah FPB -> pilih requester EMP282 -> Buat/Ganti Tanda Tangan -> Simpan Tanda Tangan.

Jika masih gagal, box e-sign akan menampilkan pesan error atau timeout.
