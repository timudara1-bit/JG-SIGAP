//Dummy Work Flow Data Tabel 81_T_WORKFLOW_HISTORY
function insertDummyWorkflowData() {

  const sh = SpreadsheetApp.getActive()
    .getSheetByName("81_T_WORKFLOW_HISTORY");

  const data = [];

  const steps = [
    "CREATE_FPB",
    "APPROVAL_L1",
    "APPROVAL_L2",
    "VERIFY_GA",
    "APPROVE_FAT",
    "APPROVE_IA",
    "CREATE_PP",
    "CREATE_PR",
    "RECEIVE",
    "INVOICE",
    "PAYMENT"
  ];

  for (let doc = 1; doc <= 20; doc++) {

    const docNo =
      "FPB202606" +
      String(doc).padStart(4, "0");

    steps.forEach((step, idx) => {

      const start =
        new Date(2026, 5, idx + 1, 8, 0, 0);

      const duration =
        Math.floor(Math.random() * 24) + 2;

      const end =
        new Date(start.getTime() +
          duration * 60 * 60 * 1000);

      data.push([
        "WF" + Utilities.getUuid().substring(0,8),
        "FPB",
        docNo,
        step,
        start,
        end,
        duration,
        "USR" + (idx + 1),
        "DONE"
      ]);

    });

  }

  sh.getRange(
    sh.getLastRow() + 1,
    1,
    data.length,
    data[0].length
  ).setValues(data);

  Logger.log(
    data.length + " workflow inserted"
  );

}

function clearWorkflowHistory() {

  const sh = SpreadsheetApp.getActive()
    .getSheetByName("81_T_WORKFLOW_HISTORY");

  const lastRow = sh.getLastRow();

  if(lastRow > 1){

    sh.getRange(
      2,
      1,
      lastRow - 1,
      sh.getLastColumn()
    ).clearContent();

  }

}


//Dummy SLA Tabel 08_M_SLA
function insertDummySLA() {

  const sh = SpreadsheetApp.getActive()
    .getSheetByName("08_M_SLA");

  const data = [

    [
      1,"FPB","FPB","USER","GA","ALL",
      "HIGH",48,2,80,1,
      "2026-01-01","9999-12-31",
      new Date(),"SYSTEM","",""
    ],

    [
      2,"GA","GA","STAFF","GA","ALL",
      "HIGH",24,1,80,1,
      "2026-01-01","9999-12-31",
      new Date(),"SYSTEM","",""
    ],

    [
      3,"FA","FA","FINANCE","FINANCE","ALL",
      "HIGH",48,2,85,1,
      "2026-01-01","9999-12-31",
      new Date(),"SYSTEM","",""
    ],

    [
      4,"IA","IA","AUDITOR","IA","ALL",
      "HIGH",72,3,90,1,
      "2026-01-01","9999-12-31",
      new Date(),"SYSTEM","",""
    ],

    [
      5,"PP","PP","MANAGER","GA","ALL",
      "HIGH",48,2,85,1,
      "2026-01-01","9999-12-31",
      new Date(),"SYSTEM","",""
    ],

    [
      6,"PR","PR","PURCHASING","PROC","ALL",
      "HIGH",24,1,85,1,
      "2026-01-01","9999-12-31",
      new Date(),"SYSTEM","",""
    ],

    [
      7,"RECEIVE","RECEIVE","WAREHOUSE","LOGISTIC","ALL",
      "HIGH",24,1,90,1,
      "2026-01-01","9999-12-31",
      new Date(),"SYSTEM","",""
    ],

    [
      8,"INVOICE","INVOICE","FINANCE","FINANCE","ALL",
      "HIGH",24,1,90,1,
      "2026-01-01","9999-12-31",
      new Date(),"SYSTEM","",""
    ],

    [
      9,"PAYMENT","PAYMENT","FINANCE","FINANCE","ALL",
      "HIGH",72,3,95,1,
      "2026-01-01","9999-12-31",
      new Date(),"SYSTEM","",""
    ]

  ];

  const lastRow = sh.getLastRow();

  sh.getRange(
    lastRow + 1,
    1,
    data.length,
    data[0].length
  ).setValues(data);

  Logger.log("Dummy SLA inserted : " + data.length);

}

function clearSLA() {

  const sh = SpreadsheetApp.getActive()
    .getSheetByName("08_M_SLA");

  const lastRow = sh.getLastRow();

  if(lastRow > 1){

    sh.getRange(
      2,
      1,
      lastRow - 1,
      sh.getLastColumn()
    ).clearContent();

  }

}

// insertDummySLA
function insertDummySLA(){

  const sheet = SpreadsheetApp.getActive().getSheetByName("08_M_SLA");

  const data = [

    ["id","process_code","step_code","role_code","department_code","vendor_code","priority","sla_hours","sla_days","warning_percent","is_active","effective_from","effective_to","created_at","created_by","updated_at","updated_by"],

    [1,"FPB","FPB","USER","GA","ALL","HIGH",48,2,80,1,"2026-01-01","9999-12-31","2026-06-01","SYSTEM","",""],
    [2,"GA","GA","STAFF","GA","ALL","HIGH",24,1,80,1,"2026-01-01","9999-12-31","2026-06-01","SYSTEM","",""],
    [3,"FA","FA","FINANCE","FINANCE","ALL","HIGH",48,2,85,1,"2026-01-01","9999-12-31","2026-06-01","SYSTEM","",""],
    [4,"IA","IA","AUDITOR","IA","ALL","HIGH",72,3,90,1,"2026-01-01","9999-12-31","2026-06-01","SYSTEM","",""],
    [5,"PP","PP","MANAGER","MGMT","ALL","HIGH",48,2,85,1,"2026-01-01","9999-12-31","2026-06-01","SYSTEM","",""]

  ];

  sheet.clear();
  sheet.getRange(1,1,data.length,data[0].length).setValues(data);

}



