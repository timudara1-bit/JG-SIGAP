JG-SIGAP V3 FPB DATE SERIALIZE FIX V8.1

Masalah:
Server test FPBService.list sukses dan menampilkan data.
Tetapi google.script.run dari frontend return null.

Penyebab:
Data FPB mengandung object Date dari Google Sheets:
fpb_date: Date object

google.script.run HTML Service sering gagal mengirim object Date ke frontend.
Akibatnya successHandler menerima null.

Perbaikan V8.1:
1. FPBService.list mengubah fpb_date menjadi string yyyy-MM-dd.
2. FPBDirectApiV79.js ditambah sanitizer:
   fpbSanitizeForClientV81()
   untuk membersihkan semua Date object sebelum dikirim ke frontend.

Setelah extract:
clasp push -f
Ctrl + F5

Tes di Apps Script editor:
testFPBDirectSimpleV80()

Lalu buka:
FPB -> Refresh

Data FPB harus tampil.
