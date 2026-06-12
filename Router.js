function doGet(e){

  const page =
    e.parameter.page || "login";

  const session =
    SessionService.getSession();

  if(!session){

    return HtmlService
      .createTemplateFromFile("Page_Login")
      .evaluate()
      .setTitle("JG-SIGAP");

  }

  // Ganti bagian switch(page) di Router.gs Anda dengan ini:

  switch (page) {
    case "dashboard":
      var template = HtmlService.createTemplateFromFile("Index");
      
      // Ambil data riil dari spreadsheet dan masukkan ke template
      try {
        var liveSlaData = getSLADashboardData() || {};
        template.initialData = JSON.stringify(liveSlaData);
      } catch(err) {
        Logger.log("Gagal mengambil data SLA: " + err.message);
        template.initialData = JSON.stringify({}); // Fallback jika error
      }
      
      return template.evaluate()
        .setTitle("JG-SIGAP")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    default:
      var template = HtmlService.createTemplateFromFile("Index");
      
      // Lakukan hal yang sama untuk default route jika mengarah ke dashboard
      try {
        var liveSlaData = getSLADashboardData() || {};
        template.initialData = JSON.stringify(liveSlaData);
      } catch(err) {
        template.initialData = JSON.stringify({});
      }
      
      return template.evaluate()
        .setTitle("JG-SIGAP")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

}

function include(filename){

  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();

}

