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

  let fileName = "";

  switch(page){

    case "dashboard":
      fileName = "Page_Dashboard";
      break;

    case "fpb":
      fileName = "Page_FPB";
      break;

    default:
      throw new Error(
        "Page tidak ditemukan: " +
        page
      );

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

    case "pp":
      loadPP();
      break;

    case "pr":
      loadPR();
      break;

  }

}


