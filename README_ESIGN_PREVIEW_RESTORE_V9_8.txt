
JG-SIGAP V3 ESIGN PREVIEW RESTORE V9.8

Masalah:
Klik Buka file sign sudah bisa, tetapi preview tanda tangan di form FPB hilang.

Penyebab:
file_url sekarang bisa berisi URL halaman Google Drive. URL halaman Drive bisa dibuka di tab baru,
tetapi tidak selalu bisa dipakai langsung sebagai sumber <img> preview.

Perbaikan V9.8:
1. Preview tanda tangan memakai prioritas:
   - file_data_url dari database
   - thumbnail Drive dari file_id
   - file_url hanya jika berupa data:image atau direct image URL
2. Tombol Buka file sign tetap memakai file_url / file_data_url.
3. Jika preview belum tersedia, muncul placeholder "Preview belum tersedia" bukan kosong.
4. Setelah simpan tanda tangan, file_id juga dikirim ke UI agar preview Drive bisa muncul.

File update:
- JS_app.html
- CSS_app.html

Setelah extract:
clasp push -f
Ctrl + F5

Tes:
FPB -> Tambah FPB -> pilih requester yang sudah punya sign.
Preview tanda tangan harus tampil kembali.
