function writeImportLog(log){

  const sh =
    getSheet("92_T_IMPORT_LOG");

  sh.appendRow([

    log.import_id,

    log.module,

    log.file_name,

    log.total_row,

    log.success_row,

    log.failed_row,

    log.user,

    new Date()

  ]);

}