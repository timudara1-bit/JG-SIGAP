JG-SIGAP V3 USER MANAGEMENT DISPLAY HOTFIX V7.1

Masalah:
- Data user belum tampil.
- Data employee untuk dipilih belum tampil.

Penyebab:
Di JS_app.html fungsi loadUserManagement() dan searchEmployeeForUser()
memakai helper setText(), tetapi helper itu belum ada di scope App.
Akibatnya setelah API berhasil, JavaScript error dan render tabel/search berhenti.

Perbaikan:
- Menambahkan helper setText() di scope App.
- Menambahkan try/catch agar error tampil di halaman/modal.
- Menambahkan debugUserManagement untuk cek jumlah row sheet.

File update:
- JS_app.html
- UserManagementService.js
- ApiController.js

Setelah extract:
clasp push -f
Ctrl + F5

Test:
1. Buka Management User.
2. Klik Refresh.
3. Klik Tambah User.
4. Cari NIK/Nama/Email dari 04_M_EMPLOYEE.

Jika masih kosong, jalankan API debugUserManagement lewat console/Core.api untuk cek jumlah row per sheet.
