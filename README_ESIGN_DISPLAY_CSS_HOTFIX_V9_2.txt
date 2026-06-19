
JG-SIGAP V3 ESIGN DISPLAY + CSS HOTFIX V9.2

Masalah:
1. Row 24_M_EMPLOYEE_ESIGN sudah bertambah, tetapi sign belum tampil/terpakai di page.
2. Ada CSS bocor sebagai teks:
   .esign-box.active .esign-canvas{ margin-top:8px; }

Perbaikan:
1. CSS bocor dipindahkan ke dalam tag <style> CSS_app.html.
2. E-sign sekarang dianggap valid dari:
   - file_url jika Drive berhasil
   - file_data_url jika Drive gagal / DB_ONLY
3. Hidden field requester_esign_url sekarang diisi dari file_url atau file_data_url.
4. Box e-sign menampilkan preview gambar tanda tangan.
5. Detail FPB mengambil tanda tangan aktif dari 24_M_EMPLOYEE_ESIGN berdasarkan requester_id jika field esign belum tersimpan di header FPB.
6. Ditambahkan alias debug:
   debugEmployeeEsignDirectV92()

File update:
- CSS_app.html
- JS_app.html
- FPBService.js
- EsignService.js

Setelah extract:
clasp push -f
Ctrl + F5

Tes:
1. Jalankan:
   debugEmployeeEsignDirectV92()

2. Pastikan sample row punya:
   employee_id
   file_data_url atau file_url
   is_active = 1

3. Buka:
   FPB -> Tambah FPB -> pilih requester yang employee_id-nya sudah punya tanda tangan.
   Harus tampil preview tanda tangan dan tulisan "E-sign tersedia dan akan dipakai".
