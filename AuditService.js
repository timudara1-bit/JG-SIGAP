const AuditService = {

  /**
   * Format fleksibel:
   * write(action, description)
   * write(moduleName, recordId, action, userId, description)
   */
  write(a, b, c, d, e) {

    const sh = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.AUDIT_LOG);
    if (!sh) return;

    const moduleName = c ? a : "SYSTEM";
    const recordId = c ? b : "";
    const action = c ? c : a;
    const userId = c ? d : getActiveUserIdSafe_();
    const description = c ? e : b;

    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const rowObject = {
      audit_id: Utilities.getUuid(),
      module_name: moduleName,
      record_id: recordId,
      action: action,
      old_value: "",
      new_value: description || "",
      user_id: userId || "",
      action_date: new Date(),
      timestamp: new Date(),
      email: Session.getActiveUser().getEmail(),
      description: description || ""
    };

    const row = headers.map(h => rowObject[h] !== undefined ? rowObject[h] : "");
    sh.appendRow(row);
  },

  log(action, description = "") {
    return this.write(action, description);
  }
};

function getActiveUserIdSafe_() {
  try {
    const session = SessionService.getSession();
    return session ? session.user_id : "";
  } catch (err) {
    return "";
  }
}
