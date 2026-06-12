function sheetData(sheetName){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(sheetName);

  const data =
    sheet.getDataRange().getValues();

  const headers =
    data.shift();

  return data.map(row => {

    let obj = {};

    headers.forEach((h,i)=>{

      obj[h] = row[i];

    });

    return obj;

  });

}