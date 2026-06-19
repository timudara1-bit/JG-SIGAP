JG-SIGAP V3 FPB SEARCHABLE REQUESTER V7.3

Masalah:
Field requester di modal Tambah FPB memakai dropdown biasa.
Jika data karyawan banyak, pencarian sulit.

Perbaikan:
- Field Requester diganti menjadi pencarian autocomplete.
- User mengetik minimal 2 karakter.
- Data dicari dari 04_M_EMPLOYEE berdasarkan:
  NIK
  Nama
  Employee ID
  Email
  Department
- Setelah dipilih, employee_id disimpan sebagai requester_id.
- Department otomatis mengikuti department requester.

File update:
- FPBService.js
- ApiController.js
- JS_app.html
- CSS_app.html

API baru:
- searchFPBRequester

Setelah extract:
clasp push -f
Ctrl + F5

Cara pakai:
FPB → Tambah FPB → Cari Requester → ketik minimal 2 karakter → pilih requester.
