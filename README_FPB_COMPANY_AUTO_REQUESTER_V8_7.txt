JG-SIGAP V3 FPB COMPANY AUTO REQUESTER V8.7

Perbaikan:
1. Field Company tidak lagi hard-code dan tidak dipilih manual.
2. Company otomatis mengikuti data requester yang dipilih.
3. Relasi company dibaca dari:
   - 04_M_EMPLOYEE.company_id jika ada
   - fallback 03_M_DEPARTMENT.company_id jika employee belum punya company_id
4. Master company dibaca dari:
   - CONFIG.SHEET.COMPANY = 11_M_COMPANY
5. Tampilan company menampilkan kode company:
   company_code - company_name

Catatan database:
Agar otomatis akurat, pastikan 04_M_EMPLOYEE memiliki field:
- employee_id
- department_id
- company_id

Dan 11_M_COMPANY memiliki field:
- company_id
- company_code
- company_name

File update:
- FPBService.js
- JS_app.html

Setelah extract:
clasp push -f
Ctrl + F5

Tes:
FPB -> Tambah FPB -> pilih requester.
Company harus otomatis tampil dan tidak perlu dipilih manual.
