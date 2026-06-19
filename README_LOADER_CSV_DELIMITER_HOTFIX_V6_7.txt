JG-SIGAP V3 LOADER CSV DELIMITER HOTFIX V6.7

Masalah:
Validasi gagal dengan:
Missing header: employee_id, nik, ...
Extra header: employee_id;nik;employee_no;...

Penyebab:
File CSV memakai pemisah titik koma (;), tetapi parser sebelumnya membaca CSV sebagai koma (,).
Akibatnya semua header terbaca menjadi satu kolom panjang.

Perbaikan:
- LoaderImportService sekarang auto detect delimiter:
  ;
  ,
  TAB
- Template CSV sekarang dibuat dengan delimiter ; agar cocok dengan Excel Indonesia.
- UTF-8 BOM ikut dibersihkan.

File yang diupdate:
- LoaderImportService.js
- JS_app.html

Langkah:
1. Extract ZIP dan replace.
2. clasp push -f
3. Ctrl + F5
4. Download ulang template dari menu Loader.
5. Isi data.
6. Upload lagi CSV.
7. Klik Validasi File.

Catatan:
CSV lama yang dipisah dengan titik koma sekarang juga harus bisa lolos validasi selama header-nya sesuai.
