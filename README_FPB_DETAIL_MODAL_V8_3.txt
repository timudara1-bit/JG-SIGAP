JG-SIGAP V3 FPB DETAIL MODAL V8.3

Fitur baru:
1. Nomor FPB di tabel bisa diklik.
2. Saat nomor FPB diklik, tampil modal detail FPB.
3. Modal detail menampilkan:
   - Nomor FPB
   - Tanggal FPB
   - Requester
   - Department
   - Company
   - Cost Center
   - Priority
   - Status
   - Keperluan / Tujuan
4. Modal detail juga menampilkan list item dari 11_T_FPB_DETAIL.
5. Ringkasan:
   - Total item
   - Total qty
   - Estimasi total

File update:
- FPBService.js
- FPBDirectApiV79.js
- ApiController.js
- JS_app.html
- CSS_app.html

Function baru:
- FPBService.getDetail(payload, user)
- fpbDetailDirectV83(payload)
- testFPBDetailDirectV83()

Setelah extract:
clasp push -f
Ctrl + F5

Tes:
1. Apps Script editor: testFPBDetailDirectV83()
2. Browser: FPB -> klik nomor FPB
