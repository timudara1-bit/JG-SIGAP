function getSheetData(sheetName){

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if(!sheet) throw new Error("Sheet not found: " + sheetName);

  return sheet.getDataRange().getValues();

}