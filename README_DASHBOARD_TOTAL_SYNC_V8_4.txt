JG-SIGAP V3 DASHBOARD TOTAL SYNC V8.4

Masalah:
FPB sudah berhasil submit dan tampil di page FPB,
tetapi Dashboard / Monitoring / page proses lain masih menampilkan total 0.

Penyebab:
DashboardService sebelumnya hanya menghitung dari 85_T_SLA_SNAPSHOT.
Saat FPB baru submit, data masuk ke 10_T_FPB_HEADER, tetapi belum tentu sudah punya SLA snapshot.
Akibatnya total pengajuan di dashboard tetap kosong.

Perbaikan V8.4:
1. DashboardService.js sekarang menghitung total dari:
   - 83_T_DOCUMENT_STATUS jika ada
   - fallback ke 10_T_FPB_HEADER jika document status belum ada
   - SLA snapshot tetap dibaca sebagai info tambahan

2. Saat FPB dibuat, FPBService.create otomatis sync ke:
   - 83_T_DOCUMENT_STATUS
   - 95_R_DASHBOARD jika sheet tersedia

3. JS_app.html:
   - Dashboard / Monitoring memakai dashboardDirectV84
   - Page proses lain yang punya KPI Total ikut sinkron dengan summary dashboard
   - Page Verifikasi GA yang berbasis FPB bisa menampilkan data FPB awal

4. Debug:
   - testDashboardDirectV84()
   - testDashboardSyncV84()

File update:
- DashboardService.js
- FPBService.js
- FPBDirectApiV79.js
- FPBDebugLoggerV77.js
- JS_app.html
- Page_Dashboard.html
- Page_Monitoring.html

Setelah extract:
clasp push -f
Ctrl + F5

Test Apps Script editor:
testDashboardDirectV84()
testDashboardSyncV84()

Ekspektasi:
summary.total = 1
segments berisi FPB_SUBMITTED
