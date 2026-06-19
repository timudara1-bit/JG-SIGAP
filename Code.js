function doGet(e) {
  const tpl = HtmlService.createTemplateFromFile("Index");
  tpl.appConfig = JSON.stringify({
    name: CONFIG.APP.NAME,
    version: CONFIG.APP.VERSION,
    defaultPage: CONFIG.APP.DEFAULT_PAGE,
    loginPage: CONFIG.APP.LOGIN_PAGE
  });
  return tpl.evaluate()
    .setTitle(CONFIG.APP.NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function include(filename) {
  const name = String(filename || "").replace(/\.html$/i, "");
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function getPublicPage(pageKey) {
  return Router.getPage(pageKey, true);
}

function getPage(pageKey, token) {
  const session = SessionService.validate(token);
  if (!session.success) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      html: include(CONFIG.PAGE.login.file),
      message: "Session tidak valid"
    };
  }
  return Router.getPage(pageKey, false, session.user);
}

function callApi(action, payload, token) {
  return ApiController.handle(action, payload || {}, token || "");
}
