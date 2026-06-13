class Repository {

  static getSheet(sheetName) {

    sheetName = typeof resolveSheetName === "function"
      ? resolveSheetName(sheetName)
      : sheetName;

    const sheet =
      SpreadsheetApp
        .getActiveSpreadsheet()
        .getSheetByName(sheetName);

    if (!sheet) {

      throw new Error(
        "Sheet tidak ditemukan: " +
        sheetName
      );

    }

    return sheet;

  }

  static getAll(sheetName) {

    const sheet =
      this.getSheet(sheetName);

    const data =
      sheet.getDataRange().getValues();

    const headers =
      data.shift();

    return data.map(row => {

      let obj = {};

      headers.forEach((header, i) => {
        obj[header] = row[i];
      });

      return obj;

    });

  }

  static findOne(
    sheetName,
    field,
    value
  ) {

    const data =
      this.getAll(sheetName);

    return data.find(r =>
      String(r[field] || "").trim().toLowerCase() ===
      String(value || "").trim().toLowerCase()
    );

  }

  // static insert(
  //   sheetName,
  //   data
  // ) {

  //   const sheet =
  //     this.getSheet(sheetName);

  //   const headers =
  //     sheet
  //       .getRange(
  //         1,
  //         1,
  //         1,
  //         sheet.getLastColumn()
  //       )
  //       .getValues()[0];

  //   const row =
  //     headers.map(
  //       header =>
  //         data[header] !== undefined
  //           ? data[header]
  //           : ""
  //     );

  //   sheet.appendRow(row);

  //   return true;

  // }

  static insert(sheetName, data) {

  try {

    const sheet =
      this.getSheet(sheetName);

    const headers =
      sheet
        .getRange(
          1,
          1,
          1,
          sheet.getLastColumn()
        )
        .getValues()[0];

    Logger.log(
      "HEADERS = " +
      JSON.stringify(headers)
    );

    const row =
      headers.map(header => {

        return data[header] !== undefined
          ? data[header]
          : "";

      });

    Logger.log(
      "ROW = " +
      JSON.stringify(row)
    );

    sheet.appendRow(row);

    Logger.log(
      "INSERT SUCCESS"
    );

    return true;

  } catch(err){

    Logger.log(
      "INSERT ERROR = " +
      err.message
    );

    throw err;

  }

}

  static update(
    sheetName,
    idValue,
    updateData,
    idField = "user_id"
  ) {

    const sheet =
      this.getSheet(sheetName);

    const values =
      sheet.getDataRange().getValues();

    const headers =
      values[0];

    const idCol =
      headers.indexOf(idField);

    if (idCol === -1) {

      throw new Error(
        "Field " +
        idField +
        " tidak ditemukan"
      );

    }

    for (
      let i = 1;
      i < values.length;
      i++
    ) {

      if (
        String(values[i][idCol]) ===
        String(idValue)
      ) {

        Object.keys(updateData)
          .forEach(key => {

            const col =
              headers.indexOf(key);

            if (col > -1) {

              values[i][col] =
                updateData[key];

            }

          });

        sheet
          .getRange(
            i + 1,
            1,
            1,
            headers.length
          )
          .setValues([
            values[i]
          ]);

        return true;

      }

    }

    return false;

  }

  static delete(
    sheetName,
    idValue,
    idField = "user_id"
  ) {

    const sheet =
      this.getSheet(sheetName);

    const values =
      sheet.getDataRange().getValues();

    const headers =
      values[0];

    const idCol =
      headers.indexOf(idField);

    for (
      let i = 1;
      i < values.length;
      i++
    ) {

      if (
        String(values[i][idCol]) ===
        String(idValue)
      ) {

        sheet.deleteRow(
          i + 1
        );

        return true;

      }

    }

    return false;

  }

}