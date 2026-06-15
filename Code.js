/**
 * =====================================================
 * CODE.JS - GLOBAL SERVER BRIDGE V5
 * Function yang dipanggil langsung oleh google.script.run.
 * =====================================================
 */
function loginUser(email, password, deviceInfo) {
  return AuthService.login(email, password, deviceInfo || "WEB_BROWSER");
}

function logoutUser(token) {
  return AuthService.logout(token);
}

function getHtmlPartial(fileName) {
  return HtmlService
    .createHtmlOutputFromFile(fileName)
    .getContent();
}

function getAllSheetNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets().map(s => [s.getName()]);
}

function LIST_SHEETS() {
  return getAllSheetNames();
}
