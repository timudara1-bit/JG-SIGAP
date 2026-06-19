JG-SIGAP V3 EMPLOYEE ESIGN REUSE V8.8

Fitur baru:
1. E-sign berbentuk tanda tangan PNG, bukan hanya teks.
2. Tanda tangan tersimpan di database per employee.
3. Tanda tangan yang sudah dibuat dapat digunakan kembali untuk FPB berikutnya.
4. Tanda tangan bisa dibuat langsung di sistem dengan canvas/sign pad.
5. Tanda tangan juga bisa upload file PNG, disarankan background transparan.
6. Saat requester dipilih di form FPB, sistem otomatis cek tanda tangan employee tersebut.
7. Jika sudah ada, tanda tangan langsung dipakai.
8. Jika belum ada, user bisa buat/ganti tanda tangan.
9. File tanda tangan disimpan ke Google Drive dan metadata disimpan ke 24_M_EMPLOYEE_ESIGN.
10. FPB menyimpan reference:
    - requester_esign_id
    - requester_esign_url

Database baru:
24_M_EMPLOYEE_ESIGN

Header:
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
- JS_app.html
- CSS_app.html

Function baru:
- setupEsignMasterDirectV88()
- getEmployeeEsignDirectV88(payload)
- saveEmployeeEsignDirectV88(payload)
- testEsignMasterDirectV88()

Setelah extract:
clasp push -f

Jalankan sekali di Apps Script editor:
testEsignMasterDirectV88()

Lalu:
Ctrl + F5

Tes:
FPB -> Tambah FPB -> pilih requester.
Jika requester belum punya sign:
- klik Buat / Ganti Tanda Tangan
- gambar tanda tangan
- simpan
Atau:
- upload PNG transparan

Setelah sign tersimpan, FPB berikutnya tidak perlu membuat tanda tangan ulang.
