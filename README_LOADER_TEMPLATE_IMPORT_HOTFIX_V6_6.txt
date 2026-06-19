JG-SIGAP V3 LOADER TEMPLATE + IMPORT HOTFIX V6.6

Masalah:
- Tombol Download Template di modal belum aktif.
- Tombol Validasi File di Import Loader belum memproses file.
- Tombol masih hardcode.

Perbaikan:
1. Tambah LoaderImportService.js
2. Tambah API:
   - getLoaderTemplate
   - validateLoaderFile
   - importLoaderData
3. Tombol Template sekarang langsung download file CSV dari header target sheet.
4. Tombol Validasi File sekarang membaca file CSV, validasi header, dan tampilkan preview.
5. Setelah validasi sukses, tombol Proses Import muncul.
6. Proses Import insert/update data ke target sheet loader.

File yang diupdate:
- ApiController.js
- JS_app.html
- LoaderImportService.js

Cara pakai:
1. Buka menu Loader.
2. Klik Template pada salah satu loader.
3. File CSV template akan terdownload.
4. Isi data di file CSV.
5. Klik Import.
6. Pilih file CSV.
7. Klik Validasi File.
8. Jika validasi berhasil, klik Proses Import.

Catatan:
Untuk tahap ini validasi otomatis mendukung CSV.
Jika dari Excel, gunakan Save As CSV UTF-8 lalu upload.
