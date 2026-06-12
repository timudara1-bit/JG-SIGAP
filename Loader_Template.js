function getTemplate(module){

  const config =
    getLoaderConfig(module);

  const sh =
    getSheet(config.template_sheet);

  return sh
    .getDataRange()
    .getValues();

}