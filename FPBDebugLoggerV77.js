/*************************************************
 * FPB DEBUG LOGGER - V7.7
 * Jalankan fungsi ini dari Apps Script editor.
 *************************************************/

function testFPBListLogV77() {
  const result = FPBService.list({}, { user_id: "TEST" });
  Logger.log("===== TEST FPB LIST V7.7 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function testFPBInitLogV77() {
  const result = FPBService.getInitData({}, { user_id: "TEST" });
  Logger.log("===== TEST FPB INIT V7.7 =====");
  Logger.log(JSON.stringify({
    success: result.success,
    total_fpbs: result.data && result.data.fpbs ? result.data.fpbs.length : 0,
    total_departments: result.data && result.data.departments ? result.data.departments.length : 0,
    total_companies: result.data && result.data.companies ? result.data.companies.length : 0,
    sample_fpb: result.data && result.data.fpbs ? result.data.fpbs.slice(0, 3) : []
  }, null, 2));
  return result;
}

function testFPBSheetLogV77() {
  const shName = CONFIG.SHEET.FPB_HEADER;
  const exists = Repository.exists(shName);
  const headers = exists ? Repository.headers(shName) : [];
  const rows = exists ? Repository.safeGetAll(shName) : [];
  Logger.log("===== TEST FPB SHEET V7.7 =====");
  Logger.log("Sheet name: " + shName);
  Logger.log("Exists: " + exists);
  Logger.log("Headers: " + JSON.stringify(headers));
  Logger.log("Total rows: " + rows.length);
  Logger.log("Sample rows: " + JSON.stringify(rows.slice(0, 5), null, 2));
  return {
    success: true,
    sheet_name: shName,
    exists: exists,
    headers: headers,
    total_rows: rows.length,
    sample_rows: rows.slice(0, 5)
  };
}

function testFPBApiActionLogV77() {
  const result = __handleFPBActionsV76("listFPB", {}, { user_id: "TEST" });
  Logger.log("===== TEST FPB API ACTION V7.7 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}


function testDashboardSyncV84() {
  const result = DashboardService.getDashboardData({}, { user_id: "TEST", roles: [] });
  Logger.log("===== TEST DASHBOARD SYNC V8.4 =====");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}


// Alias test SLA snapshot otomatis V8.5
function testSLASnapshotLogV85() {
  return testSLASnapshotDirectV85();
}


function testUOMMasterLogV86() {
  return testUOMMasterDirectV86();
}
