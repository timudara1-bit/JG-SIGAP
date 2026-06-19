JG-SIGAP V3 FPB GOOGLE SCRIPT RUN EXPLICIT V8.0

Masalah:
Frontend masih menampilkan:
Server return null dari fpbListDirectV79

Penyebab paling mungkin:
Pemanggilan google.script.run sebelumnya memakai dynamic bracket:
google.script.run[functionName](payload)

Pada Google Apps Script HTML Service, pemanggilan dinamis seperti itu sering tidak stabil.
Akibatnya successHandler bisa menerima null.

Perbaikan V8.0:
JS_app.html sekarang memakai pemanggilan eksplisit:
google.script.run.fpbListDirectV79(payload)
google.script.run.fpbInitDirectV79(payload)
google.script.run.fpbCreateDirectV79(payload)
google.script.run.fpbSearchRequesterDirectV79(payload)
google.script.run.fpbPreviewNoDirectV79(payload)

Tidak lagi memakai google.script.run[functionName].

Setelah extract:
clasp push -f
Ctrl + F5

Test Apps Script editor:
testFPBDirectSimpleV80()

Jika test success true:
FPB -> Refresh

Data FPB harus tampil.
