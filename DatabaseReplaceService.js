function replaceOldDatabaseWithNewNoConfirm() {
  const oldSS = SpreadsheetApp.openById(
    "1nfgncJbH-IN7owk53DqeVAaMQHP9hKIwe-ADauLBZD4",
  );
  const newSS = SpreadsheetApp.openById(
    "1DmmlWS3IkuJzLY1kt7wWhtJqVU4XSwqw5q6IZsibmz0",
  );

  const backupFile = DriveApp.getFileById(
    "1nfgncJbH-IN7owk53DqeVAaMQHP9hKIwe-ADauLBZD4",
  ).makeCopy(
    "BACKUP_" +
      oldSS.getName() +
      "_" +
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "yyyyMMdd_HHmmss",
      ),
  );

  let tempSheet = oldSS.getSheetByName("_TEMP_REPLACE_");
  if (!tempSheet) {
    tempSheet = oldSS.insertSheet("_TEMP_REPLACE_");
  }

  oldSS.getSheets().forEach(function (sheet) {
    if (sheet.getName() !== "_TEMP_REPLACE_") {
      oldSS.deleteSheet(sheet);
    }
  });

  newSS.getSheets().forEach(function (sourceSheet, index) {
    const copiedSheet = sourceSheet.copyTo(oldSS);
    copiedSheet.setName(sourceSheet.getName());

    oldSS.setActiveSheet(copiedSheet);
    oldSS.moveActiveSheet(index + 1);
  });

  const temp = oldSS.getSheetByName("_TEMP_REPLACE_");
  if (temp) {
    oldSS.deleteSheet(temp);
  }

  oldSS.setActiveSheet(oldSS.getSheets()[0]);

  Logger.log("Replace database selesai.");
  Logger.log("Backup database lama: " + backupFile.getUrl());
}
