function getSheetData(sheetName) {
  sheetName = typeof resolveSheetName === "function" ? resolveSheetName(sheetName) : sheetName;

  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error("Sheet tidak ditemukan: " + sheetName);
  }

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data.shift();

  return data.map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}
