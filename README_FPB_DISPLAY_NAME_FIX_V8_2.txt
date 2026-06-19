JG-SIGAP V3 FPB DISPLAY NAME FIX V8.2

Perbaikan:
1. Tabel FPB tidak lagi menampilkan requester_id dan department_id saja.
2. Requester ditampilkan sebagai:
   Nama Requester (NIK)
3. Department ditampilkan sebagai:
   department_code - department_name
4. Company ditambahkan ke tabel FPB:
   company_id - company_name
5. Search tabel FPB sekarang bisa mencari nama requester, NIK, nama department, kode department, company.

File update:
- FPBService.js
- JS_app.html
- Page_FPB.html

Setelah extract:
clasp push -f
Ctrl + F5

Tes:
FPB -> Refresh
Requester dan Department harus tampil informatif.
