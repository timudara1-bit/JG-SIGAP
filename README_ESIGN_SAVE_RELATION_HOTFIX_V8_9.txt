JG-SIGAP V3 ESIGN SAVE RELATION HOTFIX V8.9

Masalah:
Tanda tangan belum tersimpan dan sheet 24_M_EMPLOYEE_ESIGN belum muncul.

Perbaikan:
1. EsignService dibuat lebih kuat.
2. Sheet 24_M_EMPLOYEE_ESIGN otomatis dibuat saat:
   - testEsignMasterDirectV89()
   - setupEsignMasterDirectV89()
   - simpan tanda tangan
   - cek tanda tangan requester
3. Tanda tangan wajib terikat ke employee_id.
4. Sistem validasi employee_id harus ada di 04_M_EMPLOYEE.
5. Satu employee hanya boleh punya satu tanda tangan aktif:
   - tanda tangan lama employee tersebut otomatis is_active = 0
   - tanda tangan terbaru is_active = 1
6. File tanda tangan disimpan ke Google Drive.
7. Metadata tanda tangan disimpan ke 24_M_EMPLOYEE_ESIGN.

Relasi:
24_M_EMPLOYEE_ESIGN.employee_id -> 04_M_EMPLOYEE.employee_id

Header sheet:
esign_id
employee_id
employee_name
file_name
file_type
file_url
file_id
sign_source
is_active
created_at
created_by
updated_at

File update:
- Config.js
- EsignService.js
- FPBService.js

Setelah extract:
clasp push -f

Wajib jalankan sekali di Apps Script editor:
testEsignMasterDirectV89()

Lalu cek sheet:
24_M_EMPLOYEE_ESIGN

Tes debug:
debugEmployeeEsignDirectV89()

Setelah itu:
Ctrl + F5
FPB -> Tambah FPB -> pilih requester -> Buat/Ganti Tanda Tangan -> Simpan.
