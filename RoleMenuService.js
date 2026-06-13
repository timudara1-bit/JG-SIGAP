function getRoleMenuItems(roleCode) {
  const role = normalizeRoleCode(roleCode);

  const menus = {
    SUPERADMIN: [
      { label: "Dashboard", page: "dashboard", icon: "📊 " },
      { label: "User Management", page: "user-management", icon: "👤 " },
      { label: "Settings App", page: "settings", icon: "⚙️ " },
      { label: "Approval", page: "approval", icon: "✔️ " },
      { label: "Report", page: "report", icon: "📈 " },
      { label: "Loader", page: "loader", icon: "📤 " }
    ],
    ADMIN: [
      { label: "Dashboard", page: "dashboard", icon: "📊 " },
      { label: "User Management", page: "user-management", icon: "👤 " },
      { label: "Settings App", page: "settings", icon: "⚙️ " },
      { label: "Approval", page: "approval", icon: "✔️ " },
      { label: "Report", page: "report", icon: "📈 " },
      { label: "Loader", page: "loader", icon: "📤 " }
    ],
    REQUESTER: [
      { label: "Dashboard", page: "dashboard", icon: "📊 " },
      { label: "Form Pengajuan Barang/Jasa", page: "fpb", icon: "📝 " }
    ],
    GA_VERIFY: [
      { label: "Dashboard", page: "dashboard", icon: "📊 " },
      { label: "Verifikasi GA", page: "ga-verify", icon: "📑 " }
    ],
    GA_PP: [
      { label: "Dashboard", page: "dashboard", icon: "📊 " },
      { label: "Draft PP", page: "pp-draft", icon: "🧾 " }
    ],
    FAT: [
      { label: "Dashboard", page: "dashboard", icon: "📊 " },
      { label: "Approval PP", page: "approval-pp", icon: "✔️ " }
    ],
    IA: [
      { label: "Dashboard", page: "dashboard", icon: "📊 " },
      { label: "Approval PP", page: "approval-pp", icon: "✔️ " }
    ],
    PROCUREMENT: [
      { label: "Dashboard", page: "dashboard", icon: "📊 " },
      { label: "PR", page: "pr", icon: "🛒 " },
      { label: "PO", page: "po", icon: "📦 " },
      { label: "Receive", page: "receive", icon: "📥 " }
    ],
    WAREHOUSE: [
      { label: "Dashboard", page: "dashboard", icon: "📊 " },
      { label: "Receive", page: "receive", icon: "📥 " }
    ],
    FINANCE: [
      { label: "Dashboard", page: "dashboard", icon: "📊 " },
      { label: "Invoice", page: "invoice", icon: "🧾 " },
      { label: "Payment", page: "payment", icon: "💵 " }
    ]
  };

  return menus[role] || [{ label: "Dashboard", page: "dashboard" }];
}

function getRoleActions(roleCode) {
  const role = normalizeRoleCode(roleCode);

  const actions = {
    SUPERADMIN: [
      "view_all",
      "create_all",
      "edit_all",
      "delete_all",
      "manage_users",
      "approval",
      "loader"
    ],
    ADMIN: [
      "view_dashboard",
      "manage_users",
      "manage_vendors",
      "manage_settings",
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

function canRolePerform(roleCode, action) {
  const role = normalizeRoleCode(roleCode);
  if (role === "SUPERADMIN") {
    return true;
  }
  const roleActions = getRoleActions(roleCode);
  return roleActions.includes(action);
}

function assertRoleCan(action) {
  const session = SessionService.getSession();
  if (!session) {
    throw new Error("Session tidak ditemukan. Silakan login ulang.");
  }
  const roleCode = session.role_code || session.role || "";
  if (!canRolePerform(roleCode, action)) {
    throw new Error("Role Anda tidak memiliki izin: " + action);
  }
}

function normalizeRoleCode(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return "";

  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  switch (normalized) {
    case "SUPERADMIN":
    case "SUPER_ADMIN":
      return "SUPERADMIN";
    case "ADMIN":
      return "ADMIN";
    case "REQUESTER":
      return "REQUESTER";
    case "GA":
    case "GAVERIFY":
    case "GA_VERIFY":
      return "GA_VERIFY";
    case "GAPP":
    case "GA_PP":
      return "GA_PP";
    case "FATVERIFY":
    case "FAT":
    case "FAT_VERIFY":
      return "FAT";
    case "IAVERIFY":
    case "IA":
    case "IA_VERIFY":
      return "IA";
    case "PROCUREMENT":
      return "PROCUREMENT";
    case "WAREHOUSE":
      return "WAREHOUSE";
    case "FINANCE":
      return "FINANCE";
    default:
      return value.toUpperCase();
  }
}

function getRoleAllowedPages(roleCode) {
  const items = getRoleMenuItems(roleCode);
  const pages = items.map(item => String(item.page || "").trim().toLowerCase()).filter(Boolean);
  if (!pages.includes("dashboard")) {
    pages.unshift("dashboard");
  }
  return pages;
}

function isPageAccessible(roleCode, pageName) {
  const page = String(pageName || "").trim().toLowerCase();
  if (!page) return false;
  const allowed = getRoleAllowedPages(roleCode);
  return allowed.includes(page);
}

function logRoleRules() {
  Logger.log(JSON.stringify({ roleMenus: getRoleMenuItems("SUPERADMIN"), roleActions: getRoleActions("SUPERADMIN") }, null, 2));
  return {
    roleMenus: getRoleMenuItems("SUPERADMIN"),
    roleActions: getRoleActions("SUPERADMIN")
  };
}
