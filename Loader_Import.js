function importRows(
  targetTable,
  rows
){

  const sh =
    getSheet(targetTable);

  sh.getRange(
    sh.getLastRow()+1,
    1,
    rows.length,
    rows[0].length
  ).setValues(rows);

}