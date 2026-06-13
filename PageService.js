function loadPage(page) {

  google.script.run
    .withSuccessHandler(function(html){

      document.getElementById(
        "content"
      ).innerHTML = html;

      initPage(page);

    })
    .getPage(page);

}

function getPage(page){

  const session = SessionService.getSession();
  if (!session) {
    throw new Error("Session tidak ditemukan. Silakan login ulang.");
  }

  const pageName = String(page || "").trim().toLowerCase();
  if (!isPageAccessible(session.role_code || session.role || "", pageName)) {
    const template = HtmlService.createTemplateFromFile("Page_AccessDenied");
    template.pageName = pageName;
    template.role = session.role_code || session.role || "Unknown";
    return template.evaluate().getContent();
  }

  let fileName = "";

  switch(pageName){

    case "dashboard":
      fileName = "Page_Dashboard";
      break;

    case "fpb":
      fileName = "Page_FPB";
      break;

    case "user-management":
      fileName = "Page_UserManagement";
      break;

    case "receive":
    case "invoice":
    case "payment":
      const template = HtmlService.createTemplateFromFile("Page_Generic");
      template.pageName = pageName;
      template.role = session.role_code || session.role || "Unknown";
      return template.evaluate().getContent();

    default:
      const template2 = HtmlService.createTemplateFromFile("Page_Generic");
      template2.pageName = pageName;
      template2.role = session.role_code || session.role || "Unknown";
      return template2.evaluate().getContent();

  }

  return HtmlService
    .createTemplateFromFile(fileName)
    .evaluate()
    .getContent();

}

function initPage(page){

  switch(page){

    case "dashboard":
      loadDashboard();
      break;

    case "fpb":
      loadFPB();
      break;

    case "user-management":
      loadUserManagement();
      break;

    case "pp":
      loadPP();
      break;

    case "pr":
      loadPR();
      break;

    case "receive":
      loadReceive();
      break;

    case "invoice":
      loadInvoice();
      break;

    case "payment":
      loadPayment();
      break;

  }

}


