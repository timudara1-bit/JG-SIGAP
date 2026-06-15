/**
 * =====================================================
 * ROUTER V5
 * Semua request dirender lewat satu shell: Index.html.
 * Page login/register/dashboard dimuat oleh SPA loader.
 * =====================================================
 */
function doGet(e) {
  const page = e && e.parameter && e.parameter.page
    ? String(e.parameter.page).trim().toLowerCase()
    : CONFIG.APP.LOGIN_PAGE;

  const token = e && e.parameter && e.parameter.token
    ? String(e.parameter.token).trim()
    : "";

  const template = HtmlService.createTemplateFromFile("Index");

  template.initialData = JSON.stringify({
    page: page,
    token: token
  });

  template.appConfig = JSON.stringify(getAppConfig());

  return template
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle(CONFIG.APP.NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}
