function getLoaderConfig(module){

  const data =
    getSheetData("96_M_LOADER_CONFIG");

  const rows =
    data.slice(1);

  const row =
    rows.find(r => r[2] === module);

  if(!row){

    throw new Error(
      "Config loader tidak ditemukan : "
      + module
    );

  }

  return {

    loader_code: row[0],
    loader_name: row[1],
    module: row[2],

    target_table: row[3],
    target_detail_table: row[4],

    template_sheet: row[5],

    workflow_step: row[6],

    allow_update: row[7],

    active: row[8]

  };

}