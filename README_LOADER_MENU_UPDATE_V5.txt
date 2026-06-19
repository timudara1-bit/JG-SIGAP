JG-SIGAP V3 UPDATE V5 - LOADER CONFIG + MENU ORDER

Update ini menambahkan:
1. Page Loader diperbarui sesuai segment final:
   - PENGADAAN
   - PROSES
   - MASTER DATA
   - MONITORING
   - SYSTEM

2. Loader config default: 31 segment loader ke 96_M_LOADER_CONFIG.

3. Susunan menu sidebar diperbarui:
   Dashboard, Monitoring, Laporan, Pengadaan, Proses, Master Data, Settings.

File baru:
- LoaderConfigService.js
- MenuOrderService.js
- README_LOADER_MENU_UPDATE_V5.txt

File update:
- Page_Loader.html
- JS_ui.html
- JS_app.html
- Config.js

Setelah push jalankan:
syncLoaderConfigV5()
syncMenuOrderV5()

Jika quotation belum dimigrasi, jalankan juga:
migrateQuotationModuleV4()
