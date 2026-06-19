JG-SIGAP V3 UPDATE V6 - PROFILE PHOTO, PROFILE DROPDOWN, LOGOUT

Fitur yang diaktifkan:
1. Foto profile user di kanan atas topbar.
2. Dropdown profile saat avatar diklik.
3. Menu Profile Saya, Ganti Foto Profile, Settings, Logout.
4. Upload foto profile user sendiri.
5. Simpan URL foto ke:
   - 04_M_EMPLOYEE.profile_photo_url
   - 01_M_USER.profile_photo_url
6. Logout aktif:
   - update session ke LOGOUT
   - hapus token localStorage
   - kembali ke page login

File baru:
- ProfileService.js
- README_PROFILE_LOGOUT_UPDATE_V6.txt

File update:
- ApiController.js
- AuthService.js
- JS_ui.html
- JS_app.html
- CSS_app.html

Opsional folder khusus foto profile:
Isi 00_M_CONFIG:
config_key: PROFILE_PHOTO_FOLDER_ID
config_value: ID_FOLDER_GOOGLE_DRIVE

Setelah extract:
clasp push -f
