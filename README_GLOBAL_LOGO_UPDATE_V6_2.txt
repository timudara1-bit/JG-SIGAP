JG-SIGAP V3 UPDATE V6.2 - GLOBAL LOGO HELPER

Tujuan:
Agar logo bisa dipanggil dari page mana pun dengan satu sumber.

Logo yang dipakai:
https://drive.google.com/thumbnail?id=1khiHehuJxwrcC_6LE__O9yXvBV6Hx_O6

File baru:
- JS_logo.html
- LogoService.js
- README_GLOBAL_LOGO_UPDATE_V6_2.txt

File update:
- Config.js
- Code.js
- Index.html
- JS_ui.html
- CSS_app.html
- Page_Login.html

Cara pakai di file HTML/JS frontend:
1. Mengambil URL:
   Logo.url()

2. Menampilkan image:
   ${Logo.img("app-logo-img")}

3. Render ke selector:
   Logo.render("#targetLogo")

Contoh di HTML template JS:
<div class="logo-wrap">${Logo.img("brand-logo-img")}</div>

Jika hanya HTML statis tanpa template JS, pakai langsung:
<img src="https://drive.google.com/thumbnail?id=1khiHehuJxwrcC_6LE__O9yXvBV6Hx_O6" class="app-logo-img">

Setelah extract:
clasp push -f
Ctrl + F5 di browser
