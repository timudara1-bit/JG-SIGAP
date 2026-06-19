JG-SIGAP V3 SLA SNAPSHOT AUTO CREATE V8.5

Jawaban:
85_T_SLA_SNAPSHOT seharusnya berasal dari perhitungan SLA atas dokumen aktif.
Sumber acuannya adalah:
- 10_T_FPB_HEADER sebagai dokumen masuk
- 08_M_SLA sebagai master SLA per step dan priority
- 83_T_DOCUMENT_STATUS sebagai posisi dokumen saat ini

Sebelumnya 85_T_SLA_SNAPSHOT belum otomatis terisi karena service FPB baru menyimpan header/detail FPB.
Dashboard sebelumnya juga sempat membaca SLA snapshot sebagai sumber utama, sehingga total kosong ketika snapshot belum dibuat.

Perbaikan V8.5:
1. Saat FPB dibuat/submitted, sistem otomatis insert:
   - 83_T_DOCUMENT_STATUS
   - 85_T_SLA_SNAPSHOT
   - 95_R_DASHBOARD jika sheet tersedia

2. SLA diambil dari 08_M_SLA berdasarkan:
   document_type = FPB
   step_code = FPB_SUBMITTED / FPB_DRAFT
   priority_code = LOW / NORMAL / URGENT / HIGH

3. Field SLA otomatis:
   - start_time
   - warning_time
   - due_time
   - sla_work_hour
   - remaining_work_hour
   - sla_status = ON_TRACK
   - document_status

4. Ditambahkan rebuild untuk data FPB lama:
   testSLASnapshotDirectV85()
   testSLASnapshotLogV85()
   rebuildFPBSLADirectV85()

File update:
- FPBService.js
- DashboardService.js
- FPBDirectApiV79.js
- FPBDebugLoggerV77.js

Setelah extract:
clasp push -f

Untuk mengisi SLA snapshot dari data FPB yang sudah telanjur ada, jalankan di Apps Script editor:
testSLASnapshotDirectV85()

Setelah itu cek sheet:
85_T_SLA_SNAPSHOT

Lalu:
Ctrl + F5
Dashboard -> Refresh
