function getLoaderConfig(loaderCode){

  const data = getSheetData("96_M_LOADER_CONFIG");

  for(let i=1;i<data.length;i++){

    if(data[i][0] == loaderCode){

      return {
        loader_code:data[i][0],
        loader_name:data[i][1],
        target_table:data[i][2],
        key_column:data[i][3],
        template_sheet:data[i][4]
      };

    }

  }

  throw new Error(
    "Loader tidak ditemukan : " +
    loaderCode
  );

}

function importData(loaderCode, rows){

  const config =
    getLoaderConfig(loaderCode);

  const sheet =
    SpreadsheetApp.getActive()
      .getSheetByName(
        config.target_table
      );

  const headers =
    sheet
      .getRange(
        1,
        1,
        1,
        sheet.getLastColumn()
      )
      .getValues()[0];

  const dataToInsert = [];

  for(let i=1;i<rows.length;i++){

    if(rows[i].join("") == "")
      continue;

    dataToInsert.push(rows[i]);

  }

  if(dataToInsert.length){

    sheet.getRange(
      sheet.getLastRow()+1,
      1,
      dataToInsert.length,
      dataToInsert[0].length
    ).setValues(dataToInsert);

  }

  writeImportLog(
    loaderCode,
    dataToInsert.length,
    0
  );

  return {
    success:true,
    inserted:dataToInsert.length
  };

}

function uploadModuleData(
  module,
  rows,
  fileName,
  user
){

  const config =
    getLoaderConfig(module);

  const template =
    getTemplate(module);

  const validation =
    validateHeader(
      rows[0],
      template[0]
    );

  if(!validation.valid){

    throw new Error(

      "Header tidak sesuai : "

      + validation.missing.join(", ")

    );

  }

  const dataRows =
    rows.slice(1);

  importRows(

    config.target_table,

    dataRows

  );

  writeImportLog({

    import_id:
      "IMP" + Date.now(),

    module,

    file_name:
      fileName,

    total_row:
      dataRows.length,

    success_row:
      dataRows.length,

    failed_row:0,

    user

  });

  return {

    success:true,

    total:
      dataRows.length

  };

}

function getAccessibleLoaders(){

  const user =
    getCurrentUser();

  const role =
    user.role;

  const data =
    getSheetData(
      "96_M_LOADER_CONFIG"
    );

  return data
    .slice(1)
    .filter(row => {

      const accessRole =
        row[3];

      return (

        accessRole === role ||

        role === "ADMIN" ||

        role === "SUPERADMIN"

      );

    });

}