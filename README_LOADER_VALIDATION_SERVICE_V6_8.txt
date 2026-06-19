JG-SIGAP V3 LOADER VALIDATION SERVICE V6.8

Update ini menambahkan validasi pintar per target sheet loader.

File baru:
- LoaderValidationService.js

File update:
- LoaderImportService.js
- JS_app.html

Validasi:
1. Required field per sheet
2. Duplicate key di file upload
3. Format email
4. Format tanggal
5. Format angka
6. Boolean 1/0
7. Enum status
8. Relasi foreign key sederhana
9. Rule khusus:
   - Quotation amount > 0
   - Quotation detail qty dan unit_price > 0
   - FPB detail qty > 0
   - Warning NIK terlalu pendek

Contoh:
04_M_EMPLOYEE:
- employee_id, nik, full_name, department_id, email, is_active wajib
- email harus valid
- department_id harus ada di 03_M_DEPARTMENT

15_T_QUOTATION_HEADER:
- fpb_id harus ada di 10_T_FPB_HEADER
- vendor_id harus ada di 10_M_VENDOR
- quotation_amount harus lebih dari 0

Setelah extract:
clasp push -f
Ctrl + F5
