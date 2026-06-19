
/*************************************************
 * ESIGN DIRECT APPEND V9.4
 * Emergency direct save:
 * - tanpa DriveApp
 * - tanpa Repository
 * - langsung appendRow ke 24_M_EMPLOYEE_ESIGN
 *************************************************/

function esignV94_sheetName_() {
  return "24_M_EMPLOYEE_ESIGN";
}

function esignV94_headers_() {
  return [
    "esign_id",
    "employee_id",
    "employee_name",
    "file_name",
    "file_type",
    "file_url",
    "file_id",
    "file_data_url",
    "sign_source",
    "is_active",
    "save_status",
    "error_message",
    "created_at",
    "created_by",
    "updated_at"
  ];
}

function esignV94_ss_() {
  var id = String(CONFIG.APP.SPREADSHEET_ID || "").trim();
  if (id) return SpreadsheetApp.openById(id);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function esignV94_ensureSheet_() {
  var ss = esignV94_ss_();
  var sh = ss.getSheetByName(esignV94_sheetName_());

  if (!sh) {
    sh = ss.insertSheet(esignV94_sheetName_());
    sh.getRange(1, 1, 1, esignV94_headers_().length).setValues([esignV94_headers_()]);
    sh.setFrozenRows(1);
    SpreadsheetApp.flush();
    return sh;
  }

  var required = esignV94_headers_();
  var lastCol = sh.getLastColumn();

  if (lastCol < 1) {
    sh.getRange(1, 1, 1, required.length).setValues([required]);
    sh.setFrozenRows(1);
    SpreadsheetApp.flush();
    return sh;
  }

  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
    return String(h || "").trim();
  });

  if (!headers[0] || headers[0] !== "esign_id") {
    sh.clear();
    sh.getRange(1, 1, 1, required.length).setValues([required]);
    sh.setFrozenRows(1);
    SpreadsheetApp.flush();
    return sh;
  }

  required.forEach(function(h) {
    if (headers.indexOf(h) === -1) {
      sh.getRange(1, sh.getLastColumn() + 1).setValue(h);
      headers.push(h);
    }
  });

  SpreadsheetApp.flush();
  return sh;
}

function esignV94_getEmployee_(employeeId) {
  var ss = esignV94_ss_();
  var sh = ss.getSheetByName(CONFIG.SHEET.EMPLOYEE || "04_M_EMPLOYEE");
  if (!sh) return null;

  var values = sh.getDataRange().getValues();
  if (values.length < 2) return null;

  var headers = values[0].map(function(h) { return String(h || "").trim(); });
  var idCol = headers.indexOf("employee_id");
  if (idCol === -1) return null;

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(employeeId)) {
      var obj = {};
      headers.forEach(function(h, idx) { if (h) obj[h] = values[i][idx]; });
      return obj;
    }
  }

  return null;
}

function esignV94_deactivateOld_(employeeId) {
  var sh = esignV94_ensureSheet_();
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return;

  var headers = values[0].map(function(h) { return String(h || "").trim(); });
  var empCol = headers.indexOf("employee_id") + 1;
  var activeCol = headers.indexOf("is_active") + 1;
  var updatedCol = headers.indexOf("updated_at") + 1;

  if (!empCol || !activeCol) return;

  for (var r = 2; r <= values.length; r++) {
    if (String(sh.getRange(r, empCol).getValue()) === String(employeeId)) {
      sh.getRange(r, activeCol).setValue(0);
      if (updatedCol) sh.getRange(r, updatedCol).setValue(new Date());
    }
  }
}

function saveEmployeeEsignDirectV94(payload) {
  try {
    payload = payload || {};

    var employeeId = String(payload.employee_id || "").trim();
    var dataUrl = String(payload.data_url || "").trim();

    if (!employeeId) return { success:false, message:"employee_id kosong." };
    if (!dataUrl) return { success:false, message:"data_url tanda tangan kosong." };

    var employee = esignV94_getEmployee_(employeeId);
    if (!employee) {
      return {
        success:false,
        message:"Employee ID tidak ditemukan di 04_M_EMPLOYEE: " + employeeId
      };
    }

    var now = new Date();
    var esignId = "ESIGN-" + employeeId + "-" + Utilities.formatDate(now, CONFIG.APP.TIMEZONE || Session.getScriptTimeZone(), "yyyyMMddHHmmss");
    var employeeName = employee.full_name || employee.nama_lengkap || employee.name || "";

    var sh = esignV94_ensureSheet_();
    esignV94_deactivateOld_(employeeId);

    var rowObj = {
      esign_id: esignId,
      employee_id: employeeId,
      employee_name: employeeName,
      file_name: payload.file_name || ("esign_" + employeeId + ".png"),
      file_type: "image/png",
      file_url: "",
      file_id: "",
      file_data_url: dataUrl,
      sign_source: payload.sign_source || "DRAW",
      is_active: 1,
      save_status: "DB_DIRECT_V94",
      error_message: "",
      created_at: now,
      created_by: "SYSTEM",
      updated_at: now
    };

    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function(h) {
      return String(h || "").trim();
    });

    sh.appendRow(headers.map(function(h) {
      return rowObj[h] !== undefined ? rowObj[h] : "";
    }));

    SpreadsheetApp.flush();

    return {
      success:true,
      message:"E-sign berhasil disimpan langsung ke database.",
      data:{
        esign_id: esignId,
        employee_id: employeeId,
        employee_name: employeeName,
        file_name: rowObj.file_name,
        file_data_url: dataUrl,
        file_url: "",
        save_status: "DB_DIRECT_V94",
        is_active: 1
      }
    };
  } catch (err) {
    return {
      success:false,
      message:"saveEmployeeEsignDirectV94 error: " + (err.message || err)
    };
  }
}

function testEsignSaveDummyV94(employeeId) {
  employeeId = employeeId || "";

  if (!employeeId) {
    var ss = esignV94_ss_();
    var sh = ss.getSheetByName(CONFIG.SHEET.EMPLOYEE || "04_M_EMPLOYEE");
    if (!sh) return { success:false, message:"Sheet employee tidak ditemukan." };

    var values = sh.getDataRange().getValues();
    var headers = values[0].map(function(h) { return String(h || "").trim(); });
    var idCol = headers.indexOf("employee_id");

    if (idCol === -1 || values.length < 2) return { success:false, message:"employee_id tidak ditemukan." };
    employeeId = String(values[1][idCol] || "");
  }

  var onePixelPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
  var result = saveEmployeeEsignDirectV94({
    employee_id: employeeId,
    file_name: "test_esign_v94_" + employeeId + ".png",
    file_type: "image/png",
    data_url: onePixelPng,
    sign_source: "TEST_V94"
  });

  Logger.log("===== TEST ESIGN SAVE DUMMY V9.4 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function debugEmployeeEsignDirectV94() {
  var sh = esignV94_ensureSheet_();
  var values = sh.getDataRange().getValues();
  var last = values.slice(Math.max(1, values.length - 5));
  Logger.log("===== DEBUG ESIGN V9.4 =====");
  Logger.log(JSON.stringify({ total_rows: Math.max(0, values.length - 1), last_rows: last }, null, 2));
  return { success:true, total_rows: Math.max(0, values.length - 1), last_rows: last };
}


/*************************************************
 * ESIGN DIRECT SAVE V9.7
 * Perbaikan file_url/file_id:
 * - coba simpan PNG ke Drive
 * - jika Drive gagal, file_url diisi data_url agar link tidak about:blank
 * - file_id fallback diisi esign_id
 *************************************************/
function saveEmployeeEsignDirectV97(payload) {
  try {
    payload = payload || {};

    var employeeId = String(payload.employee_id || "").trim();
    var dataUrl = String(payload.data_url || "").trim();

    if (!employeeId) return { success:false, message:"employee_id kosong." };
    if (!dataUrl) return { success:false, message:"data_url tanda tangan kosong." };

    var employee = esignV94_getEmployee_(employeeId);
    if (!employee) {
      return {
        success:false,
        message:"Employee ID tidak ditemukan di 04_M_EMPLOYEE: " + employeeId
      };
    }

    var now = new Date();
    var esignId = "ESIGN-" + employeeId + "-" + Utilities.formatDate(now, CONFIG.APP.TIMEZONE || Session.getScriptTimeZone(), "yyyyMMddHHmmss");
    var employeeName = employee.full_name || employee.nama_lengkap || employee.name || "";
    var fileName = payload.file_name || ("esign_" + employeeId + ".png");

    var fileUrl = "";
    var fileId = "";
    var saveStatus = "DB_DATA_URL";
    var errorMessage = "";

    // Coba simpan sebagai file PNG ke Google Drive.
    try {
      var base64 = dataUrl.split(",").pop();
      var bytes = Utilities.base64Decode(base64);
      var blob = Utilities.newBlob(bytes, "image/png", fileName);
      var driveFile = DriveApp.createFile(blob);
      fileUrl = driveFile.getUrl();
      fileId = driveFile.getId();
      saveStatus = "DRIVE_AND_DB";
    } catch (driveErr) {
      errorMessage = "Drive gagal, fallback ke data_url: " + (driveErr.message || driveErr);
      fileUrl = dataUrl;     // supaya link Buka file sign tidak about:blank
      fileId = esignId;      // fallback agar file_id tidak kosong
      saveStatus = "DB_DATA_URL";
    }

    var sh = esignV94_ensureSheet_();
    esignV94_deactivateOld_(employeeId);

    var rowObj = {
      esign_id: esignId,
      employee_id: employeeId,
      employee_name: employeeName,
      file_name: fileName,
      file_type: "image/png",
      file_url: fileUrl,
      file_id: fileId,
      file_data_url: dataUrl,
      sign_source: payload.sign_source || "DRAW_V97",
      is_active: 1,
      save_status: saveStatus,
      error_message: errorMessage,
      created_at: now,
      created_by: "SYSTEM",
      updated_at: now
    };

    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function(h) {
      return String(h || "").trim();
    });

    sh.appendRow(headers.map(function(h) {
      return rowObj[h] !== undefined ? rowObj[h] : "";
    }));

    SpreadsheetApp.flush();

    return {
      success:true,
      message: saveStatus === "DRIVE_AND_DB"
        ? "E-sign berhasil disimpan ke Drive dan database."
        : "E-sign berhasil disimpan ke database sebagai data URL.",
      data:{
        esign_id: esignId,
        employee_id: employeeId,
        employee_name: employeeName,
        file_name: fileName,
        file_url: fileUrl,
        file_id: fileId,
        file_data_url: dataUrl,
        save_status: saveStatus,
        is_active: 1
      }
    };
  } catch (err) {
    return {
      success:false,
      message:"saveEmployeeEsignDirectV97 error: " + (err.message || err)
    };
  }
}

function testEsignSaveDummyV97(employeeId) {
  employeeId = employeeId || "";

  if (!employeeId) {
    var ss = esignV94_ss_();
    var sh = ss.getSheetByName(CONFIG.SHEET.EMPLOYEE || "04_M_EMPLOYEE");
    if (!sh) return { success:false, message:"Sheet employee tidak ditemukan." };

    var values = sh.getDataRange().getValues();
    var headers = values[0].map(function(h) { return String(h || "").trim(); });
    var idCol = headers.indexOf("employee_id");

    if (idCol === -1 || values.length < 2) return { success:false, message:"employee_id tidak ditemukan." };
    employeeId = String(values[1][idCol] || "");
  }

  var onePixelPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
  var result = saveEmployeeEsignDirectV97({
    employee_id: employeeId,
    file_name: "test_esign_v97_" + employeeId + ".png",
    file_type: "image/png",
    data_url: onePixelPng,
    sign_source: "TEST_V97"
  });

  Logger.log("===== TEST ESIGN SAVE DUMMY V9.7 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
