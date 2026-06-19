
JG-SIGAP V3 ESIGN API WRAPPER FIX V9.6

Masalah:
Box berhenti di:
Menyimpan tanda tangan via API V9.5...
Employee ID: EMP282
Ukuran data: 12302 karakter

Root cause:
Di V9.5, fungsi frontend saveEmployeeEsignApiV95 belum ikut masuk ke JS_app.html,
sementara tombol sudah memanggil fungsi tersebut.
Akibatnya terjadi JavaScript ReferenceError dan proses berhenti di status loading.

Perbaikan V9.6:
1. Menambahkan fungsi saveEmployeeEsignApiV95 secara eksplisit ke JS_app.html.
2. Fungsi ini memanggil:
   Core.api("saveEmployeeEsignV95", payload)
3. Ditambahkan try/catch di tombol Simpan Tanda Tangan.
4. Jika ada error JavaScript, error akan tampil di box dan alert, tidak menggantung.
5. Status loading berubah menjadi V9.6 agar mudah dipastikan file baru sudah terpasang.

File update:
- JS_app.html

Setelah extract:
clasp push -f
Ctrl + F5

Tes:
FPB -> Tambah FPB -> pilih requester EMP282 -> Buat/Ganti Tanda Tangan -> Simpan Tanda Tangan.

Ciri patch sudah aktif:
Box menampilkan:
Menyimpan tanda tangan via API V9.6...
