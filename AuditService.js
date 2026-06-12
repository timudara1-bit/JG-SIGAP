const AuditService = {

  write(action, description = "") {

    const sh =
      SpreadsheetApp.getActive()
        .getSheetByName("AuditLog");

    if (!sh) return;

    sh.appendRow([
      new Date(),
      Session.getActiveUser().getEmail(),
      action,
      description
    ]);

  },

  log(action, description = "") {

    return this.write(
      action,
      description
    );

  }

};