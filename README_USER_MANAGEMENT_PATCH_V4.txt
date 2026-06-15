PATCH V4 USER MANAGEMENT

Perubahan:
1. Field cari karyawan/NIK/Nama dipindah ke paling atas modal tambah/edit user.
2. Username tidak input manual. Username otomatis = email dari 04_M_EMPLOYEE.email.
3. Email tampil readonly dan otomatis terisi dari 04_M_EMPLOYEE.
4. employee_id tetap dikirim/disimpan tetapi hidden di UI.
5. Departemen otomatis dari data karyawan + 03_M_DEPARTMENT.
6. Dropdown Role hanya diambil dari 02_M_ROLE, tanpa fallback statis CONFIG.ROLE.
7. Value dropdown Role = role_id.
8. Insert/update 05_M_USER_ROLE memakai role_id dari 02_M_ROLE. role_code/role_name dikosongkan jika kolom lama masih ada.
9. Table user menampilkan role_name/role_id hasil join 05_M_USER_ROLE -> 02_M_ROLE.
10. approver_level tetap dipertahankan di form dan 01_M_USER bila header tersedia; mapping final ke 06_M_APPROVAL_MATRIX disiapkan untuk tahap approval matrix berikutnya.

File utama:
- Page_UserManagement.html
- JS_userManagement.js.html
- UserManagementService.js
