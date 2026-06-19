
JG-SIGAP V3 ESIGN SAVE VIA API V9.5

Masalah:
Frontend berhenti di:
Menyimpan tanda tangan V9.4...
Employee ID: EMP282
Ukuran data: 13274 karakter

Artinya canvas dan employee_id sudah terbaca, tetapi google.script.run direct function masih menggantung.

Perbaikan V9.5:
1. Simpan tanda tangan tidak lagi memanggil direct function dari HTML.
2. Frontend sekarang memakai jalur Core.api/callApi yang sudah terbukti dipakai modul lain.
3. ApiController ditambah route:
   - saveEmployeeEsignV95
   - getEmployeeEsignV95
   - debugEmployeeEsignV95
4. Route saveEmployeeEsignV95 tetap memakai saveEmployeeEsignDirectV94:
   - appendRow langsung ke 24_M_EMPLOYEE_ESIGN
   - tidak memakai DriveApp
   - tidak memakai Repository
5. Timeout frontend dinaikkan menjadi 30 detik dan error akan tampil di box.

File update:
- ApiController.js
- JS_app.html

Setelah extract:
clasp push -f
Ctrl + F5

Test:
1. Login ulang.
2. FPB -> Tambah FPB -> pilih requester EMP282.
3. Buat/Ganti Tanda Tangan.
4. Simpan Tanda Tangan.

Jika masih gagal, box akan menampilkan:
Timeout simpan e-sign via API V9.5
atau pesan error dari ApiController.
