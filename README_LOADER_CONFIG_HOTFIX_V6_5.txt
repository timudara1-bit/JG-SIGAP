JG-SIGAP V3 LOADER CONFIG HOTFIX V6.5

Masalah V6.4:
1. Tombol Sinkron Config Loader memanggil action syncLoaderConfig,
   tetapi ApiController belum mendaftarkan action itu.
2. getLoaderConfig masih diarahkan ke LoaderService.getConfig,
   sehingga default loader dari LoaderConfigService tidak tampil.
3. Fungsi loadLoader di JS_app masih versi lama sehingga segment table belum dirender penuh.

Perbaikan V6.5:
- ApiController.js:
  case "getLoaderConfig": return LoaderConfigService.getConfig(...)
  case "syncLoaderConfig": return LoaderConfigService.syncDefault()

- LoaderService.js:
  getConfig didelegasikan ke LoaderConfigService.

- JS_app.html:
  loadLoader render segment card + table.
  App.syncLoaderConfig aktif.
  App.openLoaderImport dan App.openLoaderTemplate aktif.

- LoaderConfigService.js:
  Ditambahkan alias global syncLoaderConfig() dan syncLoaderConfigV64().

Langkah pasang:
1. Extract ZIP ini ke project lokal dan replace file lama.
2. clasp push -f
3. Hard refresh browser Ctrl + F5.
4. Buka menu Loader.
5. Klik Sinkron Config Loader.

Manual test di Apps Script editor:
syncLoaderConfig()

Jika berhasil, sheet 96_M_LOADER_CONFIG akan berisi 52 config loader.
