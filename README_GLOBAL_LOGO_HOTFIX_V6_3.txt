JG-SIGAP V3 GLOBAL LOGO HOTFIX V6.3

Perbaikan dari V6.2:
- Tidak lagi memakai JS_logo.html pada proses render utama.
- Tidak ada dependency object Logo di JS_ui.html.
- Logo dipasang langsung sebagai <img> sehingga tidak memicu blank page.
- Base diambil dari HOTFIX V6.1 yang sebelumnya sudah berjalan mulus.

Logo:
https://drive.google.com/thumbnail?id=1khiHehuJxwrcC_6LE__O9yXvBV6Hx_O6

File yang diupdate:
- JS_ui.html
- Page_Login.html
- CSS_app.html
- Config.js
- LogoService.js
- Index.html

Cara pakai logo di page mana pun:
1. Cara aman untuk HTML statis:
   <img src="https://drive.google.com/thumbnail?id=1khiHehuJxwrcC_6LE__O9yXvBV6Hx_O6" class="app-logo-img">

2. Cara server-side Apps Script:
   <?!= getAppLogoImg('app-logo-img') ?>

Setelah extract:
clasp push -f

Lalu lakukan:
Ctrl + F5

Jika masih blank akibat cache:
localStorage.clear()
location.reload()
