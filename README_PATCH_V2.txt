JG-SIGAP PATCH V2
=================

Fokus perbaikan:
1. Login sukses langsung redirect ke ?page=dashboard via getAppUrl().
2. Logout langsung redirect ke ?page=login via getAppUrl().
3. Dashboard data otomatis tampil saat page pertama kali dibuka.
4. initDashboard sekarang menunggu partial Dashboard_Total, Dashboard_Status, Dashboard_LeadTime selesai dimuat sebelum loadDashboard().
5. Menghapus duplicate function logout dan initDashboard yang saling menimpa.
6. PageService dipisahkan menjadi server-only function getPage().
7. DashboardService dibuat aman jika sheet belum ada dan mendukung nama sheet 50_T_RECEIVE_HEADER maupun 50_T_RECEIVED_HEADER.

Cara pakai:
- Backup dulu project Anda.
- Replace file di project dengan file patch ini:
  Router.js
  PageService.js
  JS_login.js.html
  JS_app.js.html
  JS_dashboard.js.html
  Page_Dashboard.html
  DashboardService.js
- Jalankan: clasp push
- Deploy ulang web app jika perlu.

Catatan penting:
- Patch ini fokus stabilisasi fondasi login/logout/dashboard.
- Setelah ini baru lanjut integrasi database V2: Underlying, Draft PP, FAT, IA, DocumentStatus, DocumentLink.
