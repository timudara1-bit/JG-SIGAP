function fpbSanitizeForClientV81(value) {
  if (value === null || value === undefined) return value;

  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  if (Array.isArray(value)) {
    return value.map(function(v) { return fpbSanitizeForClientV81(v); });
  }

  if (typeof value === "object") {
    const out = {};
    Object.keys(value).forEach(function(k) {
      out[k] = fpbSanitizeForClientV81(value[k]);
    });
    return out;
  }

  return value;
}

/*************************************************
 * FPB DIRECT API V7.9
 * Fungsi global khusus untuk google.script.run.
 * Nama dibuat unik agar tidak bentrok dengan router/action lama.
 *************************************************/

function fpbListDirectV79(payload) {
  try {
    const result = FPBService.list(payload || {}, { user_id: "SYSTEM" });
    Logger.log("fpbListDirectV79 RESULT = " + JSON.stringify(result));
    return fpbSanitizeForClientV81(result || { success: false, message: "FPBService.list return null", data: [] });
  } catch (err) {
    Logger.log("fpbListDirectV79 ERROR = " + (err.message || err));
    return { success: false, message: "fpbListDirectV79 error: " + (err.message || err), data: [] };
  }
}

function fpbInitDirectV79(payload) {
  try {
    const result = FPBService.getInitData(payload || {}, { user_id: "SYSTEM" });
    Logger.log("fpbInitDirectV79 RESULT = " + JSON.stringify({
      success: result && result.success,
      total_fpbs: result && result.data && result.data.fpbs ? result.data.fpbs.length : 0
    }));
    return fpbSanitizeForClientV81(result || { success: false, message: "FPBService.getInitData return null" });
  } catch (err) {
    Logger.log("fpbInitDirectV79 ERROR = " + (err.message || err));
    return { success: false, message: "fpbInitDirectV79 error: " + (err.message || err) };
  }
}

function fpbCreateDirectV79(payload) {
  try {
    const result = FPBService.create(payload || {}, { user_id: "SYSTEM" });
    Logger.log("fpbCreateDirectV79 RESULT = " + JSON.stringify(result));
    return fpbSanitizeForClientV81(result || { success: false, message: "FPBService.create return null" });
  } catch (err) {
    Logger.log("fpbCreateDirectV79 ERROR = " + (err.message || err));
    return { success: false, message: "fpbCreateDirectV79 error: " + (err.message || err) };
  }
}

function fpbSearchRequesterDirectV79(payload) {
  try {
    const result = FPBService.searchEmployees(payload || {}, { user_id: "SYSTEM" });
    return fpbSanitizeForClientV81(result || { success: false, message: "FPBService.searchEmployees return null", data: [] });
  } catch (err) {
    return { success: false, message: "fpbSearchRequesterDirectV79 error: " + (err.message || err), data: [] };
  }
}

function fpbPreviewNoDirectV79(payload) {
  try {
    const result = FPBService.previewNumber(payload || {}, { user_id: "SYSTEM" });
    return fpbSanitizeForClientV81(result || { success: false, message: "FPBService.previewNumber return null" });
  } catch (err) {
    return { success: false, message: "fpbPreviewNoDirectV79 error: " + (err.message || err) };
  }
}

function testFPBDirectV79() {
  const result = fpbListDirectV79({});
  Logger.log("===== TEST FPB DIRECT V7.9 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}


function testFPBDirectSimpleV80() {
  const result = fpbListDirectV79({});
  Logger.log("===== TEST FPB DIRECT SIMPLE V8.0 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}


function fpbDetailDirectV83(payload) {
  try {
    const result = FPBService.getDetail(payload || {}, { user_id: "SYSTEM" });
    return fpbSanitizeForClientV81 ? fpbSanitizeForClientV81(result) : result;
  } catch (err) {
    return { success: false, message: "fpbDetailDirectV83 error: " + (err.message || err) };
  }
}

function testFPBDetailDirectV83() {
  const list = FPBService.list({}, { user_id: "TEST" });
  const first = list && list.data && list.data.length ? list.data[0] : {};
  const result = fpbDetailDirectV83({ fpb_id: first.fpb_id, fpb_no: first.fpb_no });
  Logger.log("===== TEST FPB DETAIL DIRECT V8.3 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}


function dashboardDirectV84(payload) {
  try {
    const result = DashboardService.getDashboardData(payload || {}, { user_id: "SYSTEM", roles: [] });
    return fpbSanitizeForClientV81 ? fpbSanitizeForClientV81(result) : result;
  } catch (err) {
    return { success: false, message: "dashboardDirectV84 error: " + (err.message || err) };
  }
}

function testDashboardDirectV84() {
  const result = dashboardDirectV84({});
  Logger.log("===== TEST DASHBOARD DIRECT V8.4 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}


function rebuildFPBSLADirectV85() {
  try {
    const result = FPBService.rebuildSLAForExistingFPB_();
    return fpbSanitizeForClientV81 ? fpbSanitizeForClientV81(result) : result;
  } catch (err) {
    return { success: false, message: "rebuildFPBSLADirectV85 error: " + (err.message || err) };
  }
}

function testSLASnapshotDirectV85() {
  const result = FPBService.rebuildSLAForExistingFPB_();
  const snapshots = Repository.safeGetAll(CONFIG.SHEET.SLA_SNAPSHOT);
  Logger.log("===== TEST SLA SNAPSHOT DIRECT V8.5 =====");
  Logger.log(JSON.stringify({
    rebuild: result,
    total_snapshot: snapshots.length,
    sample: snapshots.slice(-5)
  }, null, 2));
  return {
    success: true,
    rebuild: result,
    total_snapshot: snapshots.length,
    sample: snapshots.slice(-5)
  };
}


function setupUOMMasterDirectV86() {
  try {
    const result = FPBService.setupUOMMasterV86_();
    return fpbSanitizeForClientV81 ? fpbSanitizeForClientV81(result) : result;
  } catch (err) {
    return { success: false, message: "setupUOMMasterDirectV86 error: " + (err.message || err) };
  }
}

function testUOMMasterDirectV86() {
  const result = setupUOMMasterDirectV86();
  Logger.log("===== TEST UOM MASTER V8.6 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
