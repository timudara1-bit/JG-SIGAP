JG-SIGAP V3 LOADER CONFIG HOTFIX V6.4

Masalah:
Di page Loader, data config loader per segment belum muncul.

Penyebab:
File stabil V6.3 memakai base V6.1 agar tidak blank, sehingga service sync loader config dari V5 belum ikut masuk.

Perbaikan:
- Menambahkan LoaderConfigService.js
- Menambahkan API getLoaderConfig
- Menambahkan API syncLoaderConfig
- Update Page_Loader.html agar menampilkan config loader per segment
- Update JS_app.html untuk render:
  PENGADAAN, PROSES, MASTER DATA, MONITORING, SYSTEM

Langkah setelah extract:
1. clasp push -f
2. Buka aplikasi
3. Masuk menu Loader
4. Klik tombol: Sinkron Config Loader

Atau jalankan manual dari Apps Script editor:
syncLoaderConfigV64()

Setelah itu data akan tersimpan di:
96_M_LOADER_CONFIG
