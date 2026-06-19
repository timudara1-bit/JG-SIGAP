JG-SIGAP V3 FPB FORM REDESIGN ESIGN ATTACHMENT V8.6

Perombakan form FPB:
1. Cost Center dihapus dari form FPB.
2. Category dihapus dari detail barang/jasa.
3. UOM tidak lagi input manual.
   - UOM menjadi dropdown.
   - Sumber data UOM dari database sheet 23_M_UOM.
   - Jika 23_M_UOM belum ada, sistem otomatis membuat sheet tersebut dengan default:
     PCS, UNIT, SET, BOX, PACK, METER, ROLL, KG, LITER, LS.

4. Requester wajib mengisi e-sign:
   - Field: E-sign Requester.
   - Disimpan sebagai approval level 0 pada 80_T_APPROVAL.
   - Status: SIGNED.

5. Approval awal otomatis dibuat:
   - REQUESTER_ESIGN = SIGNED
   - REQUESTER_LEADER_APPROVAL = PENDING
   - GA_HEAD_ESIGN_CHECK = PENDING

6. Lampiran PDF wajib diupload saat membuat FPB:
   - File PDF disimpan ke Google Drive.
   - Metadata file dicatat di 78_T_DOCUMENT_ATTACHMENT.
   - Kategori lampiran: FPB_PENGAJUAN.

7. Detail modal FPB ikut menampilkan:
   - Lampiran PDF
   - Alur approval/e-sign
   - List item FPB

File update:
- Config.js
- FPBService.js
- FPBDirectApiV79.js
- FPBDebugLoggerV77.js
- JS_app.html
- CSS_app.html

Function baru:
- setupUOMMasterDirectV86()
- testUOMMasterDirectV86()
- testUOMMasterLogV86()

Setelah extract:
clasp push -f

Langkah awal:
1. Jalankan di Apps Script editor:
   testUOMMasterDirectV86()

2. Pastikan sheet 23_M_UOM muncul.

3. Ctrl + F5

Tes:
FPB -> Tambah FPB
- pilih requester
- department/company otomatis terisi
- isi e-sign requester
- upload PDF
- detail item pilih UOM dari dropdown
- simpan FPB
- klik nomor FPB untuk melihat lampiran dan approval.
