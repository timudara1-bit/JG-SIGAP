JG-SIGAP PATCH V5 - FIX BLANK PAGE AFTER LOGIN

Root cause yang ditemukan dari ZIP terbaru:
1. JS_login.js.html masih redirect ke ?page=Index, bukan ?page=dashboard.
2. Router.js masih mencampur routing lama dan memanggil getSLADashboardData() saat render awal.
   Jika SLA/data kosong atau error, render awal bisa lambat/blank.
3. PageService.js berisi fungsi client-side google.script.run di file server .js.
   Ini rawan membingungkan dan menyebabkan duplicate flow.
4. JS_app.js.html memiliki duplicate logout() dan window click handler yang bisa error jika .profile-menu tidak ada.
5. JS_dashboard.js.html memanggil loadDashboard() sebelum partial Dashboard_Total/Status/LeadTime selesai masuk DOM.
   Akibatnya data dashboard sering tidak tampil sampai klik manual/refresh.
6. Page_Dashboard.html masih ada script DOMContentLoaded sendiri, sehingga init dashboard bisa dobel.

Cara pakai:
1. Backup dulu file lama.
2. Replace file berikut ke project lokal:
   - Router.js
   - PageService.js
   - Index.html
   - Page_Dashboard.html
   - JS_login.js.html
   - JS_app.js.html
   - JS_dashboard.js.html
   - SessionService.js
3. Jalankan:
   clasp push
4. Deploy versi baru / update deployment.
5. Buka URL /exec fresh tab.
6. Login ulang.

Catatan:
- Patch ini fokus menstabilkan login -> dashboard, logout -> login, dan dashboard auto-load.
- Setelah stabil, baru lanjut refactor modul FPB/Underlying/PP.
