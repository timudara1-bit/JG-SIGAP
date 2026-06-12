class WorkflowService {

  static createWorkflow(documentType, documentId){

    const sheet =
      Repository.getSheet(
        "81_T_WORKFLOW_HISTORY"
      );

    sheet.appendRow([
      Utilities.getUuid(),
      documentType,
      documentId,
      "CREATE",
      new Date(),
      "",
      "",
      SessionService.getSession().user_id,
      "OPEN"
    ]);

  }

  static moveNextStep(
    documentType,
    documentId,
    nextStep
  ){

    const sheet =
      Repository.getSheet(
        "81_T_WORKFLOW_HISTORY"
      );

    sheet.appendRow([
      Utilities.getUuid(),
      documentType,
      documentId,
      nextStep,
      new Date(),
      "",
      "",
      SessionService.getSession().user_id,
      "OPEN"
    ]);

  }

  static completeStep(
    documentType,
    documentId,
    stepName
  ){

    const data =
      sheetData("81_T_WORKFLOW_HISTORY");

    const rowIndex =
      data.findIndex(r =>
        r.document_type === documentType &&
        r.document_id === documentId &&
        r.step_name === stepName &&
        r.status === "OPEN"
      );

    if(rowIndex === -1) return;

    const sheet =
      Repository.getSheet(
        "81_T_WORKFLOW_HISTORY"
      );

    const row = rowIndex + 2;

    const endTime = new Date();

    sheet.getRange(row,6)
      .setValue(endTime);

    sheet.getRange(row,7)
      .setValue(
        (endTime -
        new Date(
          sheet.getRange(row,5).getValue()
        )) / 3600000
      );

    sheet.getRange(row,9)
      .setValue("DONE");

  }

}

function getWorkflowConfig() {

  const sh =
    SpreadsheetApp.getActive()
      .getSheetByName("07_M_WORKFLOW_STEP");

  const data = sh.getDataRange().getValues();

  const result = [];

  for(let i=1; i<data.length; i++){

    result.push({

      sequence_no : data[i][0],
      step_code   : data[i][1],
      step_name   : data[i][2],
      module      : data[i][3],
      next_step   : data[i][4],
      is_active   : data[i][5]

    });

  }

  return result;

}

function getNextStep(stepCode){

  const workflow = getWorkflowConfig();

  const row =
    workflow.find(x => x.step_code === stepCode);

  if(!row) return null;

  return row.next_step;

}

function getModuleByStep(stepCode){

  const workflow = getWorkflowConfig();

  const row =
    workflow.find(x => x.step_code === stepCode);

  return row
    ? row.module
    : null;

}

function getWorkflowProgress(stepCode){

  const workflow = getWorkflowConfig();

  const total =
    workflow.filter(x => x.is_active == 1).length;

  const current =
    workflow.find(x => x.step_code === stepCode);

  if(!current){

    return {
      percent:0
    };

  }

  return {

    currentStep : current.step_name,

    percent :
      Math.round(
        (current.sequence_no / total) * 100
      )

  };

}

function getWorkflowDashboard(){

  return {

    workflow : getWorkflowConfig(),

    sla : getSLADashboardData(),

    heatmap : getSLAHeatmap(),

    bottleneck : getBottleneckAnalysis()

  };

}

function getModuleLoader(module){

  const workflow =
    getWorkflowConfig();

  return workflow
    .filter(x => x.module === module);

}

function createWorkflowHistory(
  documentId,
  stepCode,
  user
){

  const sh =
    getSheet(
      "81_T_WORKFLOW_HISTORY"
    );

  sh.appendRow([

    Utilities.getUuid(),

    "FPB",

    documentId,

    stepCode,

    new Date(),

    new Date(),

    0,

    user,

    "DONE"

  ]);

}