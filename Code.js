function include(filename) {

  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();

}

function getHtmlPartial(fileName){

  return HtmlService
    .createHtmlOutputFromFile(fileName)
    .getContent();

}

function logoutUser(){

  return AuthService.logout();

}

function getAllSheetNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  return sheets.map(s => [s.getName()]);
}

function LIST_SHEETS() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets().map(s => [s.getName()]);
}

function getSLAEngineData() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("81_T_WORKFLOW_HISTORY");
  const slaSheet = ss.getSheetByName("08_M_SLA");

  const data = sheet.getDataRange().getValues();
  const sla = slaSheet.getDataRange().getValues();

  const slaMap = {};

  // bikin mapping SLA
  for (let i = 1; i < sla.length; i++) {
    const key = sla[i][0] + "_" + sla[i][1]; // process_step
    slaMap[key] = sla[i][2]; // sla_hours
  }

  let result = [];

  for (let i = 1; i < data.length; i++) {

    const process = data[i][1];
    const step = data[i][2];
    const start = data[i][3];
    const end = data[i][4];

    const key = process + "_" + step;
    const slaHour = slaMap[key] || 0;

    let actualHour = 0;
    let status = "ON GOING";

    if (start && end) {
      actualHour = (new Date(end) - new Date(start)) / 36e5;

      status = actualHour <= slaHour ? "ON TIME" : "DELAY";
    }

    result.push({
      process_code: process,
      step_code: step,
      actual_hours: actualHour,
      sla_hours: slaHour,
      status: status
    });
  }

  return result;
}

function getSLADashboardData() {

  const data = getSLAEngineData();

  const summary = {};

  data.forEach(row => {

    const key = row.process_code;

    if (!summary[key]) {
      summary[key] = {
        total: 0,
        on_time: 0,
        delay: 0
      };
    }

    summary[key].total++;

    if (row.status === "ON TIME") summary[key].on_time++;
    if (row.status === "DELAY") summary[key].delay++;

  });

  let result = [];

  for (let key in summary) {

    const s = summary[key];

    result.push({
      process_code: key,
      on_time: s.on_time,
      delay: s.delay,
      sla_compliance_percent:
        s.total ? (s.on_time / s.total) * 100 : 0
    });

  }

  return result;
}

//SLA HEATMAP ENGINE (BACKEND)

function getSLAHeatmapData() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const history = ss.getSheetByName("81_T_WORKFLOW_HISTORY").getDataRange().getValues();
  const sla = ss.getSheetByName("08_M_SLA").getDataRange().getValues();

  const slaMap = {};

  // map SLA
  for (let i = 1; i < sla.length; i++) {
    const key = sla[i][0] + "_" + sla[i][1];
    slaMap[key] = sla[i][2]; // sla_hours
  }

  const result = [];

  for (let i = 1; i < history.length; i++) {

    const process = history[i][1];
    const step = history[i][2];
    const start = history[i][3];
    const end = history[i][4];

    const key = process + "_" + step;
    const slaHour = slaMap[key] || 0;

    let actualHour = null;
    let status = "ON GOING";
    let severity = 0; // heat score

    if (start && end) {

      actualHour = (new Date(end) - new Date(start)) / 36e5;

      const diff = actualHour - slaHour;

      if (diff <= 0) {
        status = "GREEN";
        severity = 1;
      } else if (diff <= slaHour * 0.2) {
        status = "YELLOW";
        severity = 2;
      } else {
        status = "RED";
        severity = 3;
      }
    }

    result.push({
      process_code: process,
      step_code: step,
      actual_hours: actualHour,
      sla_hours: slaHour,
      status: status,
      severity: severity
    });
  }

  return result;
}

//BOTTLENECK DETECTION ENGINE

function getBottleneckAnalysis() {

  const data = getSLAHeatmapData();

  const map = {};

  data.forEach(r => {

    const key = r.step_code;

    if (!map[key]) {
      map[key] = {
        step: key,
        total: 0,
        delay: 0,
        total_delay_hours: 0
      };
    }

    map[key].total++;

    if (r.status === "RED") {
      map[key].delay++;
      map[key].total_delay_hours += (r.actual_hours || 0);
    }

  });

  let result = [];

  for (let k in map) {

    const d = map[k];

    const delayRatio = d.total ? (d.delay / d.total) * 100 : 0;

    result.push({
      step_code: d.step,
      total: d.total,
      delay: d.delay,
      delay_ratio: delayRatio,
      severity:

        delayRatio > 50 ? "CRITICAL" :
        delayRatio > 25 ? "HIGH" :
        delayRatio > 10 ? "MEDIUM" :
        "LOW"
    });

  }

  return result.sort((a,b) => b.delay_ratio - a.delay_ratio);
}

