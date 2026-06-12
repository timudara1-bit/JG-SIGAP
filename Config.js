const CONFIG = {

  APP_NAME: "JG-SIGAP",

  SHEET: {
    USER: "01_M_USER",
    ROLE: "02_M_ROLE",
    KARYAWAN: "MST_KARYAWAN"
  },

  SESSION_TIMEOUT: 8,

  ROLE: {

    // SYSTEM
    SUPERADMIN: "SUPERADMIN",
    ADMIN: "ADMIN",

    // REQUESTER
    USER: "USER",
    USER_APPROVE_L1: "USER-APPROVE-L1",
    USER_APPROVE_L2: "USER-APPROVE-L2",

    // GENERAL AFFAIR
    GA_VERIFY: "GA-VERIFY",
    GA_PP: "GA-PP",
    GA_PR: "GA-PR",
    GA_RECEIVE: "GA-RECEIVE",
    GA_INVOICE: "GA-INVOICE",
    GA_APPROVE_L1: "GA-APPROVE-L1",
    GA_APPROVE_L2: "GA-APPROVE-L2",

    // FINANCE
    FAT: "FAT",

    // INTERNAL AUDIT
    IA: "IA",

    // SUPPLY CHAIN
    SCM: "SCM",

    // PAYMENT
    PAYMENT: "PAYMENT"

  }

};

function getAppUrl() {

  return ScriptApp.getService().getUrl();

}

function getSheet(name){

  return SpreadsheetApp
    .getActive()
    .getSheetByName(name);

}

function getSheetData(name){

  const sh = getSheet(name);

  if(!sh)
    throw new Error(
      "Sheet tidak ditemukan : " + name
    );

  return sh.getDataRange().getValues();

}

function isAdmin(role){

  return [
    CONFIG.ROLE.ADMIN,
    CONFIG.ROLE.SUPERADMIN
  ].includes(role);

}

function isGA(role){

  return [

    CONFIG.ROLE.GA_VERIFY,
    CONFIG.ROLE.GA_PP,
    CONFIG.ROLE.GA_PR,
    CONFIG.ROLE.GA_RECEIVE,
    CONFIG.ROLE.GA_INVOICE

  ].includes(role);

}