/**
 * =====================================================
 * PAGE SERVICE V5
 * Public page: login/register
 * Protected page: validasi token session
 * =====================================================
 */

function getPublicPage(page) {
  if (page === "login") {
    return include("Page_Login");
  }

  if (page === "register") {
    return include("Page_Register");
  }

  return include("Page_Login");
}

function getRoleActions(roleCode) {
  const role = normalizeRoleCode(roleCode);

  const actions = {
    SUPERADMIN: [
      "view_dashboard",
      "manage_users",
      "manage_settings",
      "view_report",
      "create_fpb",
      "view_own_fpb",
      "verify_fpb",
      "draft_pp",
      "approve_pp",
      "manage_pr",
      "manage_po",
      "manage_receive",
      "manage_invoice",
      "manage_payment",
      "approval",
      "loader"
    ],
    ADMIN: [
      "view_dashboard",
      "manage_users",
      "manage_settings",
      "view_report",
      "create_fpb",
      "view_own_fpb",
      "verify_fpb",
      "draft_pp",
      "approve_pp",
      "manage_pr",
      "manage_po",
      "manage_receive",
      "manage_invoice",
      "manage_payment",
      "approval",
      "loader"
    ],
    REQUESTER: [
      "view_dashboard",
      "create_fpb",
      "view_own_fpb"
    ],
    GA_VERIFY: [
      "view_dashboard",
      "verify_fpb"
    ],
    GA_PP: [
      "view_dashboard",
      "draft_pp"
    ],
    FAT: [
      "view_dashboard",
      "approve_pp"
    ],
    IA: [
      "view_dashboard",
      "approve_pp"
    ],
    PROCUREMENT: [
      "view_dashboard",
      "create_pr",
      "manage_po",
      "manage_receive"
    ],
    WAREHOUSE: [
      "view_dashboard",
      "manage_receive"
    ],
    FINANCE: [
      "view_dashboard",
      "manage_invoice",
      "manage_payment"
    ]
  };

  return actions[role] || [];
}

function isPageAccessible(roleCode, pageName) {
  const roleActions = getRoleActions(roleCode);
  const pageActionMap = {
    "dashboard": "view_dashboard",
    "user-management": "manage_users",
    "settings": "manage_settings",
    "report": "view_report",
    "fpb": ["create_fpb", "view_own_fpb", "verify_fpb"],
    "pp-draft": "draft_pp",
    "approval-pp": "approve_pp",
    "pr": "manage_pr",
    "po": "manage_po",
    "receive": "manage_receive",
    "invoice": "manage_invoice",
    "payment": "manage_payment",
    "approval": "approval",
    "loader": "loader"
  };

  const requiredActions = pageActionMap[pageName];
  if (!requiredActions) return true; // Jika halaman tidak terdaftar, anggap bisa diakses

  if (Array.isArray(requiredActions)) {
    return requiredActions.some(action => roleActions.includes(action));
  } else {
    return roleActions.includes(requiredActions);
  }
} 


function getPage(page, token) {
  const session = SessionService.getSession(token);

  if (!session) {
    throw new Error("Session tidak ditemukan. Silakan login ulang.");
  }

  const pageName = String(page || "dashboard").trim().toLowerCase();
  const roleCode = session.role_code || session.role || "";

  if (typeof isPageAccessible === "function" && !isPageAccessible(roleCode, pageName)) {
    const template = HtmlService.createTemplateFromFile("Page_AccessDenied");
    template.pageName = pageName;
    template.role = roleCode || "Unknown";
    return template.evaluate().getContent();
  }

  let fileName = "";

  switch(pageName) {
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
    case "pr":
    case "po":
    case "settings":
    case "approval":
    case "report":
    case "loader":
    case "ga-verify":
    case "pp-draft":
    case "approval-pp":
    case "underlying":
      const template = HtmlService.createTemplateFromFile("Page_Generic");
      template.pageName = pageName;
      template.role = roleCode || "Unknown";
      return template.evaluate().getContent();

    default:
      const template2 = HtmlService.createTemplateFromFile("Page_NotFound");
      template2.pageName = pageName;
      return template2.evaluate().getContent();
  }

  return HtmlService
    .createTemplateFromFile(fileName)
    .evaluate()
    .getContent();
}
