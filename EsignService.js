/*************************************************
 * ESIGN SERVICE V9.1
 * Reusable tanda tangan employee.
 * Relasi 1 employee_id = 1 tanda tangan aktif.
 * Hotfix: tetap simpan ke database meskipun Drive gagal.
 *************************************************/

class EsignService {
  static sheetName_() {
    return (CONFIG.SHEET && CONFIG.SHEET.EMPLOYEE_ESIGN) || "24_M_EMPLOYEE_ESIGN";
  }

  static headers_() {
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

  static ss_() {
    return SpreadsheetApp.openById(CONFIG.APP.SPREADSHEET_ID);
  }

  static ensureSheet_() {
    const ss = this.ss_();
    const sheetName = this.sheetName_();
    let sh = ss.getSheetByName(sheetName);

    if (!sh) {
      sh = ss.insertSheet(sheetName);
      sh.getRange(1, 1, 1, this.headers_().length).setValues([this.headers_()]);
      sh.setFrozenRows(1);
      return sh;
    }

    let existingHeaders = sh.getLastColumn()
      ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function(h){ return String(h || "").trim(); })
      : [];

    if (!existingHeaders.length || existingHeaders[0] !== "esign_id") {
      sh.clear();
      sh.getRange(1, 1, 1, this.headers_().length).setValues([this.headers_()]);
      sh.setFrozenRows(1);
      return sh;
    }

    // Tambahkan header baru tanpa menghapus data lama.
    const required = this.headers_();
    required.forEach(function(h) {
      if (existingHeaders.indexOf(h) === -1) {
        sh.getRange(1, sh.getLastColumn() + 1).setValue(h);
        existingHeaders.push(h);
      }
    });

    return sh;
  }

  static setup(payload, user) {
    this.ensureSheet_();
    return {
      success: true,
      message: "Sheet 24_M_EMPLOYEE_ESIGN siap digunakan.",
      sheet_name: this.sheetName_(),
      relation: "employee_id",
      rule: "1 employee hanya boleh memiliki 1 tanda tangan aktif",
      headers: this.headers_()
    };
  }

  static findEmployee_(employeeId) {
    const rows = Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE);
    return rows.find(function(e) {
      return String(e.employee_id || "") === String(employeeId || "");
    }) || null;
  }

  static listRows_() {
    this.ensureSheet_();
    return Repository.safeGetAll(this.sheetName_());
  }

  static getByEmployee(payload, user) {
    try {
      const employeeId = String((payload && payload.employee_id) || "").trim();
      if (!employeeId) return { success: false, message: "employee_id wajib dikirim." };

      const employee = this.findEmployee_(employeeId);
      if (!employee) return { success: false, message: "Employee ID tidak ditemukan di 04_M_EMPLOYEE: " + employeeId };

      const rows = this.listRows_();
      const activeRows = rows.filter(function(r) {
        const active = String(r.is_active !== undefined ? r.is_active : "1").toUpperCase();
        return String(r.employee_id || "") === employeeId && (active === "1" || active === "TRUE" || active === "ACTIVE");
      });

      const sign = activeRows.length ? activeRows[activeRows.length - 1] : null;

      return {
        success: true,
        found: !!sign,
        employee: {
          employee_id: employeeId,
          employee_name: employee.full_name || employee.nama_lengkap || employee.name || ""
        },
        data: sign ? {
          esign_id: sign.esign_id || "",
          employee_id: sign.employee_id || "",
          employee_name: sign.employee_name || "",
          file_name: sign.file_name || "",
          file_type: sign.file_type || "",
          file_url: sign.file_url || "",
          file_id: sign.file_id || "",
          file_data_url: sign.file_data_url || "",
          sign_source: sign.sign_source || "",
          is_active: sign.is_active || 1,
          save_status: sign.save_status || ""
        } : null
      };
    } catch (err) {
      return { success: false, message: "Gagal load e-sign: " + (err.message || err) };
    }
  }

  static save(payload, user) {
    try {
      payload = payload || {};
      const employeeId = String(payload.employee_id || "").trim();
      if (!employeeId) return { success: false, message: "employee_id wajib dikirim." };

      const employee = this.findEmployee_(employeeId);
      if (!employee) return { success: false, message: "Employee ID tidak ditemukan di 04_M_EMPLOYEE: " + employeeId };

      const dataUrl = String(payload.data_url || "");
      if (!dataUrl) return { success: false, message: "Data tanda tangan kosong." };

      const now = new Date();
      const fileName = payload.file_name || ("esign_" + employeeId + ".png");
      const employeeName = employee.full_name || employee.nama_lengkap || employee.name || payload.employee_name || "";
      const esignId = "ESIGN-" + employeeId + "-" + Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyyMMddHHmmss");

      let fileUrl = "";
      let fileId = "";
      let saveStatus = "DB_ONLY";
      let errorMessage = "";

      // Drive disimpan sebagai pendukung. Jika gagal, database tetap terisi dengan file_data_url.
      try {
        const base64 = dataUrl.split(",").pop();
        const bytes = Utilities.base64Decode(base64);
        const blob = Utilities.newBlob(bytes, "image/png", fileName);
        const driveFile = DriveApp.createFile(blob);
        fileUrl = driveFile.getUrl();
        fileId = driveFile.getId();
        saveStatus = "DRIVE_AND_DB";
      } catch (driveErr) {
        errorMessage = "Drive save failed: " + (driveErr.message || driveErr);
        Logger.log(errorMessage);
      }

      const sh = this.ensureSheet_();
      this.deactivateOld_(employeeId);

      const rowObj = {
        esign_id: esignId,
        employee_id: employeeId,
        employee_name: employeeName,
        file_name: fileName,
        file_type: "image/png",
        file_url: fileUrl,
        file_id: fileId,
        file_data_url: dataUrl,
        sign_source: payload.sign_source || "DRAW",
        is_active: 1,
        save_status: saveStatus,
        error_message: errorMessage,
        created_at: now,
        created_by: (user && user.user_id) || "SYSTEM",
        updated_at: now
      };

      const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
      sh.appendRow(headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ""; }));
      SpreadsheetApp.flush();

      return {
        success: true,
        message: saveStatus === "DRIVE_AND_DB"
          ? "E-sign berhasil disimpan ke Drive dan database."
          : "E-sign berhasil disimpan ke database. Drive gagal, tetapi tanda tangan tetap bisa digunakan ulang.",
        data: {
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
      return { success: false, message: "Gagal simpan e-sign: " + (err.message || err) };
    }
  }

  static deactivateOld_(employeeId) {
    const sh = this.ensureSheet_();
    const values = sh.getDataRange().getValues();
    if (values.length < 2) return;

    const headers = values[0].map(String);
    const empCol = headers.indexOf("employee_id") + 1;
    const activeCol = headers.indexOf("is_active") + 1;
    const updatedCol = headers.indexOf("updated_at") + 1;

    if (!empCol || !activeCol) return;

    for (let r = 2; r <= values.length; r++) {
      if (String(sh.getRange(r, empCol).getValue()) === String(employeeId)) {
        sh.getRange(r, activeCol).setValue(0);
        if (updatedCol) sh.getRange(r, updatedCol).setValue(new Date());
      }
    }
  }

  static debug(payload, user) {
    this.ensureSheet_();
    const rows = Repository.safeGetAll(this.sheetName_());
    return {
      success: true,
      sheet_name: this.sheetName_(),
      total_rows: rows.length,
      active_rows: rows.filter(function(r) {
        const active = String(r.is_active !== undefined ? r.is_active : "1").toUpperCase();
        return active === "1" || active === "TRUE" || active === "ACTIVE";
      }).length,
      sample: rows.slice(-5)
    };
  }
}

function setupEsignMasterDirectV91() {
  return EsignService.setup({}, { user_id: "SYSTEM" });
}

function setupEsignMasterDirectV89() {
  return setupEsignMasterDirectV91();
}

function setupEsignMasterDirectV88() {
  return setupEsignMasterDirectV91();
}

function getEmployeeEsignDirectV88(payload) {
  return EsignService.getByEmployee(payload || {}, { user_id: "SYSTEM" });
}

function getEmployeeEsignDirectV90(payload) {
  return getEmployeeEsignDirectV88(payload || {});
}

function saveEmployeeEsignDirectV88(payload) {
  return EsignService.save(payload || {}, { user_id: "SYSTEM" });
}

function saveEmployeeEsignDirectV90(payload) {
  return saveEmployeeEsignDirectV88(payload || {});
}

function debugEmployeeEsignDirectV89() {
  const result = EsignService.debug({}, { user_id: "SYSTEM" });
  Logger.log("===== DEBUG EMPLOYEE ESIGN =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function testEsignMasterDirectV88() {
  return setupEsignMasterDirectV91();
}

function testEsignMasterDirectV89() {
  return setupEsignMasterDirectV91();
}

function testEsignMasterDirectV91() {
  return setupEsignMasterDirectV91();
}

function testEsignSaveDummyV90(employeeId) {
  return testEsignSaveDummyV91(employeeId);
}

function testEsignSaveDummyV91(employeeId) {
  employeeId = employeeId || "";
  if (!employeeId) {
    const employees = Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE).filter(function(e) { return e.employee_id; });
    employeeId = employees.length ? employees[0].employee_id : "";
  }
  if (!employeeId) return { success:false, message:"Tidak ada employee untuk test." };

  const onePixelPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
  const result = EsignService.save({
    employee_id: employeeId,
    file_name: "test_esign_" + employeeId + ".png",
    file_type: "image/png",
    data_url: onePixelPng,
    sign_source: "TEST"
  }, { user_id:"SYSTEM" });

  Logger.log("===== TEST ESIGN SAVE DUMMY V9.1 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}


function debugEmployeeEsignDirectV92() {
  return debugEmployeeEsignDirectV89();
}


function saveEmployeeEsignDirectV93(payload) {
  try {
    payload = payload || {};
    const result = EsignService.save(payload, { user_id: "SYSTEM" });
    Logger.log("===== SAVE EMPLOYEE ESIGN DIRECT V9.3 =====");
    Logger.log(JSON.stringify({
      employee_id: payload.employee_id || "",
      has_data_url: !!payload.data_url,
      data_url_length: payload.data_url ? String(payload.data_url).length : 0,
      result: result
    }, null, 2));
    return result;
  } catch (err) {
    const result = { success: false, message: "saveEmployeeEsignDirectV93 error: " + (err.message || err) };
    Logger.log(JSON.stringify(result));
    return result;
  }
}

function testEsignSaveDummyV93(employeeId) {
  employeeId = employeeId || "";
  if (!employeeId) {
    const employees = Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE).filter(function(e) { return e.employee_id; });
    employeeId = employees.length ? employees[0].employee_id : "";
  }
  if (!employeeId) return { success:false, message:"Tidak ada employee untuk test." };
  const onePixelPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
  return saveEmployeeEsignDirectV93({
    employee_id: employeeId,
    file_name: "test_esign_v93_" + employeeId + ".png",
    file_type: "image/png",
    data_url: onePixelPng,
    sign_source: "TEST_V93"
  });
}
