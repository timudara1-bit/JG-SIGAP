JG-SIGAP PATCH DATABASE V2

Tujuan:
- Mengarahkan kode dari database lama ke database JG-SIGAP_DATABASE_BLUEPRINT_V2.
- Mengganti MST_KARYAWAN menjadi 04_M_EMPLOYEE.
- Mengganti AuditLog menjadi 90_T_AUDIT_LOG.
- Mengganti 12_T_QUOTATION menjadi 14_T_VENDOR_COMPARISON sebagai adapter Underlying.
- Mengganti 50_T_RECEIVED_HEADER menjadi 50_T_RECEIVE_HEADER.
- Menambahkan alias sheet di Config.js agar sisa kode lama tidak langsung error.
- Mempercepat SecurityService hash agar login tidak menggantung.

File penting yang diupdate:
- Config.js
- Repository.js
- AuthService.js
- UserService.js
- AuditService.js
- DashboardService.js
- QuotationRepository.js
- DB_Helper.js
- SecurityService.js
- DatabaseV2Validator.js

Cara pakai:
1. Backup project lokal:
   git add .
   git commit -m "Backup before database V2 patch"

2. Extract ZIP ini.

3. Copy semua file di folder src ke folder project JG-SIGAP Anda:
   C:\laragon\www\JG-SIGAP

4. Jalankan:
   clasp push

5. Di Apps Script Editor jalankan:
   checkDatabaseV2()

6. Jika login testing masih gagal karena hash lama, jalankan:
   resetUserPasswordFast("email_atau_username", "password_baru")

Catatan penting:
Pastikan 01_M_USER memiliki kolom berikut agar login stabil:
user_id, employee_id, nik, username, email, password_hash, salt, login_attempt, role_code, approver_level, is_active, aktif, created_at, last_login

Pastikan 04_M_EMPLOYEE memiliki kolom minimal:
employee_id, nik, employee_no, full_name, department_id, position, email, employment_status, is_active
