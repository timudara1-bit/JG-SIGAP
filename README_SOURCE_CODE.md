# JG-SIGAP V3 Source Code Full REV1

Source code ini dibuat sesuai Blueprint JG-SIGAP V3 Procurement Monitoring dan Database `JG-SIGAP_DATABASE_BLUEPRINT_V3_FINAL_MONITORING_REV1`.

## Prinsip
- Tidak memakai dummy data untuk proses utama.
- Sheet name terpusat di `Config.js`.
- Semua akses database lewat `Repository.js`.
- Semua action frontend lewat `callApi(action, payload, token)`.
- Semua page terhubung ke API dan database.
- Button/action membuka page atau modal sesuai konteks.
- SLA memakai jam kerja efektif 08:00-12:00 dan 13:00-17:00.
- Session memakai `94_T_USER_SESSION`.
- Workflow memakai `81_T_WORKFLOW_HISTORY`, `83_T_DOCUMENT_STATUS`, `85_T_SLA_SNAPSHOT`, `88_T_USER_TASK`, `91_T_NOTIFICATION`.

## Cara Install
1. Upload database REV1 sebagai Google Spreadsheet.
2. Ambil Spreadsheet ID.
3. Isi `CONFIG.APP.SPREADSHEET_ID` di `Config.js`.
4. Copy semua file ke folder project clasp.
5. Jalankan:
   ```bash
   clasp push -f
   ```
6. Deploy web app atau buka `/dev`.

## Login
Login membaca:
- `04_M_EMPLOYEE`
- `01_M_USER`
- `05_M_USER_ROLE`
- `02_M_ROLE`

## Catatan Implementasi
Ini adalah full source foundation untuk Apps Script. Semua modul, page, action, modal, service, dan tabel database sudah disiapkan. Detail form spesifik masih dapat diperkaya bertahap tanpa mengubah arsitektur inti.
