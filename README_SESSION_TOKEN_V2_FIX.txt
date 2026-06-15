JG-SIGAP SESSION TOKEN V2 FIX

Tujuan:
- Memperbaiki bug: session tercatat di 94_T_USER_SESSION tetapi login tetap dianggap gagal.
- Menghapus duplicate sessionUser di AuthService.js.
- Backend login sekarang pasti return:
  success, message, token, user, role, role_code, roles, redirectPage.
- Frontend JS_login.js.html sekarang membaca res.token, bukan format lama.
- SessionService sekarang mengembalikan session context lengkap, termasuk role dan roles.
- PageService.getPage(page, token) wajib menerima token dari frontend.
- Router.js tidak lagi memakai SessionService.getSession() pada doGet karena doGet tidak bisa membaca localStorage.

File yang direplace:
1. AuthService.js
2. SessionService.js
3. JS_login.js.html
4. JS_app.js.html
5. Router.js
6. PageService.js
7. RoleMenuService.js
8. Code.js
9. Kode.js

Langkah:
1. Extract ZIP ini ke folder project JG-SIGAP.
2. Replace file lama.
3. Jalankan:
   clasp push
4. Deploy versi baru.
5. Clear localStorage browser atau buka incognito.
6. Login ulang.

Cek wajib:
- Sheet 94_T_USER_SESSION header:
  session_id | user_id | token | login_time | logout_time | expired_at | device_info | status
- 05_M_USER_ROLE user USR001 harus berisi role_id ROLE001.
- 02_M_ROLE ROLE001 harus memiliki role_code SA.

Target login:
- Login response success:true.
- Token tersimpan di localStorage JG_SIGAP_TOKEN.
- Session baru tercatat ACTIVE di 94_T_USER_SESSION.
- Redirect ke ?page=dashboard.
- Akun berbeda bisa login bersamaan di perangkat/browser berbeda.
