JG-SIGAP V3 FPB AUTOFILL NUMBER + SCROLL V7.4

Perbaikan:
1. Department otomatis terisi dari database setelah requester dipilih.
2. Company otomatis terisi dari database setelah requester dipilih.
3. Field Site dihapus dari modal FPB.
4. Field Nomor FPB ditambahkan.
   - Jika diisi user: nomor FPB mengikuti input.
   - Jika kosong: nomor otomatis.
5. Format nomor otomatis:
   nomor/department_code/company_id/bulan_romawi/tahun
   Contoh: 001/GA/JG/VI/2026
6. Modal dibuat scrollable.

File update:
- FPBService.js
- ApiController.js
- JS_app.html
- CSS_app.html

Setelah extract:
clasp push -f
Ctrl + F5
